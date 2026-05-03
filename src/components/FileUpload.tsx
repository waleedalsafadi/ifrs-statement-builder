import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AccountEntry, suggestAccountType } from '@/lib/accountUtils';

interface FileUploadProps {
  label: string;
  sublabel: string;
  onDataLoaded: (accounts: AccountEntry[]) => void;
}

function parseFile(file: File): Promise<AccountEntry[]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return resolve([]);

      let rows: string[][] = [];
      if (file.name.endsWith('.csv')) {
        const text = data as string;
        rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      } else {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      }

      const accounts: AccountEntry[] = rows.slice(1)
        .filter(row => row[0] && row[0].toString().trim())
        .map((row, i) => {
          const name = row[0]?.toString().trim() || '';
          const debit = parseFloat(row[1]?.toString().replace(/,/g, '') || '0') || 0;
          const credit = parseFloat(row[2]?.toString().replace(/,/g, '') || '0') || 0;
          return { id: `acc-${i}`, name, debit, credit, type: suggestAccountType(name) };
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
          </>
        )}
      </div>
    </div>
  );
}
