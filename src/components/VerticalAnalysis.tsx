import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  accounts: AccountEntry[];
}

export default function VerticalAnalysis({ accounts }: Props) {
  const byType = (type: string) => accounts.filter(a => a.type === type);
  const netAmount = (accs: AccountEntry[]) => accs.reduce((s, a) => s + a.debit - a.credit, 0);

  const revenue = byType('Revenue');
  const cogs = byType('COGS');
  const expenses = byType('Expense');
  const assets = byType('Asset');
  const liabilities = byType('Liability');
  const equity = byType('Equity');

  const totalRevenue = Math.abs(netAmount(revenue));
  const totalAssets = netAmount(assets);

  const pct = (val: number, base: number) => base !== 0 ? ((val / base) * 100) : 0;

  const PercentBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(Math.abs(value), 100)}%` }} />
    </div>
  );

  const IncomeRow = ({ name, amount }: { name: string; amount: number }) => {
    const p = pct(amount, totalRevenue);
    return (
      <tr className="border-t border-border hover:bg-muted/30 transition-colors">
        <td className="p-3 text-sm font-medium text-foreground">{name}</td>
        <td className="p-3 text-sm font-mono text-foreground text-left">{formatNumber(amount)}</td>
        <td className="p-3 text-sm font-mono text-left font-semibold" style={{ color: `hsl(var(--primary))` }}>{p.toFixed(1)}%</td>
        <td className="p-3"><PercentBar value={p} color="bg-primary" /></td>
      </tr>
    );
  };

  const BSRow = ({ name, amount }: { name: string; amount: number }) => {
    const p = pct(Math.abs(amount), Math.abs(totalAssets));
    return (
      <tr className="border-t border-border hover:bg-muted/30 transition-colors">
        <td className="p-3 text-sm font-medium text-foreground">{name}</td>
        <td className="p-3 text-sm font-mono text-foreground text-left">{formatNumber(Math.abs(amount))}</td>
        <td className="p-3 text-sm font-mono text-left font-semibold" style={{ color: `hsl(var(--accent))` }}>{p.toFixed(1)}%</td>
        <td className="p-3"><PercentBar value={p} color="bg-accent" /></td>
      </tr>
    );
  };

  const totalCOGS = Math.abs(netAmount(cogs));
  const totalExpenses = Math.abs(netAmount(expenses));
  const grossProfit = totalRevenue - totalCOGS;
  const netIncome = grossProfit - totalExpenses;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Statement Vertical */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">تحليل قائمة الدخل</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">كل بند كنسبة من إجمالي الإيرادات ({formatNumber(totalRevenue)})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">البند</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">المبلغ</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">النسبة</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {revenue.map(a => <IncomeRow key={a.id} name={a.name} amount={Math.abs(a.debit - a.credit)} />)}
              <tr className="bg-primary/5 font-bold">
                <td className="p-3 text-sm">إجمالي الإيرادات</td>
                <td className="p-3 text-sm font-mono text-left">{formatNumber(totalRevenue)}</td>
                <td className="p-3 text-sm font-mono text-left">100.0%</td>
                <td></td>
              </tr>
              {cogs.map(a => <IncomeRow key={a.id} name={a.name} amount={Math.abs(a.debit - a.credit)} />)}
              {cogs.length > 0 && (
                <tr className="bg-muted/50 font-semibold">
                  <td className="p-3 text-sm">مجمل الربح</td>
                  <td className="p-3 text-sm font-mono text-left">{formatNumber(grossProfit)}</td>
                  <td className="p-3 text-sm font-mono text-left">{pct(grossProfit, totalRevenue).toFixed(1)}%</td>
                  <td></td>
                </tr>
              )}
              {expenses.map(a => <IncomeRow key={a.id} name={a.name} amount={Math.abs(a.debit - a.credit)} />)}
              <tr className={`font-bold ${netIncome >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <td className="p-3 text-sm">صافي الدخل</td>
                <td className="p-3 text-sm font-mono text-left">{formatNumber(netIncome)}</td>
                <td className="p-3 text-sm font-mono text-left">{pct(netIncome, totalRevenue).toFixed(1)}%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Sheet Vertical */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-accent/5">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground">تحليل المركز المالي</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">كل بند كنسبة من إجمالي الأصول ({formatNumber(totalAssets)})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">البند</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">المبلغ</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">النسبة</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-info/5"><td colSpan={4} className="p-2 px-3 text-xs font-bold text-info">الأصول</td></tr>
              {assets.map(a => <BSRow key={a.id} name={a.name} amount={a.debit - a.credit} />)}
              <tr className="bg-info/10 font-bold">
                <td className="p-3 text-sm">إجمالي الأصول</td>
                <td className="p-3 text-sm font-mono text-left">{formatNumber(totalAssets)}</td>
                <td className="p-3 text-sm font-mono text-left">100.0%</td>
                <td></td>
              </tr>
              <tr className="bg-warning/5"><td colSpan={4} className="p-2 px-3 text-xs font-bold text-warning">الالتزامات</td></tr>
              {liabilities.map(a => <BSRow key={a.id} name={a.name} amount={a.debit - a.credit} />)}
              <tr className="bg-warning/5"><td colSpan={4} className="p-2 px-3 text-xs font-bold text-warning">حقوق الملكية</td></tr>
              {equity.map(a => <BSRow key={a.id} name={a.name} amount={a.debit - a.credit} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
