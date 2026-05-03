import { AccountEntry, AccountCategory, CATEGORY_LABELS_AR, formatNumber, categoryToType } from '@/lib/accountUtils';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORY_GROUPS: { label: string; cats: AccountCategory[] }[] = [
  { label: 'الأصول غير المتداولة', cats: ['NCA_PPE', 'NCA_ROU', 'NCA_Intangible', 'NCA_Investment', 'NCA_DeferredTax', 'NCA_Other'] },
  { label: 'الأصول المتداولة', cats: ['CA_Cash', 'CA_Receivables', 'CA_Inventory', 'CA_Prepayments', 'CA_Other'] },
  { label: 'الالتزامات غير المتداولة', cats: ['NCL_LongTermDebt', 'NCL_LeaseLiability', 'NCL_Provisions', 'NCL_DeferredTaxLiability', 'NCL_Other'] },
  { label: 'الالتزامات المتداولة', cats: ['CL_Payables', 'CL_ShortTermBorrowings', 'CL_Accruals', 'CL_CurrentPortionLTD', 'CL_Other'] },
  { label: 'حقوق الملكية', cats: ['EQ_ShareCapital', 'EQ_APIC', 'EQ_RetainedEarnings', 'EQ_OtherReserves'] },
  { label: 'الإيرادات', cats: ['REV_Operating', 'REV_Other'] },
  { label: 'تكلفة الإيراد والمصروفات', cats: ['COGS', 'OPEX_Selling', 'OPEX_GA', 'OPEX_DA'] },
  { label: 'التمويل والضرائب', cats: ['FIN_Income', 'FIN_Cost', 'TAX_Income'] },
  { label: 'حسابات نظامية', cats: ['MEMO'] },
];

const TYPE_COLOR: Record<string, string> = {
  Asset: 'bg-info/10 text-info',
  Liability: 'bg-warning/10 text-warning',
  Equity: 'bg-accent/10 text-accent',
  Revenue: 'bg-success/10 text-success',
  COGS: 'bg-destructive/10 text-destructive',
  Expense: 'bg-muted text-muted-foreground',
};

interface AccountsTableProps {
  accounts: AccountEntry[];
  onUpdateCategory: (id: string, category: AccountCategory) => void;
}

export default function AccountsTable({ accounts, onUpdateCategory }: AccountsTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">تصنيف الحسابات (IFRS)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          التصنيف يستند لرقم الحساب (Prefix) أو الاسم — راجع وعدّل البند المحاسبي قبل إنشاء القوائم
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3 px-5">#</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">رقم الحساب</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">اسم الحساب</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">مدين</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">دائن</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3 px-5">البند المحاسبي (IFRS)</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, i) => {
              const t = categoryToType(acc.category);
              return (
                <tr key={acc.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 px-5 text-sm text-muted-foreground">{i + 1}</td>
                  <td className="p-3 text-sm font-mono text-muted-foreground">{acc.number || '—'}</td>
                  <td className="p-3 text-sm font-medium text-foreground">{acc.name}</td>
                  <td className="p-3 text-sm font-mono text-foreground">{formatNumber(acc.debit)}</td>
                  <td className="p-3 text-sm font-mono text-foreground">{formatNumber(acc.credit)}</td>
                  <td className="p-3 px-5">
                    <Select value={acc.category} onValueChange={(val) => onUpdateCategory(acc.id, val as AccountCategory)}>
                      <SelectTrigger className="h-8 text-xs w-64">
                        <SelectValue>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLOR[t]}`}>
                            {CATEGORY_LABELS_AR[acc.category]}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        {CATEGORY_GROUPS.map(group => (
                          <SelectGroup key={group.label}>
                            <SelectLabel className="text-xs text-muted-foreground">{group.label}</SelectLabel>
                            {group.cats.map(cat => (
                              <SelectItem key={cat} value={cat} className="text-xs">
                                {CATEGORY_LABELS_AR[cat]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
