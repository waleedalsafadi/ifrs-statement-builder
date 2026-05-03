import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AccountEntry, classifyAccount, categoryToType, extractAccountNumber, normalizeAccountNumber } from '@/lib/accountUtils';

interface FileUploadProps {
  label: string;
  sublabel: string;
  onDataLoaded: (accounts: AccountEntry[]) => void;
}

// Header detection — supports columns in any order:
// account number, account name, debit, credit
function detectColumnsFromHeader(headerRow: any[]): { num: number; name: number; debit: number; credit: number } {
  const norm = (v: any) => (v ?? '').toString().toLowerCase().trim();
  const map: Record<string, number> = {};
  headerRow.forEach((h, i) => { map[norm(h)] = i; });
  const find = (...keys: string[]) => {
    for (const k of keys) if (k in map) return map[k];
    for (const [hk, idx] of Object.entries(map)) {
      if (hk && keys.some(k => hk.includes(k))) return idx;
    }
    return -1;
  };
  const num = find('account number', 'account no', 'acc no', 'acc#', 'code', 'رقم الحساب', 'رقم', 'كود', 'no.', 'no');
  const name = find('account name', 'account', 'description', 'اسم الحساب', 'الحساب', 'البيان', 'الاسم', 'name');
  const debit = find('debit', 'dr', 'مدين');
  const credit = find('credit', 'cr', 'دائن');
  return { num, name, debit, credit };
}

// Content-based detection: scan data rows to identify each column by its values
function detectColumnsFromContent(rows: any[][]): { num: number; name: number; debit: number; credit: number } {
  const sample = rows.slice(0, Math.min(rows.length, 30));
  const colCount = Math.max(0, ...sample.map(r => r?.length || 0));
  const stats = Array.from({ length: colCount }, () => ({ numeric: 0, accountCode: 0, text: 0, total: 0 }));

  for (const row of sample) {
    if (!row) continue;
    for (let c = 0; c < colCount; c++) {
      const raw = row[c];
      if (raw === undefined || raw === null || raw.toString().trim() === '') continue;
      const v = raw.toString().trim();
      stats[c].total++;
      // Account code: digits with optional separators ( - . / ), total digit length 3-12
      const digitsOnly = v.replace(/[^\d]/g, '');
      if (/^[\d\-./]+$/.test(v) && digitsOnly.length >= 3 && digitsOnly.length <= 12) stats[c].accountCode++;
      const cleaned = v.replace(/,/g, '');
      if (!isNaN(parseFloat(cleaned)) && /^[-(]?[\d,]+\.?\d*\)?$/.test(v)) {
        stats[c].numeric++;
      } else if (!/^[\d.,\-()]+$/.test(v)) {
        stats[c].text++;
      }
    }
  }

  let num = -1, numScore = 0;
  stats.forEach((s, i) => {
    if (s.total === 0) return;
    const score = s.accountCode / s.total;
    if (score > 0.6 && score > numScore) { numScore = score; num = i; }
  });

  let name = -1, nameScore = 0;
  stats.forEach((s, i) => {
    if (s.total === 0 || i === num) return;
    const score = s.text / s.total;
    if (score > 0.4 && score > nameScore) { nameScore = score; name = i; }
  });

  const moneyCols = stats
    .map((s, i) => ({ i, s }))
    .filter(({ i, s }) => i !== num && i !== name && s.total > 0 && s.numeric / s.total > 0.5)
    .sort((a, b) => a.i - b.i);

  let debit = -1, credit = -1;
  if (moneyCols.length >= 2) {
    debit = moneyCols[0].i;
    credit = moneyCols[1].i;
  } else if (moneyCols.length === 1) {
    debit = moneyCols[0].i;
  }
  return { num, name, debit, credit };
}

function isHeaderRow(row: any[]): boolean {
  if (!row) return false;
  const cells = row.filter(c => c !== undefined && c !== null && c.toString().trim() !== '');
  if (cells.length === 0) return false;
  const textLike = cells.filter(c => {
    const v = c.toString().trim();
    return !/^[-(]?[\d,]+\.?\d*\)?$/.test(v) && !/^\d+$/.test(v);
  }).length;
  return textLike / cells.length >= 0.5;
}

function parseFile(file: File): Promise<AccountEntry[]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return resolve([]);

      let rows: any[][] = [];
      if (file.name.endsWith('.csv')) {
        const text = data as string;
        rows = text.split(/\r?\n/).map(row => row.split(',').map(c => c.trim()));
      } else {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      }
      if (rows.length === 0) return resolve([]);

      const headerExists = isHeaderRow(rows[0]);
      const dataRows = headerExists ? rows.slice(1) : rows;
      const headerCols = headerExists
        ? detectColumnsFromHeader(rows[0])
        : { num: -1, name: -1, debit: -1, credit: -1 };
      const contentCols = detectColumnsFromContent(dataRows);
      const cols = {
        num: headerCols.num >= 0 ? headerCols.num : contentCols.num,
        name: headerCols.name >= 0 ? headerCols.name : contentCols.name,
        debit: headerCols.debit >= 0 ? headerCols.debit : contentCols.debit,
        credit: headerCols.credit >= 0 ? headerCols.credit : contentCols.credit,
      };

      // Final fallbacks: positional layout
      const numIdx = cols.num;
      const nameIdx = cols.name >= 0 ? cols.name : (numIdx >= 0 ? (numIdx === 0 ? 1 : 0) : 0);
      const debitIdx = cols.debit >= 0 ? cols.debit : 2;
      const creditIdx = cols.credit >= 0 ? cols.credit : 3;

      const accounts: AccountEntry[] = dataRows
        .filter(row => row && (row[nameIdx]?.toString().trim() || (numIdx >= 0 && row[numIdx]?.toString().trim())))
        .map((row, i) => {
          const rawNum = numIdx >= 0 ? row[numIdx]?.toString().trim() : undefined;
          const rawName = row[nameIdx]?.toString().trim() || '';
          const number = normalizeAccountNumber(rawNum) ?? extractAccountNumber(rawName);
          const name = rawName || number || '';
          const debit = parseFloat(row[debitIdx]?.toString().replace(/[,()]/g, '') || '0') || 0;
          const credit = parseFloat(row[creditIdx]?.toString().replace(/[,()]/g, '') || '0') || 0;
          const category = classifyAccount(name, number);
          return {
            id: `acc-${i}`,
            number,
            name,
            debit,
            credit,
            type: categoryToType(category),
            category,
          };
        });
      resolve(accounts);
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
}

export default function FileUpload({ label, sublabel, onDataLoaded }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const accounts = await parseFile(file);
    onDataLoaded(accounts);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const inputId = `file-input-${(label || 'default').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-')}`;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
        ${dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
      `}
      onClick={() => document.getElementById(inputId)?.click()}
    >
      <input id={inputId} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          {fileName ? <FileSpreadsheet className="w-6 h-6 text-primary" /> : <Upload className="w-6 h-6 text-primary" />}
        </div>
        {fileName ? (
          <>
            <p className="text-base font-semibold text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">اضغط للاستبدال</p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sublabel}</p>
            <p className="text-[11px] text-muted-foreground/80">الأعمدة: رقم الحساب (اختياري) / اسم الحساب / مدين / دائن</p>
          </>
        )}
      </div>
    </div>
  );
}
