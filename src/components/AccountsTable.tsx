import { AccountEntry, AccountType, formatNumber } from '@/lib/accountUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ACCOUNT_TYPES: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense'];

const TYPE_LABELS: Record<AccountType, string> = {
  Asset: 'أصول',
  Liability: 'التزامات',
  Equity: 'حقوق ملكية',
  Revenue: 'إيرادات',
  COGS: 'تكلفة المبيعات',
  Expense: 'مصروفات',
};

const TYPE_COLORS: Record<AccountType, string> = {
  Asset: 'bg-info/10 text-info',
  Liability: 'bg-warning/10 text-warning',
  Equity: 'bg-accent/10 text-accent',
  Revenue: 'bg-success/10 text-success',
  COGS: 'bg-destructive/10 text-destructive',
  Expense: 'bg-muted text-muted-foreground',
};

interface AccountsTableProps {
  accounts: AccountEntry[];
  onUpdateType: (id: string, type: AccountType) => void;
}

export default function AccountsTable({ accounts, onUpdateType }: AccountsTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">تصنيف الحسابات</h2>
        <p className="text-sm text-muted-foreground mt-1">راجع وعدّل نوع كل حساب قبل إنشاء القوائم المالية</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3 px-5">#</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">اسم الحساب</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">مدين</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">دائن</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3 px-5">نوع الحساب</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, i) => (
              <tr key={acc.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-3 px-5 text-sm text-muted-foreground">{i + 1}</td>
                <td className="p-3 text-sm font-medium text-foreground">{acc.name}</td>
                <td className="p-3 text-sm font-mono text-foreground">{formatNumber(acc.debit)}</td>
                <td className="p-3 text-sm font-mono text-foreground">{formatNumber(acc.credit)}</td>
                <td className="p-3 px-5">
                  <Select value={acc.type} onValueChange={(val) => onUpdateType(acc.id, val as AccountType)}>
                    <SelectTrigger className="h-8 text-xs w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[type]}`}>
                            {TYPE_LABELS[type]} ({type})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
