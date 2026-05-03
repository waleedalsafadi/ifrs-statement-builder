import { useState } from 'react';
import { AccountEntry, suggestAccountType } from '@/lib/accountUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface AdjustmentEntryProps {
  onAdd: (entry: Omit<AccountEntry, 'id' | 'type'>) => void;
  difference: number;
}

export default function AdjustmentEntry({ onAdd, difference }: AdjustmentEntryProps) {
  const [name, setName] = useState('');
  const [debit, setDebit] = useState('');
  const [credit, setCredit] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      debit: parseFloat(debit) || 0,
      credit: parseFloat(credit) || 0,
    });
    setName('');
    setDebit('');
    setCredit('');
  };

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
      <h3 className="text-sm font-bold text-destructive mb-1">⚠ الميزان غير متوازن</h3>
      <p className="text-xs text-muted-foreground mb-4">
        الفرق: {Math.abs(difference).toLocaleString('en-US', { minimumFractionDigits: 2 })} — أضف قيد تسوية لإصلاح الفرق
      </p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-muted-foreground mb-1 block">اسم الحساب</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: تسوية" className="h-9" />
        </div>
        <div className="w-32">
          <label className="text-xs text-muted-foreground mb-1 block">مدين</label>
          <Input type="number" value={debit} onChange={e => setDebit(e.target.value)} placeholder="0.00" className="h-9 font-mono" />
        </div>
        <div className="w-32">
          <label className="text-xs text-muted-foreground mb-1 block">دائن</label>
          <Input type="number" value={credit} onChange={e => setCredit(e.target.value)} placeholder="0.00" className="h-9 font-mono" />
        </div>
        <Button onClick={handleAdd} size="sm" className="h-9 gap-1">
          <Plus className="w-4 h-4" /> إضافة
        </Button>
      </div>
    </div>
  );
}
