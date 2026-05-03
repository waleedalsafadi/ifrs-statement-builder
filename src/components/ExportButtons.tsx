import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { AccountEntry, formatNumber } from '@/lib/accountUtils';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  accounts: AccountEntry[];
  companyName: string;
  reportDate: string;
}

export default function ExportButtons({ accounts, companyName, reportDate }: Props) {
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

  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const title = companyName || 'التقرير المالي';
    const date = reportDate || new Date().toISOString().slice(0, 10);

    // Income Statement
    const isData: (string | number)[][] = [
      [title, '', ''],
      [`التاريخ: ${date}`, '', ''],
      ['', '', ''],
      ['قائمة الدخل', '', ''],
      ['البند', 'المبلغ', 'النوع'],
      ...revenue.map(a => [a.name, Math.abs(a.debit - a.credit), 'إيرادات']),
      ['إجمالي الإيرادات', totalRevenue, ''],
      ...(cogs.length > 0 ? [
        ...cogs.map(a => [a.name, Math.abs(a.debit - a.credit), 'تكلفة مبيعات'] as (string | number)[]),
        ['مجمل الربح', grossProfit, ''] as (string | number)[],
      ] : []),
      ...expenses.map(a => [a.name, Math.abs(a.debit - a.credit), 'مصروفات']),
      ['إجمالي المصروفات', totalExpenses, ''],
      ['صافي الدخل', netIncome, ''],
    ];
    const isSheet = XLSX.utils.aoa_to_sheet(isData);
    isSheet['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, isSheet, 'قائمة الدخل');

    // Balance Sheet
    const bsData: (string | number)[][] = [
      [title, '', ''],
      [`التاريخ: ${date}`, '', ''],
      ['', '', ''],
      ['قائمة المركز المالي', '', ''],
      ['البند', 'المبلغ', 'النوع'],
      ...assets.map(a => [a.name, Math.abs(a.debit - a.credit), 'أصول']),
      ['إجمالي الأصول', totalAssets, ''],
      ['', '', ''],
      ...liabilities.map(a => [a.name, Math.abs(a.debit - a.credit), 'التزامات']),
      ['إجمالي الالتزامات', totalLiabilities, ''],
      ['', '', ''],
      ...equity.map(a => [a.name, Math.abs(a.debit - a.credit), 'حقوق ملكية']),
      ['صافي الدخل', netIncome, ''],
      ['إجمالي حقوق الملكية', totalEquity, ''],
    ];
    const bsSheet = XLSX.utils.aoa_to_sheet(bsData);
    bsSheet['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, bsSheet, 'المركز المالي');

    XLSX.writeFile(wb, `${title} - ${date}.xlsx`);
  }, [accounts, companyName, reportDate]);

  const exportPDF = useCallback(() => {
    const title = companyName || 'التقرير المالي';
    const date = reportDate
      ? new Date(reportDate + 'T00:00:00').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('ar-EG');

    const buildSection = (label: string, items: AccountEntry[], total: number) =>
      items.map(a =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${a.name}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:left;font-family:monospace">${formatNumber(Math.abs(a.debit - a.credit))}</td></tr>`
      ).join('') +
      `<tr style="background:#f3f4f6;font-weight:700"><td style="padding:8px 12px">إجمالي ${label}</td><td style="padding:8px 12px;text-align:left;font-family:monospace">${formatNumber(total)}</td></tr>`;

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'IBM Plex Sans Arabic',sans-serif;background:#fff;color:#1a1a2e;padding:40px}
      h1{font-size:22px;text-align:center;margin-bottom:4px}
      .date{text-align:center;color:#6b7280;font-size:13px;margin-bottom:32px}
      .section{margin-bottom:28px}
      .section-title{font-size:16px;font-weight:700;margin-bottom:8px;padding:10px 12px;background:#f0f4ff;border-radius:8px}
      table{width:100%;border-collapse:collapse;font-size:14px}
      th{text-align:right;padding:8px 12px;background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280}
      th:last-child{text-align:left}
      .net{font-weight:700;font-size:15px;padding:10px 12px;border-radius:8px;margin-top:4px}
      .net.positive{background:#ecfdf5;color:#059669}
      .net.negative{background:#fef2f2;color:#dc2626}
      .balance-check{text-align:center;padding:12px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px}
      @media print{body{padding:20px}@page{size:A4;margin:15mm}}
    </style></head><body>
    <h1>${title}</h1>
    <p class="date">${date}</p>

    <div class="section">
      <div class="section-title">📊 قائمة الدخل</div>
      <table>
        <thead><tr><th>البند</th><th style="text-align:left">المبلغ</th></tr></thead>
        <tbody>
          ${buildSection('الإيرادات', revenue, totalRevenue)}
          ${cogs.length > 0 ? buildSection('تكلفة المبيعات', cogs, totalCOGS) +
            `<tr style="background:#f0fdf4"><td style="padding:8px 12px;font-weight:600">مجمل الربح</td><td style="padding:8px 12px;text-align:left;font-family:monospace;font-weight:600">${formatNumber(grossProfit)}</td></tr>` : ''}
          ${buildSection('المصروفات', expenses, totalExpenses)}
        </tbody>
      </table>
      <div class="net ${netIncome >= 0 ? 'positive' : 'negative'}">
        <table><tr><td>صافي الدخل</td><td style="text-align:left;font-family:monospace">${formatNumber(netIncome)}</td></tr></table>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🏦 قائمة المركز المالي</div>
      <table>
        <thead><tr><th>البند</th><th style="text-align:left">المبلغ</th></tr></thead>
        <tbody>
          ${buildSection('الأصول', assets, totalAssets)}
          ${buildSection('الالتزامات', liabilities, totalLiabilities)}
          ${equity.map(a =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${a.name}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:left;font-family:monospace">${formatNumber(Math.abs(a.debit - a.credit))}</td></tr>`
          ).join('')}
          <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0ea5e9">صافي الدخل</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:left;font-family:monospace;color:#0ea5e9">${formatNumber(netIncome)}</td></tr>
          <tr style="background:#f3f4f6;font-weight:700"><td style="padding:8px 12px">إجمالي حقوق الملكية</td><td style="padding:8px 12px;text-align:left;font-family:monospace">${formatNumber(totalEquity)}</td></tr>
        </tbody>
      </table>
      <div class="balance-check" style="background:${Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? '#ecfdf5;color:#059669' : '#fef2f2;color:#dc2626'}">
        A = L + E → ${formatNumber(totalAssets)} = ${formatNumber(totalLiabilities + totalEquity)}
      </div>
    </div>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
        }, 500);
      };
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [accounts, companyName, reportDate]);

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportExcel} className="gap-2 text-xs">
        <Download className="w-3.5 h-3.5" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2 text-xs">
        <FileText className="w-3.5 h-3.5" />
        PDF
      </Button>
    </div>
  );
}
