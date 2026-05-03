import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface BalanceSummaryProps {
  accounts: AccountEntry[];
}

export default function BalanceSummary({ accounts }: BalanceSummaryProps) {
  const totalDebit = accounts.reduce((sum, a) => sum + a.debit, 0);
  const totalCredit = accounts.reduce((sum, a) => sum + a.credit, 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">إجمالي المدين (Debit)</p>
        <p className="text-2xl font-bold font-mono text-foreground">{formatNumber(totalDebit)}</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">إجمالي الدائن (Credit)</p>
        <p className="text-2xl font-bold font-mono text-foreground">{formatNumber(totalCredit)}</p>
      </div>
      <div className={`rounded-xl border p-5 shadow-sm ${isBalanced ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
        <div className="flex items-center gap-2 mb-1">
          {isBalanced ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          )}
          <p className="text-sm text-muted-foreground">الحالة</p>
        </div>
        {isBalanced ? (
          <p className="text-2xl font-bold text-success">متوازن ✓</p>
        ) : (
          <p className="text-2xl font-bold text-destructive">فرق: {formatNumber(difference)}</p>
        )}
      </div>
    </div>
  );
}
