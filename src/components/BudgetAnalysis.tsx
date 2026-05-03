import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { BudgetItem } from '@/lib/budgetTypes';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  accounts: AccountEntry[];
  budget: BudgetItem[];
}

interface Row {
  name: string;
  actual: number;
  budget: number;
  variance: number;
  variancePct: number | null;
  type: 'revenue' | 'cogs' | 'expense' | 'total';
}

export default function BudgetAnalysis({ accounts, budget }: Props) {
  const byType = (type: string) => accounts.filter(a => a.type === type);
  const netAmount = (accs: AccountEntry[]) => accs.reduce((s, a) => s + a.debit - a.credit, 0);

  const revenue = byType('Revenue');
  const cogs = byType('COGS');
  const expenses = byType('Expense');

  const budgetMap = new Map(budget.map(b => [b.name.toLowerCase().trim(), b.amount]));
  const getBudget = (name: string) => budgetMap.get(name.toLowerCase().trim()) || 0;

  const buildRows = (items: AccountEntry[], type: 'revenue' | 'cogs' | 'expense'): Row[] =>
    items.map(a => {
      const actual = Math.abs(a.debit - a.credit);
      const b = getBudget(a.name);
      const variance = actual - b;
      const variancePct = b !== 0 ? (variance / b) * 100 : null;
      return { name: a.name, actual, budget: b, variance, variancePct, type };
    });

  const revenueRows = buildRows(revenue, 'revenue');
  const cogsRows = buildRows(cogs, 'cogs');
  const expenseRows = buildRows(expenses, 'expense');

  const totalActualRevenue = revenueRows.reduce((s, r) => s + r.actual, 0);
  const totalBudgetRevenue = revenueRows.reduce((s, r) => s + r.budget, 0);
  const totalActualExpenses = expenseRows.reduce((s, r) => s + r.actual, 0);
  const totalBudgetExpenses = expenseRows.reduce((s, r) => s + r.budget, 0);
  const totalActualCOGS = cogsRows.reduce((s, r) => s + r.actual, 0);
  const totalBudgetCOGS = cogsRows.reduce((s, r) => s + r.budget, 0);

  const actualNetIncome = totalActualRevenue - totalActualCOGS - totalActualExpenses;
  const budgetNetIncome = totalBudgetRevenue - totalBudgetCOGS - totalBudgetExpenses;
  const netIncomeVariance = actualNetIncome - budgetNetIncome;

  const revenueAbove = totalActualRevenue >= totalBudgetRevenue;
  const expensesControlled = totalActualExpenses <= totalBudgetExpenses;

  const THRESHOLD = 10; // % threshold for highlighting

  const isSignificant = (pct: number | null) => pct !== null && Math.abs(pct) >= THRESHOLD;

  const VarianceCell = ({ variance, pct, favorableWhenPositive }: { variance: number; pct: number | null; favorableWhenPositive: boolean }) => {
    const isFavorable = favorableWhenPositive ? variance >= 0 : variance <= 0;
    const significant = isSignificant(pct);
    const color = significant
      ? (isFavorable ? 'text-success' : 'text-destructive')
      : 'text-foreground';
    const bgColor = significant
      ? (isFavorable ? 'bg-success/5' : 'bg-destructive/5')
      : '';

    return (
      <>
        <td className={`p-3 text-sm font-mono text-left font-semibold ${color} ${bgColor}`}>
          {variance >= 0 ? '+' : ''}{formatNumber(variance)}
        </td>
        <td className={`p-3 text-sm font-mono text-left ${color} ${bgColor}`}>
          <div className="flex items-center gap-1">
            {pct !== null ? (
              <>
                {significant && (
                  variance > 0
                    ? <ArrowUpRight className="w-4 h-4" />
                    : <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="font-semibold">{pct >= 0 ? '+' : ''}{pct.toFixed(1)}%</span>
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        </td>
      </>
    );
  };

  const SectionRows = ({ rows, favorableWhenPositive }: { rows: Row[]; favorableWhenPositive: boolean }) => (
    <>
      {rows.map((row, i) => (
        <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
          <td className="p-3 px-5 text-sm font-medium text-foreground">{row.name}</td>
          <td className="p-3 text-sm font-mono text-foreground text-left">{formatNumber(row.actual)}</td>
          <td className="p-3 text-sm font-mono text-muted-foreground text-left">{formatNumber(row.budget)}</td>
          <VarianceCell variance={row.variance} pct={row.variancePct} favorableWhenPositive={favorableWhenPositive} />
        </tr>
      ))}
    </>
  );

  const TotalRow = ({ label, actual, budget, favorableWhenPositive, bold }: { label: string; actual: number; budget: number; favorableWhenPositive: boolean; bold?: boolean }) => {
    const variance = actual - budget;
    const pct = budget !== 0 ? (variance / budget) * 100 : null;
    return (
      <tr className={`border-t-2 border-border ${bold ? 'bg-muted/60' : 'bg-muted/40'}`}>
        <td className={`p-3 px-5 text-sm ${bold ? 'font-bold' : 'font-semibold'} text-foreground`}>{label}</td>
        <td className="p-3 text-sm font-mono font-bold text-foreground text-left">{formatNumber(actual)}</td>
        <td className="p-3 text-sm font-mono font-bold text-muted-foreground text-left">{formatNumber(budget)}</td>
        <VarianceCell variance={variance} pct={pct} favorableWhenPositive={favorableWhenPositive} />
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl border p-4 ${revenueAbove ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            {revenueAbove ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
            <p className="text-sm font-semibold text-foreground">الإيرادات</p>
          </div>
          <p className={`text-lg font-bold ${revenueAbove ? 'text-success' : 'text-destructive'}`}>
            {revenueAbove ? 'أعلى من الموازنة' : 'أقل من الموازنة'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            فعلي {formatNumber(totalActualRevenue)} vs موازنة {formatNumber(totalBudgetRevenue)}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${expensesControlled ? 'bg-success/5 border-success/30' : 'bg-warning/5 border-warning/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            {expensesControlled ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
            <p className="text-sm font-semibold text-foreground">المصروفات</p>
          </div>
          <p className={`text-lg font-bold ${expensesControlled ? 'text-success' : 'text-warning'}`}>
            {expensesControlled ? 'تحت السيطرة' : 'تجاوزت الموازنة'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            فعلي {formatNumber(totalActualExpenses)} vs موازنة {formatNumber(totalBudgetExpenses)}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${netIncomeVariance >= 0 ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            {netIncomeVariance >= 0 ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
            <p className="text-sm font-semibold text-foreground">صافي الدخل</p>
          </div>
          <p className={`text-lg font-bold font-mono ${netIncomeVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
            {netIncomeVariance >= 0 ? '+' : ''}{formatNumber(netIncomeVariance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">انحراف عن الموازنة</p>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-primary/5">
          <h3 className="text-lg font-bold text-foreground">📋 تحليل الموازنة — Actual vs Budget</h3>
          <p className="text-xs text-muted-foreground mt-1">
            الانحرافات ≥ {THRESHOLD}% مُبرزة بالألوان — <span className="text-success font-semibold">أخضر = إيجابي</span> / <span className="text-destructive font-semibold">أحمر = سلبي</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right text-xs font-semibold text-muted-foreground p-3 px-5">البند</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Actual</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Budget</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Variance</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Variance %</th>
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr className="bg-success/5">
                <td colSpan={5} className="p-2 px-5 text-xs font-bold text-success">الإيرادات — Revenue</td>
              </tr>
              <SectionRows rows={revenueRows} favorableWhenPositive={true} />
              <TotalRow label="إجمالي الإيرادات" actual={totalActualRevenue} budget={totalBudgetRevenue} favorableWhenPositive={true} />

              {/* COGS */}
              {cogsRows.length > 0 && (
                <>
                  <tr className="bg-destructive/5">
                    <td colSpan={5} className="p-2 px-5 text-xs font-bold text-destructive">تكلفة المبيعات — COGS</td>
                  </tr>
                  <SectionRows rows={cogsRows} favorableWhenPositive={false} />
                  <TotalRow label="إجمالي تكلفة المبيعات" actual={totalActualCOGS} budget={totalBudgetCOGS} favorableWhenPositive={false} />
                </>
              )}

              {/* Expenses */}
              <tr className="bg-warning/5">
                <td colSpan={5} className="p-2 px-5 text-xs font-bold text-warning">المصروفات — Expenses</td>
              </tr>
              <SectionRows rows={expenseRows} favorableWhenPositive={false} />
              <TotalRow label="إجمالي المصروفات" actual={totalActualExpenses} budget={totalBudgetExpenses} favorableWhenPositive={false} />

              {/* Net Income */}
              <TotalRow label="صافي الدخل — Net Income" actual={actualNetIncome} budget={budgetNetIncome} favorableWhenPositive={true} bold />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
