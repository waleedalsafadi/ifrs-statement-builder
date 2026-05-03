import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  accounts: AccountEntry[];
}

export default function FinancialStatements({ accounts }: Props) {
  const byType = (type: string) => accounts.filter(a => a.type === type);
  const netAmount = (accs: AccountEntry[]) => accs.reduce((s, a) => s + a.debit - a.credit, 0);

  const revenue = byType('Revenue');
  const cogs = byType('COGS');
  const expenses = byType('Expense');
  const assets = byType('Asset');
  const liabilities = byType('Liability');
  const equity = byType('Equity');

  const totalRevenue = Math.abs(netAmount(revenue));
  const totalCOGS = Math.abs(netAmount(cogs));
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = Math.abs(netAmount(expenses));
  const netIncome = grossProfit - totalExpenses;

  const totalAssets = netAmount(assets);
  const totalLiabilities = Math.abs(netAmount(liabilities));
  const totalEquity = Math.abs(netAmount(equity)) + netIncome;
  const balanceCheck = Math.abs(totalAssets - (totalLiabilities + totalEquity));
  const isBalanceValid = balanceCheck < 0.01;

  const Section = ({ title, items, total, totalLabel }: { title: string; items: AccountEntry[]; total: number; totalLabel: string }) => (
    <div className="mb-4">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
      {items.map(a => (
        <div key={a.id} className="flex justify-between py-1.5 px-2 text-sm hover:bg-muted/30 rounded">
          <span className="text-foreground">{a.name}</span>
          <span className="font-mono text-foreground">{formatNumber(Math.abs(a.debit - a.credit))}</span>
        </div>
      ))}
      <div className="flex justify-between py-2 px-2 mt-1 border-t border-border font-bold text-sm">
        <span className="text-foreground">{totalLabel}</span>
        <span className="font-mono text-foreground">{formatNumber(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Statement */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-primary/5">
          <h3 className="text-lg font-bold text-foreground">📊 قائمة الدخل</h3>
          <p className="text-xs text-muted-foreground">Income Statement</p>
        </div>
        <div className="p-5">
          <Section title="الإيرادات — Revenue" items={revenue} total={totalRevenue} totalLabel="إجمالي الإيرادات" />
          {cogs.length > 0 && (
            <>
              <Section title="تكلفة المبيعات — COGS" items={cogs} total={totalCOGS} totalLabel="إجمالي تكلفة المبيعات" />
              <div className="flex justify-between py-2 px-2 mb-4 bg-muted/50 rounded font-bold text-sm">
                <span>مجمل الربح (Gross Profit)</span>
                <span className="font-mono">{formatNumber(grossProfit)}</span>
              </div>
            </>
          )}
          <Section title="المصروفات — Expenses" items={expenses} total={totalExpenses} totalLabel="إجمالي المصروفات" />
          <div className={`flex justify-between py-3 px-3 rounded-lg font-bold text-base mt-2 ${netIncome >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            <span>صافي الدخل (Net Income)</span>
            <span className="font-mono">{formatNumber(netIncome)}</span>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-accent/5">
          <h3 className="text-lg font-bold text-foreground">🏦 قائمة المركز المالي</h3>
          <p className="text-xs text-muted-foreground">Balance Sheet</p>
        </div>
        <div className="p-5">
          <Section title="الأصول — Assets" items={assets} total={totalAssets} totalLabel="إجمالي الأصول" />
          <Section title="الالتزامات — Liabilities" items={liabilities} total={totalLiabilities} totalLabel="إجمالي الالتزامات" />

          <div className="mb-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">حقوق الملكية — Equity</h4>
            {equity.map(a => (
              <div key={a.id} className="flex justify-between py-1.5 px-2 text-sm hover:bg-muted/30 rounded">
                <span className="text-foreground">{a.name}</span>
                <span className="font-mono text-foreground">{formatNumber(Math.abs(a.debit - a.credit))}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 px-2 text-sm text-accent font-medium">
              <span>صافي الدخل (Net Income)</span>
              <span className="font-mono">{formatNumber(netIncome)}</span>
            </div>
            <div className="flex justify-between py-2 px-2 mt-1 border-t border-border font-bold text-sm">
              <span>إجمالي حقوق الملكية</span>
              <span className="font-mono">{formatNumber(totalEquity)}</span>
            </div>
          </div>

          <div className={`flex items-center justify-between py-3 px-3 rounded-lg font-bold text-base mt-2 ${isBalanceValid ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            <div className="flex items-center gap-2">
              {isBalanceValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>A = L + E</span>
            </div>
            <span className="font-mono">
              {formatNumber(totalAssets)} = {formatNumber(totalLiabilities + totalEquity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
