import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Building2, Calendar } from 'lucide-react';

interface Props {
  companyName: string;
  reportDate: string;
  onCompanyNameChange: (name: string) => void;
  onReportDateChange: (date: string) => void;
}

export default function ReportHeader({ companyName, reportDate, onCompanyNameChange, onReportDateChange }: Props) {
  const [editing, setEditing] = useState(!companyName);

  if (editing || !companyName) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-bold text-foreground mb-4">معلومات التقرير</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> اسم الشركة
            </label>
            <Input
              value={companyName}
              onChange={e => onCompanyNameChange(e.target.value)}
              placeholder="مثال: شركة النور للتجارة"
              className="h-10"
            />
          </div>
          <div className="w-48">
            <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> تاريخ التقرير
            </label>
            <Input
              type="date"
              value={reportDate}
              onChange={e => onReportDateChange(e.target.value)}
              className="h-10"
              dir="ltr"
            />
          </div>
          {companyName && (
            <button
              onClick={() => setEditing(false)}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              تأكيد
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-2" id="report-header">
      <h2 className="text-xl font-bold text-foreground">{companyName}</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {reportDate ? new Date(reportDate + 'T00:00:00').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
      </p>
      <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline mt-1">تعديل</button>
    </div>
  );
}
