import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { BudgetItem } from '@/lib/budgetTypes';
import {
  TrendingUp, TrendingDown, DollarSign, Percent, Receipt, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus, ShieldAlert, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

interface Props {
  currentAccounts: AccountEntry[];
  previousAccounts: AccountEntry[] | null;
  budget: BudgetItem[] | null;
}

function calcMetrics(accounts: AccountEntry[]) {
  const byType = (t: string) => accounts.filter(a => a.type === t);
  const net = (accs: AccountEntry[]) => accs.reduce((s, a) => s + a.debit - a.credit, 0);
  const totalRevenue = Math.abs(net(byType('Revenue')));
  const totalCOGS = Math.abs(net(byType('COGS')));
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = Math.abs(net(byType('Expense')));
  const netIncome = grossProfit - totalExpenses;
  const profitMargin = totalRevenue ? (netIncome / totalRevenue) * 100 : 0;
  const grossMargin = totalRevenue ? (grossProfit / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue ? (totalExpenses / totalRevenue) * 100 : 0;
  const totalAssets = net(byType('Asset'));
  const totalLiabilities = Math.abs(net(byType('Liability')));
  return { totalRevenue, totalCOGS, grossProfit, totalExpenses, netIncome, profitMargin, grossMargin, expenseRatio, totalAssets, totalLiabilities };
}

export default function Dashboard({ currentAccounts, previousAccounts, budget }: Props) {
  const curr = calcMetrics(currentAccounts);
  const prev = previousAccounts ? calcMetrics(previousAccounts) : null;

  const budgetMap = budget ? new Map(budget.map(b => [b.name.toLowerCase().trim(), b.amount])) : null;
  const budgetRevenue = budgetMap ? currentAccounts.filter(a => a.type === 'Revenue').reduce((s, a) => s + (budgetMap.get(a.name.toLowerCase().trim()) || 0), 0) : null;
  const budgetExpenses = budgetMap ? currentAccounts.filter(a => a.type === 'Expense').reduce((s, a) => s + (budgetMap.get(a.name.toLowerCase().trim()) || 0), 0) : null;

  // KPI Data
  const kpis = [
    {
      title: 'الإيرادات',
      titleEn: 'Revenue',
      value: curr.totalRevenue,
      prevValue: prev?.totalRevenue ?? null,
      budgetValue: budgetRevenue,
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
      format: 'currency' as const,
    },
    {
      title: 'صافي الربح',
      titleEn: 'Net Profit',
      value: curr.netIncome,
      prevValue: prev?.netIncome ?? null,
      budgetValue: budgetRevenue !== null && budgetExpenses !== null ? budgetRevenue - budgetExpenses : null,
      icon: TrendingUp,
      color: curr.netIncome >= 0 ? 'text-success' : 'text-destructive',
      bg: curr.netIncome >= 0 ? 'bg-success/10' : 'bg-destructive/10',
      format: 'currency' as const,
    },
    {
      title: 'هامش الربح',
      titleEn: 'Profit Margin',
      value: curr.profitMargin,
      prevValue: prev?.profitMargin ?? null,
      budgetValue: null,
      icon: Percent,
      color: curr.profitMargin >= 15 ? 'text-success' : curr.profitMargin >= 5 ? 'text-warning' : 'text-destructive',
      bg: curr.profitMargin >= 15 ? 'bg-success/10' : curr.profitMargin >= 5 ? 'bg-warning/10' : 'bg-destructive/10',
      format: 'pct' as const,
    },
    {
      title: 'المصروفات',
      titleEn: 'Expenses',
      value: curr.totalExpenses,
      prevValue: prev?.totalExpenses ?? null,
      budgetValue: budgetExpenses,
      icon: Receipt,
      color: 'text-warning',
      bg: 'bg-warning/10',
      format: 'currency' as const,
    },
  ];

  // Chart data
  const chartData = [
    {
      name: 'الإيرادات',
      current: curr.totalRevenue,
      ...(prev ? { previous: prev.totalRevenue } : {}),
      ...(budgetRevenue !== null ? { budget: budgetRevenue } : {}),
    },
    {
      name: 'المصروفات',
      current: curr.totalExpenses,
      ...(prev ? { previous: prev.totalExpenses } : {}),
      ...(budgetExpenses !== null ? { budget: budgetExpenses } : {}),
    },
    {
      name: 'مجمل الربح',
      current: curr.grossProfit,
      ...(prev ? { previous: prev.grossProfit } : {}),
    },
    {
      name: 'صافي الربح',
      current: curr.netIncome,
      ...(prev ? { previous: prev.netIncome } : {}),
    },
  ];

  const marginData = [
    { name: 'هامش إجمالي', current: curr.grossMargin, ...(prev ? { previous: prev.grossMargin } : {}) },
    { name: 'هامش صافي', current: curr.profitMargin, ...(prev ? { previous: prev.profitMargin } : {}) },
    { name: 'نسبة المصروفات', current: curr.expenseRatio, ...(prev ? { previous: prev.expenseRatio } : {}) },
  ];

  // Alerts
  const alerts: { type: 'warning' | 'danger' | 'info'; message: string }[] = [];
  if (curr.expenseRatio > 70) alerts.push({ type: 'danger', message: `نسبة المصروفات مرتفعة جداً (${curr.expenseRatio.toFixed(1)}%) — تحتاج مراجعة عاجلة` });
  else if (curr.expenseRatio > 50) alerts.push({ type: 'warning', message: `نسبة المصروفات مرتفعة (${curr.expenseRatio.toFixed(1)}%) — يُنصح بتقليلها` });
  if (curr.profitMargin < 5) alerts.push({ type: 'danger', message: `هامش الربح منخفض جداً (${curr.profitMargin.toFixed(1)}%) — الأرباح في خطر` });
  else if (curr.profitMargin < 15) alerts.push({ type: 'warning', message: `هامش الربح متوسط (${curr.profitMargin.toFixed(1)}%) — هناك فرصة للتحسين` });
  if (curr.netIncome < 0) alerts.push({ type: 'danger', message: 'الشركة تحقق خسائر — يجب مراجعة هيكل التكاليف والإيرادات' });
  if (prev) {
    const revChange = ((curr.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100;
    if (revChange < -10) alerts.push({ type: 'warning', message: `انخفاض الإيرادات بنسبة ${Math.abs(revChange).toFixed(1)}% مقارنة بالفترة السابقة` });
    const expChange = ((curr.totalExpenses - prev.totalExpenses) / prev.totalExpenses) * 100;
    if (expChange > 20) alerts.push({ type: 'warning', message: `ارتفاع المصروفات بنسبة ${expChange.toFixed(1)}% مقارنة بالفترة السابقة` });
  }
  if (budgetExpenses !== null && curr.totalExpenses > budgetExpenses * 1.1) {
    alerts.push({ type: 'warning', message: `المصروفات تجاوزت الموازنة بنسبة ${(((curr.totalExpenses - budgetExpenses) / budgetExpenses) * 100).toFixed(1)}%` });
  }
  if (alerts.length === 0) alerts.push({ type: 'info', message: 'الوضع المالي مستقر — لا توجد تنبيهات حرجة ✓' });

  const ComparisonBadge = ({ current, previous, inverse }: { current: number; previous: number | null; inverse?: boolean }) => {
    if (previous === null || previous === 0) return null;
    const change = ((current - previous) / Math.abs(previous)) * 100;
    const isPositive = inverse ? change < 0 : change > 0;
    if (Math.abs(change) < 0.1) return <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Minus className="w-3 h-3" /> بدون تغيير</span>;
    return (
      <span className={`text-xs font-semibold flex items-center gap-0.5 ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {Math.abs(change).toFixed(1)}% vs السابقة
      </span>
    );
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm" dir="rtl">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-foreground flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="font-mono font-semibold">{formatNumber(p.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.titleEn} className="bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-muted-foreground">{kpi.title}</p>
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono ${kpi.color}`}>
              {kpi.format === 'pct' ? `${kpi.value.toFixed(1)}%` : formatNumber(kpi.value)}
            </p>
            <div className="mt-2 space-y-1">
              <ComparisonBadge current={kpi.value} previous={kpi.prevValue} inverse={kpi.titleEn === 'Expenses'} />
              {kpi.budgetValue !== null && (
                <span className={`text-xs flex items-center gap-0.5 ${
                  kpi.titleEn === 'Expenses'
                    ? (kpi.value <= kpi.budgetValue ? 'text-success' : 'text-destructive')
                    : (kpi.value >= kpi.budgetValue ? 'text-success' : 'text-destructive')
                }`}>
                  {kpi.titleEn === 'Expenses'
                    ? (kpi.value <= kpi.budgetValue ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />)
                    : (kpi.value >= kpi.budgetValue ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />)
                  }
                  vs الموازنة: {formatNumber(kpi.budgetValue)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                alert.type === 'danger' ? 'bg-destructive/5 border-destructive/30' :
                alert.type === 'warning' ? 'bg-warning/5 border-warning/30' :
                'bg-success/5 border-success/30'
              }`}
            >
              {alert.type === 'danger' ? <ShieldAlert className="w-5 h-5 text-destructive shrink-0" /> :
               alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-warning shrink-0" /> :
               <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
              <p className={`text-sm font-medium ${
                alert.type === 'danger' ? 'text-destructive' :
                alert.type === 'warning' ? 'text-warning' :
                'text-success'
              }`}>
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue/Expenses/Profit Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-base font-bold text-foreground">📊 المقارنة المالية</h3>
            <p className="text-xs text-muted-foreground mt-0.5">الإيرادات، المصروفات، والأرباح</p>
          </div>
          <div className="p-4" dir="ltr">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="current" name="الفترة الحالية" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                {prev && <Bar dataKey="previous" name="الفترة السابقة" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />}
                {budgetRevenue !== null && <Bar dataKey="budget" name="الموازنة" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} opacity={0.6} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margins Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-base font-bold text-foreground">📈 نسب الربحية</h3>
            <p className="text-xs text-muted-foreground mt-0.5">هوامش الربح ونسبة المصروفات (%)</p>
          </div>
          <div className="p-4" dir="ltr">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marginData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="current" name="الفترة الحالية" radius={[4, 4, 0, 0]}>
                  {marginData.map((entry, i) => (
                    <Cell key={i} fill={i === 2 ? 'hsl(var(--warning))' : i === 0 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                  ))}
                </Bar>
                {prev && <Bar dataKey="previous" name="الفترة السابقة" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.4} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Expenses Breakdown */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">💸 أعلى المصروفات</h3>
          <p className="text-xs text-muted-foreground mt-0.5">ترتيب المصروفات من الأعلى للأقل</p>
        </div>
        <div className="p-5 space-y-3">
          {currentAccounts
            .filter(a => a.type === 'Expense')
            .map(a => ({ name: a.name, amount: Math.abs(a.debit - a.credit) }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 8)
            .map((item, i) => {
              const pct = curr.totalExpenses ? (item.amount / curr.totalExpenses) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-40 truncate">{item.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-warning transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-semibold text-foreground w-24 text-left">{formatNumber(item.amount)}</span>
                  <span className="text-xs text-muted-foreground w-12 text-left">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
