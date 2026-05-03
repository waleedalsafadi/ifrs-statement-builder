import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Props {
  currentAccounts: AccountEntry[];
  previousAccounts: AccountEntry[];
}

interface ComparisonRow {
  name: string;
  previous: number;
  current: number;
  change: number;
  pctChange: number | null;
}

export default function HorizontalAnalysis({ currentAccounts, previousAccounts }: Props) {
  const netAmount = (accs: AccountEntry[]) => accs.reduce((s, a) => s + a.debit - a.credit, 0);
  const byType = (accs: AccountEntry[], type: string) => accs.filter(a => a.type === type);

  const buildRows = (type: string, label: string): ComparisonRow[] => {
    const currItems = byType(currentAccounts, type);
    const prevItems = byType(previousAccounts, type);
    const allNames = [...new Set([...currItems.map(a => a.name), ...prevItems.map(a => a.name)])];

    return allNames.map(name => {
      const curr = currItems.filter(a => a.name === name);
      const prev = prevItems.filter(a => a.name === name);
      const currentVal = Math.abs(curr.reduce((s, a) => s + a.debit - a.credit, 0));
      const previousVal = Math.abs(prev.reduce((s, a) => s + a.debit - a.credit, 0));
      const change = currentVal - previousVal;
      const pctChange = previousVal !== 0 ? (change / previousVal) * 100 : null;
      return { name, previous: previousVal, current: currentVal, change, pctChange };
    });
  };

  const sections = [
    { type: 'Revenue', label: 'الإيرادات', color: 'success' },
    { type: 'COGS', label: 'تكلفة المبيعات', color: 'destructive' },
    { type: 'Expense', label: 'المصروفات', color: 'warning' },
    { type: 'Asset', label: 'الأصول', color: 'info' },
    { type: 'Liability', label: 'الالتزامات', color: 'warning' },
    { type: 'Equity', label: 'حقوق الملكية', color: 'accent' },
  ];

  const ChangeIcon = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.01) return <Minus className="w-4 h-4 text-muted-foreground" />;
    return value > 0
      ? <ArrowUpRight className="w-4 h-4 text-success" />
      : <ArrowDownRight className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-primary/5">
        <h3 className="text-lg font-bold text-foreground">📊 التحليل الأفقي — مقارنة الفترتين</h3>
        <p className="text-xs text-muted-foreground mt-1">مقارنة بين الفترة السابقة والفترة الحالية</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3 px-5">البند</th>
              <th className="text-left text-xs font-semibold text-muted-foreground p-3">Previous</th>
              <th className="text-left text-xs font-semibold text-muted-foreground p-3">Current</th>
              <th className="text-left text-xs font-semibold text-muted-foreground p-3">Change</th>
              <th className="text-left text-xs font-semibold text-muted-foreground p-3">% Change</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sections.map(section => {
              const rows = buildRows(section.type, section.label);
              if (rows.length === 0) return null;
              const totalPrev = rows.reduce((s, r) => s + r.previous, 0);
              const totalCurr = rows.reduce((s, r) => s + r.current, 0);
              const totalChange = totalCurr - totalPrev;
              const totalPct = totalPrev !== 0 ? (totalChange / totalPrev) * 100 : null;
              return (
                <tbody key={section.type}>
                  <tr className={`bg-${section.color}/5`}>
                    <td colSpan={6} className={`p-2 px-5 text-xs font-bold text-${section.color}`}>{section.label}</td>
                  </tr>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 px-5 text-sm font-medium text-foreground">{row.name}</td>
                      <td className="p-3 text-sm font-mono text-muted-foreground text-left">{formatNumber(row.previous)}</td>
                      <td className="p-3 text-sm font-mono text-foreground text-left">{formatNumber(row.current)}</td>
                      <td className={`p-3 text-sm font-mono text-left font-semibold ${row.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {row.change >= 0 ? '+' : ''}{formatNumber(row.change)}
                      </td>
                      <td className={`p-3 text-sm font-mono text-left font-semibold ${row.pctChange !== null && row.pctChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {row.pctChange !== null ? `${row.pctChange >= 0 ? '+' : ''}${row.pctChange.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="p-3"><ChangeIcon value={row.change} /></td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-bold border-t border-border">
                    <td className="p-3 px-5 text-sm">إجمالي {section.label}</td>
                    <td className="p-3 text-sm font-mono text-left">{formatNumber(totalPrev)}</td>
                    <td className="p-3 text-sm font-mono text-left">{formatNumber(totalCurr)}</td>
                    <td className={`p-3 text-sm font-mono text-left ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totalChange >= 0 ? '+' : ''}{formatNumber(totalChange)}
                    </td>
                    <td className={`p-3 text-sm font-mono text-left ${totalPct !== null && totalPct >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totalPct !== null ? `${totalPct >= 0 ? '+' : ''}${totalPct.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
