import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BudgetItem } from '@/lib/budgetTypes';
import * as XLSX from 'xlsx';

interface Props {
  incomeAccountNames: string[];
  onBudgetLoaded: (items: BudgetItem[]) => void;
}

export default function BudgetEntry({ incomeAccountNames, onBudgetLoaded }: Props) {
  const [mode, setMode] = useState<'choose' | 'manual' | 'file'>('choose');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      let rows: string[][] = [];
      if (file.name.endsWith('.csv')) {
        rows = (data as string).split('\n').map(r => r.split(',').map(c => c.trim()));
      } else {
        const wb = XLSX.read(data, { type: 'array' });
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }) as string[][];
      }
      const budgetItems: BudgetItem[] = rows.slice(1)
        .filter(r => r[0]?.toString().trim())
        .map(r => ({
          name: r[0].toString().trim(),
          amount: parseFloat(r[1]?.toString().replace(/,/g, '') || '0') || 0,
        }));
      setItems(budgetItems);
      onBudgetLoaded(budgetItems);
      setMode('file');
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  }, [onBudgetLoaded]);

  const initManual = () => {
    const manualItems = incomeAccountNames.map(name => ({ name, amount: 0 }));
    setItems(manualItems);
    setMode('manual');
  };

  const updateItem = (index: number, amount: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], amount };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: '', amount: 0 }]);
  };

  const updateName = (index: number, name: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], name };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const submitManual = () => {
    onBudgetLoaded(items.filter(i => i.name.trim()));
  };

  if (mode === 'choose') {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-bold text-foreground mb-2">💰 إدخال الموازنة التقديرية</h3>
        <p className="text-sm text-muted-foreground mb-4">أدخل بيانات الموازنة لمقارنتها مع الأرقام الفعلية</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={initManual}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <Plus className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">إدخال يدوي</p>
            <p className="text-xs text-muted-foreground">أدخل المبالغ لكل حساب</p>
          </button>
          <label className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer">
            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">رفع ملف</p>
            <p className="text-xs text-muted-foreground">CSV أو Excel — Account, Amount</p>
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>
        </div>
      </div>
    );
  }

  if (mode === 'file') {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">الموازنة التقديرية</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setMode('choose')}>تغيير</Button>
        </div>
        <p className="text-sm text-muted-foreground">تم تحميل <span className="font-semibold text-foreground">{fileName}</span> — {items.length} بند</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">✏️ إدخال الموازنة يدوياً</h3>
          <p className="text-xs text-muted-foreground">أدخل المبلغ المتوقع لكل حساب</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMode('choose')}>إلغاء</Button>
          <Button size="sm" onClick={submitManual}>حفظ الموازنة</Button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <Input
              value={item.name}
              onChange={e => updateName(i, e.target.value)}
              placeholder="اسم الحساب"
              className="flex-1 text-sm"
            />
            <Input
              type="number"
              value={item.amount || ''}
              onChange={e => updateItem(i, parseFloat(e.target.value) || 0)}
              placeholder="المبلغ"
              className="w-36 text-sm font-mono"
              dir="ltr"
            />
            <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addItem} className="gap-1 text-xs">
          <Plus className="w-3 h-3" /> إضافة بند
        </Button>
      </div>
    </div>
  );
}
