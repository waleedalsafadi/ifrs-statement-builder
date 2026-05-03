export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'COGS' | 'Expense';

export interface AccountEntry {
  id: string;
  name: string;
  debit: number;
  credit: number;
  type: AccountType;
}

const ACCOUNT_KEYWORDS: Record<AccountType, string[]> = {
  Asset: ['cash', 'bank', 'receivable', 'inventory', 'equipment', 'land', 'building', 'prepaid', 'supplies', 'vehicle', 'furniture', 'نقد', 'بنك', 'مدين', 'مخزون', 'معدات', 'أرض', 'مبان', 'أثاث', 'سيارات', 'مقدم'],
  Liability: ['payable', 'loan', 'mortgage', 'unearned', 'accrued', 'debt', 'note payable', 'دائن', 'قرض', 'مستحق', 'إيراد مقدم', 'دين'],
  Equity: ['capital', 'retained', 'drawing', 'owner', 'stock', 'dividend', 'رأس مال', 'أرباح محتجزة', 'مسحوبات', 'حقوق'],
  Revenue: ['revenue', 'sales', 'income', 'service', 'fee', 'إيراد', 'مبيعات', 'دخل', 'خدمات', 'رسوم'],
  COGS: ['cost of goods', 'cogs', 'cost of sales', 'تكلفة البضاعة', 'تكلفة المبيعات'],
  Expense: ['expense', 'salary', 'wage', 'rent', 'utilities', 'insurance', 'depreciation', 'interest expense', 'tax', 'مصروف', 'رواتب', 'إيجار', 'مرافق', 'تأمين', 'إهلاك', 'ضريبة', 'فائدة'],
};

export function suggestAccountType(name: string): AccountType {
  const lower = name.toLowerCase();
  for (const [type, keywords] of Object.entries(ACCOUNT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return type as AccountType;
    }
  }
  return 'Expense';
}

export function formatNumber(num: number): string {
  if (Math.abs(num) < 0.01) return '—';
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
