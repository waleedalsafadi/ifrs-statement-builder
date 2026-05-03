import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AccountEntry, classifyAccount, categoryToType } from '@/lib/accountUtils';

interface FileUploadProps {
  label: string;
  sublabel: string;
  onDataLoaded: (accounts: AccountEntry[]) => void;
}

// Header detection — supports columns in any order:
// account number, account name, debit, credit
function detectColumns(headerRow: any[]): { num: number; name: number; debit: number; credit: number } {
  const norm = (v: any) => (v ?? '').toString().toLowerCase().trim();
  const map: Record<string, number> = {};
  headerRow.forEach((h, i) => { map[norm(h)] = i; });
  const find = (...keys: string[]) => {
    for (const k of keys) if (k in map) return map[k];
    // fuzzy contains
    for (const [hk, idx] of Object.entries(map)) {
      if (keys.some(k => hk.includes(k))) return idx;
    }
    return -1;
  };
  const num = find('account number', 'account no', 'acc no', 'acc#', 'code', 'رقم الحساب', 'رقم', 'كود');
  const name = find('account name', 'account', 'description', 'اسم الحساب', 'الحساب', 'البيان');
  const debit = find('debit', 'dr', 'مدين');
  const credit = find('credit', 'cr', 'دائن');
  return { num, name, debit, credit };
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

      const cols = detectColumns(rows[0]);
      // Fallback positional layout: [name, debit, credit] or [number, name, debit, credit]
      const nameIdx = cols.name >= 0 ? cols.name : (cols.num >= 0 ? 1 : 0);
      const debitIdx = cols.debit >= 0 ? cols.debit : (cols.num >= 0 ? 2 : 1);
      const creditIdx = cols.credit >= 0 ? cols.credit : (cols.num >= 0 ? 3 : 2);
      const numIdx = cols.num;

      const accounts: AccountEntry[] = rows.slice(1)
        .filter(row => row && (row[nameIdx]?.toString().trim() || row[numIdx]?.toString().trim()))
        .map((row, i) => {
          const number = numIdx >= 0 ? row[numIdx]?.toString().trim() : undefined;
          const name = row[nameIdx]?.toString().trim() || number || '';
          const debit = parseFloat(row[debitIdx]?.toString().replace(/,/g, '') || '0') || 0;
          const credit = parseFloat(row[creditIdx]?.toString().replace(/,/g, '') || '0') || 0;
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
