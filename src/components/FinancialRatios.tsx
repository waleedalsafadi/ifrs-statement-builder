import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  currentAccounts: AccountEntry[];
  previousAccounts: AccountEntry[] | null;
}

interface Ratio {
  name: string;
  nameAr: string;
  current: number;
  previous: number | null;
  format: 'pct' | 'number';
  description: string;
}

export default function FinancialRatios({ currentAccounts, previousAccounts }: Props) {
  const calc = (accounts: AccountEntry[]) => {
    const byType = (type: string) => accounts.filter(a => a.type === type);
    const netAmount = (accs: AccountEntry[]) => accs.reduce((s, a) => s + a.debit - a.credit, 0);

    const totalRevenue = Math.abs(netAmount(byType('Revenue')));
    const totalCOGS = Math.abs(netAmount(byType('COGS')));
    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = Math.abs(netAmount(byType('Expense')));
    const netIncome = grossProfit - totalExpenses;
    const totalAssets = netAmount(byType('Asset'));
    const totalLiabilities = Math.abs(netAmount(byType('Liability')));
    const totalEquity = Math.abs(netAmount(byType('Equity'))) + netIncome;

    return { totalRevenue, totalCOGS, grossProfit, totalExpenses, netIncome, totalAssets, totalLiabilities, totalEquity };
  };

  const c = calc(currentAccounts);
  const p = previousAccounts ? calc(previousAccounts) : null;

  const ratios: Ratio[] = [
    {
      name: 'Gross Profit Margin',
      nameAr: 'هامش الربح الإجمالي',
      current: c.totalRevenue ? (c.grossProfit / c.totalRevenue) * 100 : 0,
      previous: p && p.totalRevenue ? (p.grossProfit / p.totalRevenue) * 100 : null,
      format: 'pct',
      description: 'مجمل الربح ÷ الإيرادات',
    },
    {
      name: 'Net Profit Margin',
      nameAr: 'هامش صافي الربح',
      current: c.totalRevenue ? (c.netIncome / c.totalRevenue) * 100 : 0,
      previous: p && p.totalRevenue ? (p.netIncome / p.totalRevenue) * 100 : null,
      format: 'pct',
      description: 'صافي الدخل ÷ الإيرادات',
    },
    {
      name: 'Expense Ratio',
      nameAr: 'نسبة المصروفات',
      current: c.totalRevenue ? (c.totalExpenses / c.totalRevenue) * 100 : 0,
      previous: p && p.totalRevenue ? (p.totalExpenses / p.totalRevenue) * 100 : null,
      format: 'pct',
      description: 'المصروفات ÷ الإيرادات',
    },
    {
      name: 'Return on Assets (ROA)',
      nameAr: 'العائد على الأصول',
      current: c.totalAssets ? (c.netIncome / c.totalAssets) * 100 : 0,
      previous: p && p.totalAssets ? (p.netIncome / p.totalAssets) * 100 : null,
      format: 'pct',
      description: 'صافي الدخل ÷ إجمالي الأصول',
    },
    {
      name: 'Return on Equity (ROE)',
      nameAr: 'العائد على حقوق الملكية',
      current: c.totalEquity ? (c.netIncome / c.totalEquity) * 100 : 0,
      previous: p && p.totalEquity ? (p.netIncome / p.totalEquity) * 100 : null,
      format: 'pct',
      description: 'صافي الدخل ÷ حقوق الملكية',
    },
    {
      name: 'Debt to Equity',
      nameAr: 'الدين إلى حقوق الملكية',
      current: c.totalEquity ? c.totalLiabilities / c.totalEquity : 0,
      previous: p && p.totalEquity ? p.totalLiabilities / p.totalEquity : null,
      format: 'number',
      description: 'الالتزامات ÷ حقوق الملكية',
    },
    {
      name: 'COGS Ratio',
      nameAr: 'نسبة تكلفة المبيعات',
      current: c.totalRevenue ? (c.totalCOGS / c.totalRevenue) * 100 : 0,
      previous: p && p.totalRevenue ? (p.totalCOGS / p.totalRevenue) * 100 : null,
      format: 'pct',
      description: 'تكلفة المبيعات ÷ الإيرادات',
    },
  ];

  const formatVal = (val: number, fmt: 'pct' | 'number') =>
    fmt === 'pct' ? `${val.toFixed(1)}%` : val.toFixed(2);

  const getColor = (ratio: Ratio) => {
    if (ratio.previous === null) return '';
    const diff = ratio.current - ratio.previous;
    // For expense/debt ratios, decrease is good
    const isInverse = ['Expense Ratio', 'COGS Ratio', 'Debt to Equity'].includes(ratio.name);
    const isPositive = isInverse ? diff < 0 : diff > 0;
    if (Math.abs(diff) < 0.1) return '';
    return isPositive ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-primary/5">
        <h3 className="text-lg font-bold text-foreground">📈 النسب المالية</h3>
        <p className="text-xs text-muted-foreground mt-1">أهم المؤشرات المالية للتقييم</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        {ratios.map((ratio) => {
          const diff = ratio.previous !== null ? ratio.current - ratio.previous : null;
          const colorClass = getColor(ratio);
          return (
            <div key={ratio.name} className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{ratio.nameAr}</p>
                  <p className="text-xs text-muted-foreground">{ratio.name}</p>
                </div>
                {diff !== null && (
                  <div className={`flex items-center gap-1 ${colorClass}`}>
                    {Math.abs(diff) < 0.1 ? (
                      <Minus className="w-4 h-4" />
                    ) : diff > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold font-mono text-foreground mb-1">
                {formatVal(ratio.current, ratio.format)}
              </p>
              <p className="text-xs text-muted-foreground mb-2">{ratio.description}</p>
              {ratio.previous !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">السابقة: {formatVal(ratio.previous, ratio.format)}</span>
                  <span className={`font-semibold ${colorClass}`}>
                    ({diff !== null && diff >= 0 ? '+' : ''}{diff !== null ? (ratio.format === 'pct' ? `${diff.toFixed(1)}%` : diff.toFixed(2)) : ''})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
