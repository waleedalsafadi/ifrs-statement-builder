import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { computeBalanceSheet, computeIncomeStatement } from '@/lib/ifrs';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props { accounts: AccountEntry[]; }

interface Line { label: string; value: number; bold?: boolean; indent?: boolean; subtle?: boolean; }

function StatementSection({ title, lines, totalLabel, total, totalTone = 'neutral' }: {
  title: string; lines: Line[]; totalLabel?: string; total?: number;
  totalTone?: 'neutral' | 'positive' | 'highlight';
}) {
  return (
    <div className="mb-3">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{title}</h4>
      {lines.filter(l => Math.abs(l.value) > 0.01).map((l, i) => (
        <div
          key={i}
          className={`flex justify-between py-1.5 px-2 text-sm hover:bg-muted/30 rounded
            ${l.indent ? 'pr-6' : ''} ${l.bold ? 'font-semibold' : ''} ${l.subtle ? 'text-muted-foreground' : 'text-foreground'}`}
        >
          <span>{l.label}</span>
          <span className="font-mono">{formatNumber(l.value)}</span>
        </div>
      ))}
      {totalLabel !== undefined && (
        <div className={`flex justify-between py-2 px-2 mt-1 border-t border-border font-bold text-sm
          ${totalTone === 'positive' ? 'text-success' : totalTone === 'highlight' ? 'text-primary' : 'text-foreground'}`}>
          <span>{totalLabel}</span>
          <span className="font-mono">{formatNumber(total ?? 0)}</span>
        </div>
      )}
    </div>
  );
}

export default function FinancialStatements({ accounts }: Props) {
  const is = computeIncomeStatement(accounts);
  const bs = computeBalanceSheet(accounts);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Income Statement */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-primary/5">
          <h3 className="text-lg font-bold text-foreground">📊 قائمة الدخل</h3>
          <p className="text-xs text-muted-foreground">Statement of Profit or Loss — IAS 1</p>
        </div>
        <div className="p-5">
          <StatementSection
            title="الإيرادات — Revenue"
            lines={[
              { label: 'إيرادات تشغيلية', value: is.revenueOperating, indent: true },
              { label: 'إيرادات أخرى', value: is.revenueOther, indent: true },
            ]}
            totalLabel="إجمالي الإيرادات"
            total={is.totalRevenue}
          />
          <StatementSection
            title="تكلفة الإيراد — Cost of Revenue"
            lines={[{ label: 'تكلفة الإيراد', value: is.cogs, indent: true }]}
          />
          <div className="flex justify-between py-2 px-2 mb-1 bg-accent/10 rounded font-bold text-sm text-accent">
            <span>مجمل الربح (Gross Profit)</span>
            <span className="font-mono">{formatNumber(is.grossProfit)}</span>
          </div>
          <div className="flex justify-between py-1 px-2 mb-3 text-xs text-muted-foreground">
            <span>هامش مجمل الربح</span>
            <span className="font-mono">{is.grossMargin.toFixed(1)}%</span>
          </div>

          <StatementSection
            title="المصروفات التشغيلية — Operating Expenses"
            lines={[
              { label: 'مصروفات بيع وتوزيع', value: is.selling, indent: true },
              { label: 'مصروفات عمومية وإدارية', value: is.ga, indent: true },
              { label: 'إهلاك واستهلاك', value: is.da, indent: true },
            ]}
            totalLabel="إجمالي المصروفات التشغيلية"
            total={is.totalOpex}
          />

          <div className="flex justify-between py-2 px-2 mb-1 bg-primary/10 rounded font-bold text-sm text-primary">
            <span>الربح التشغيلي (EBIT)</span>
            <span className="font-mono">{formatNumber(is.operatingProfit)}</span>
          </div>
          <div className="flex justify-between py-1 px-2 text-xs text-muted-foreground">
            <span>EBITDA (الربح قبل الفوائد والضرائب والإهلاك)</span>
            <span className="font-mono">{formatNumber(is.ebitda)}</span>
          </div>
          <div className="flex justify-between py-1 px-2 mb-3 text-xs text-muted-foreground">
            <span>هامش الربح التشغيلي</span>
            <span className="font-mono">{is.operatingMargin.toFixed(1)}%</span>
          </div>

          <StatementSection
            title="صافي تكاليف التمويل — Net Finance Costs"
            lines={[
              { label: 'إيرادات تمويلية', value: is.finIncome, indent: true },
              { label: 'مصروفات تمويلية', value: is.finCost, indent: true },
            ]}
            totalLabel="صافي تكاليف التمويل"
            total={is.netFinanceCost}
          />

          <div className="flex justify-between py-2 px-2 mb-3 bg-muted/50 rounded font-bold text-sm">
            <span>الربح قبل الضريبة (PBT)</span>
            <span className="font-mono">{formatNumber(is.profitBeforeTax)}</span>
          </div>

          <StatementSection
            title="ضريبة الدخل — Income Tax"
            lines={[{ label: 'ضريبة الدخل', value: is.taxExpense, indent: true }]}
          />

          <div className={`flex justify-between py-3 px-3 rounded-lg font-bold text-base mt-2 ${is.netIncome >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            <span>صافي الربح / (الخسارة)</span>
            <span className="font-mono">{formatNumber(is.netIncome)}</span>
          </div>
          <div className="flex justify-between py-1 px-2 mt-1 text-xs text-muted-foreground">
            <span>هامش صافي الربح</span>
            <span className="font-mono">{is.netMargin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-accent/5">
          <h3 className="text-lg font-bold text-foreground">🏦 قائمة المركز المالي</h3>
          <p className="text-xs text-muted-foreground">Statement of Financial Position — IAS 1</p>
        </div>
        <div className="p-5">
          <h4 className="text-sm font-bold text-info mb-2">الأصول — ASSETS</h4>
          <StatementSection
            title="الأصول غير المتداولة"
            lines={[
              { label: 'الممتلكات والآلات والمعدات', value: bs.ppe, indent: true },
              { label: 'أصول حق الاستخدام', value: bs.rou, indent: true },
              { label: 'الأصول غير الملموسة', value: bs.intangible, indent: true },
              { label: 'استثمارات طويلة الأجل', value: bs.ltInvestment, indent: true },
              { label: 'أصول ضريبية مؤجلة', value: bs.deferredTaxAsset, indent: true },
              { label: 'أصول غير متداولة أخرى', value: bs.ncaOther, indent: true },
            ]}
            totalLabel="إجمالي الأصول غير المتداولة"
            total={bs.totalNCA}
          />
          <StatementSection
            title="الأصول المتداولة"
            lines={[
              { label: 'المخزون', value: bs.inventory, indent: true },
              { label: 'العملاء والذمم المدينة', value: bs.receivables, indent: true },
              { label: 'مدفوعات مقدمة', value: bs.prepayments, indent: true },
              { label: 'النقدية وما في حكمها', value: bs.cash, indent: true },
              { label: 'أصول متداولة أخرى', value: bs.caOther, indent: true },
            ]}
            totalLabel="إجمالي الأصول المتداولة"
            total={bs.totalCA}
          />
          <div className="flex justify-between py-3 px-3 rounded-lg font-bold text-base bg-info/10 text-info mb-5">
            <span>إجمالي الأصول — TOTAL ASSETS</span>
            <span className="font-mono">{formatNumber(bs.totalAssets)}</span>
          </div>

          <h4 className="text-sm font-bold text-warning mb-2">الالتزامات وحقوق الملكية — LIABILITIES & EQUITY</h4>
          <StatementSection
            title="الالتزامات غير المتداولة"
            lines={[
              { label: 'قروض طويلة الأجل', value: bs.ltDebt, indent: true },
              { label: 'التزامات إيجارية', value: bs.leaseLiability, indent: true },
              { label: 'مخصصات', value: bs.provisions, indent: true },
              { label: 'التزامات ضريبية مؤجلة', value: bs.deferredTaxLiability, indent: true },
              { label: 'التزامات غير متداولة أخرى', value: bs.nclOther, indent: true },
            ]}
            totalLabel="إجمالي الالتزامات غير المتداولة"
            total={bs.totalNCL}
          />
          <StatementSection
            title="الالتزامات المتداولة"
            lines={[
              { label: 'الموردون والذمم الدائنة', value: bs.payables, indent: true },
              { label: 'قروض قصيرة الأجل', value: bs.stBorrowings, indent: true },
              { label: 'مصروفات مستحقة', value: bs.accruals, indent: true },
              { label: 'الجزء المتداول من القروض', value: bs.currentPortionLTD, indent: true },
              { label: 'التزامات متداولة أخرى', value: bs.clOther, indent: true },
            ]}
            totalLabel="إجمالي الالتزامات المتداولة"
            total={bs.totalCL}
          />
          <div className="flex justify-between py-2 px-3 rounded font-bold text-sm bg-warning/10 text-warning mb-4">
            <span>إجمالي الالتزامات</span>
            <span className="font-mono">{formatNumber(bs.totalLiabilities)}</span>
          </div>

          <StatementSection
            title="حقوق الملكية — Equity"
            lines={[
              { label: 'رأس المال', value: bs.shareCapital, indent: true },
              { label: 'علاوة إصدار', value: bs.apic, indent: true },
              { label: 'أرباح محتجزة', value: bs.retainedEarnings, indent: true },
              { label: 'احتياطيات أخرى', value: bs.otherReserves, indent: true },
              { label: 'صافي ربح الفترة', value: bs.netIncome, indent: true, subtle: true },
            ]}
            totalLabel="إجمالي حقوق الملكية"
            total={bs.totalEquity}
          />

          <div className="flex justify-between py-3 px-3 rounded-lg font-bold text-base bg-accent/10 text-accent mb-3">
            <span>إجمالي الالتزامات وحقوق الملكية</span>
            <span className="font-mono">{formatNumber(bs.totalLiabAndEquity)}</span>
          </div>

          <div className={`flex items-center justify-between py-3 px-3 rounded-lg font-bold text-sm ${bs.balanced ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            <div className="flex items-center gap-2">
              {bs.balanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>التحقق: A = L + E {bs.balanced ? '✓' : `(فرق: ${formatNumber(bs.imbalance)})`}</span>
            </div>
            <span className="font-mono">{formatNumber(bs.totalAssets)} = {formatNumber(bs.totalLiabAndEquity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
