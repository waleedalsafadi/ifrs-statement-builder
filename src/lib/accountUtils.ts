// ============================================================
// IFRS-aligned chart of accounts model
// ============================================================

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'COGS' | 'Expense';

// Granular IFRS / IAS 1 line items
export type AccountCategory =
  // Non-Current Assets
  | 'NCA_PPE' | 'NCA_ROU' | 'NCA_Intangible' | 'NCA_Investment' | 'NCA_DeferredTax' | 'NCA_Other'
  // Current Assets
  | 'CA_Inventory' | 'CA_Receivables' | 'CA_Prepayments' | 'CA_Cash' | 'CA_Other'
  // Non-Current Liabilities
  | 'NCL_LongTermDebt' | 'NCL_LeaseLiability' | 'NCL_Provisions' | 'NCL_DeferredTaxLiability' | 'NCL_Other'
  // Current Liabilities
  | 'CL_Payables' | 'CL_ShortTermBorrowings' | 'CL_Accruals' | 'CL_CurrentPortionLTD' | 'CL_Other'
  // Equity
  | 'EQ_ShareCapital' | 'EQ_APIC' | 'EQ_RetainedEarnings' | 'EQ_OtherReserves'
  // P&L
  | 'REV_Operating' | 'REV_Other'
  | 'COGS'
  | 'OPEX_Selling' | 'OPEX_GA' | 'OPEX_DA'
  | 'FIN_Income' | 'FIN_Cost'
  | 'TAX_Income'
  | 'MEMO';

export interface AccountEntry {
  id: string;
  number?: string;          // account number (e.g. "1101")
  name: string;
  debit: number;
  credit: number;
  type: AccountType;        // backward-compat top-level type
  category: AccountCategory; // IFRS line
}

// ---------- Labels ----------
export const CATEGORY_LABELS_AR: Record<AccountCategory, string> = {
  NCA_PPE: 'الممتلكات والآلات والمعدات',
  NCA_ROU: 'أصول حق الاستخدام',
  NCA_Intangible: 'الأصول غير الملموسة',
  NCA_Investment: 'استثمارات طويلة الأجل',
  NCA_DeferredTax: 'أصول ضريبية مؤجلة',
  NCA_Other: 'أصول غير متداولة أخرى',

  CA_Inventory: 'المخزون',
  CA_Receivables: 'العملاء والذمم المدينة',
  CA_Prepayments: 'مدفوعات مقدمة',
  CA_Cash: 'النقدية وما في حكمها',
  CA_Other: 'أصول متداولة أخرى',

  NCL_LongTermDebt: 'قروض طويلة الأجل',
  NCL_LeaseLiability: 'التزامات إيجارية (غير متداولة)',
  NCL_Provisions: 'مخصصات',
  NCL_DeferredTaxLiability: 'التزامات ضريبية مؤجلة',
  NCL_Other: 'التزامات غير متداولة أخرى',

  CL_Payables: 'الموردون والذمم الدائنة',
  CL_ShortTermBorrowings: 'قروض قصيرة الأجل',
  CL_Accruals: 'مصروفات مستحقة',
  CL_CurrentPortionLTD: 'الجزء المتداول من القروض',
  CL_Other: 'التزامات متداولة أخرى',

  EQ_ShareCapital: 'رأس المال',
  EQ_APIC: 'علاوة إصدار',
  EQ_RetainedEarnings: 'أرباح محتجزة',
  EQ_OtherReserves: 'احتياطيات أخرى',

  REV_Operating: 'إيرادات تشغيلية',
  REV_Other: 'إيرادات أخرى',
  COGS: 'تكلفة الإيراد',
  OPEX_Selling: 'مصروفات بيع وتوزيع',
  OPEX_GA: 'مصروفات عمومية وإدارية',
  OPEX_DA: 'إهلاك واستهلاك',
  FIN_Income: 'إيرادات تمويلية',
  FIN_Cost: 'مصروفات تمويلية',
  TAX_Income: 'ضريبة الدخل',
  MEMO: 'حساب نظامي / إحصائي',
};

export const CATEGORY_LABELS_EN: Record<AccountCategory, string> = {
  NCA_PPE: 'Property, Plant & Equipment',
  NCA_ROU: 'Right-of-Use Assets',
  NCA_Intangible: 'Intangible Assets',
  NCA_Investment: 'Long-term Investments',
  NCA_DeferredTax: 'Deferred Tax Assets',
  NCA_Other: 'Other Non-Current Assets',
  CA_Inventory: 'Inventories',
  CA_Receivables: 'Trade & Other Receivables',
  CA_Prepayments: 'Prepayments',
  CA_Cash: 'Cash and Cash Equivalents',
  CA_Other: 'Other Current Assets',
  NCL_LongTermDebt: 'Long-term Borrowings',
  NCL_LeaseLiability: 'Lease Liabilities (non-current)',
  NCL_Provisions: 'Provisions',
  NCL_DeferredTaxLiability: 'Deferred Tax Liabilities',
  NCL_Other: 'Other Non-Current Liabilities',
  CL_Payables: 'Trade & Other Payables',
  CL_ShortTermBorrowings: 'Short-term Borrowings',
  CL_Accruals: 'Accrued Expenses',
  CL_CurrentPortionLTD: 'Current Portion of Long-term Debt',
  CL_Other: 'Other Current Liabilities',
  EQ_ShareCapital: 'Share Capital',
  EQ_APIC: 'Additional Paid-in Capital',
  EQ_RetainedEarnings: 'Retained Earnings',
  EQ_OtherReserves: 'Other Reserves',
  REV_Operating: 'Operating Revenue',
  REV_Other: 'Other Income',
  COGS: 'Cost of Revenue',
  OPEX_Selling: 'Selling & Distribution Expenses',
  OPEX_GA: 'General & Administrative Expenses',
  OPEX_DA: 'Depreciation & Amortization',
  FIN_Income: 'Finance Income',
  FIN_Cost: 'Finance Costs',
  TAX_Income: 'Income Tax Expense',
  MEMO: 'Memorandum',
};

// Map a category to its top-level legacy type
export function categoryToType(cat: AccountCategory): AccountType {
  if (cat.startsWith('NCA_') || cat.startsWith('CA_')) return 'Asset';
  if (cat.startsWith('NCL_') || cat.startsWith('CL_')) return 'Liability';
  if (cat.startsWith('EQ_')) return 'Equity';
  if (cat.startsWith('REV_')) return 'Revenue';
  if (cat === 'COGS') return 'COGS';
  // Treat finance & tax as expenses for legacy aggregations
  return 'Expense';
}

// ---------- Keyword libraries (Arabic + English) ----------
const KW = {
  // Non-current assets
  ppe: ['property', 'plant', 'equipment', 'building', 'land', 'machinery', 'vehicle', 'furniture', 'fixture', 'ppe',
        'مبان', 'أرض', 'أراضي', 'معدات', 'آلات', 'سيارات', 'أثاث', 'تجهيزات', 'ممتلكات'],
  rou: ['right-of-use', 'right of use', 'rou', 'حق استخدام', 'حق الاستخدام'],
  intangible: ['intangible', 'goodwill', 'patent', 'trademark', 'license', 'software', 'غير ملموس', 'شهرة', 'براءة', 'علامة تجارية', 'ترخيص', 'برمجيات'],
  longInvestment: ['long-term investment', 'investment in', 'subsidiary', 'associate', 'استثمار طويل', 'استثمارات في'],
  deferredTaxAsset: ['deferred tax asset', 'أصل ضريبي مؤجل'],

  // Current assets
  inventory: ['inventory', 'inventories', 'stock', 'مخزون', 'بضاعة'],
  receivables: ['receivable', 'debtor', 'ar ', 'a/r', 'مدين', 'ذمم مدينة', 'عملاء'],
  prepayments: ['prepaid', 'prepayment', 'مقدم', 'مدفوعات مقدمة', 'مصروف مقدم'],
  cash: ['cash', 'bank', 'petty', 'نقد', 'بنك', 'صندوق', 'خزينة'],

  // Non-current liabilities
  ltDebt: ['long-term loan', 'long term loan', 'long-term debt', 'bond', 'mortgage', 'قرض طويل', 'سندات', 'رهن'],
  leaseLiab: ['lease liability', 'التزام إيجاري', 'التزامات إيجار'],
  provisions: ['provision', 'eosb', 'end of service', 'مخصص', 'مكافأة نهاية الخدمة'],
  deferredTaxLiab: ['deferred tax liability', 'التزام ضريبي مؤجل'],

  // Current liabilities
  payables: ['payable', 'creditor', 'ap ', 'a/p', 'دائن', 'موردون', 'ذمم دائنة'],
  stBorrow: ['short-term loan', 'short term loan', 'overdraft', 'قرض قصير', 'سحب على المكشوف'],
  accruals: ['accrued', 'accrual', 'مستحق'],
  currentPortion: ['current portion', 'الجزء المتداول'],

  // Equity
  shareCapital: ['share capital', 'common stock', 'capital stock', 'رأس مال', 'رأس المال'],
  apic: ['additional paid', 'paid-in capital', 'share premium', 'علاوة إصدار', 'علاوة الإصدار'],
  retained: ['retained', 'accumulated profit', 'أرباح محتجزة', 'أرباح مرحلة'],
  reserves: ['reserve', 'احتياطي'],

  // Revenue
  otherIncome: ['other income', 'gain', 'إيرادات أخرى', 'مكاسب'],
  revenue: ['revenue', 'sales', 'income', 'service', 'fee', 'إيراد', 'مبيعات', 'دخل', 'خدمات', 'رسوم'],

  // COGS
  cogs: ['cost of goods', 'cogs', 'cost of sales', 'cost of revenue', 'تكلفة البضاعة', 'تكلفة المبيعات', 'تكلفة الإيراد'],

  // Expenses
  selling: ['selling', 'marketing', 'distribution', 'advertising', 'بيع', 'تسويق', 'توزيع', 'إعلان'],
  da: ['depreciation', 'amortization', 'إهلاك', 'استهلاك'],

  // Finance
  finIncome: ['interest income', 'finance income', 'إيرادات تمويلية', 'فوائد دائنة'],
  finCost: ['interest expense', 'finance cost', 'مصروفات تمويلية', 'فوائد مدينة', 'فائدة'],

  // Tax
  tax: ['income tax', 'tax expense', 'ضريبة الدخل', 'ضريبة'],
};

function hasAny(text: string, kws: string[]): boolean {
  return kws.some(k => text.includes(k));
}

// ---------- Number-prefix → broad bucket ----------
type Bucket =
  | 'NCA' | 'CA'
  | 'NCL' | 'CL'
  | 'EQ' | 'REV' | 'COGS' | 'OPEX' | 'FIN' | 'TAX' | 'MEMO' | null;

export function bucketFromNumber(num?: string): Bucket {
  if (!num) return null;
  const n = num.trim();
  if (!/^\d/.test(n)) return null;
  const d1 = n[0];
  const d2 = n[1] ?? '';
  switch (d1) {
    case '1':
      if (d2 === '1') return 'NCA';
      if (d2 === '2') return 'CA';
      return 'CA';
    case '2':
      if (d2 === '1') return 'NCL';
      if (d2 === '2') return 'CL';
      return 'CL';
    case '3': return 'EQ';
    case '4': return 'REV';
    case '5': return 'COGS';
    case '6': return 'OPEX';
    case '7': return 'FIN';
    case '8': return 'TAX';
    case '9': return 'MEMO';
    default: return null;
  }
}

// ---------- Refine bucket → category by name keywords ----------
function refineWithName(bucket: Bucket, lname: string): AccountCategory {
  switch (bucket) {
    case 'NCA':
      if (hasAny(lname, KW.rou)) return 'NCA_ROU';
      if (hasAny(lname, KW.intangible)) return 'NCA_Intangible';
      if (hasAny(lname, KW.deferredTaxAsset)) return 'NCA_DeferredTax';
      if (hasAny(lname, KW.longInvestment)) return 'NCA_Investment';
      if (hasAny(lname, KW.ppe)) return 'NCA_PPE';
      return 'NCA_Other';
    case 'CA':
      if (hasAny(lname, KW.cash)) return 'CA_Cash';
      if (hasAny(lname, KW.receivables)) return 'CA_Receivables';
      if (hasAny(lname, KW.inventory)) return 'CA_Inventory';
      if (hasAny(lname, KW.prepayments)) return 'CA_Prepayments';
      return 'CA_Other';
    case 'NCL':
      if (hasAny(lname, KW.deferredTaxLiab)) return 'NCL_DeferredTaxLiability';
      if (hasAny(lname, KW.leaseLiab)) return 'NCL_LeaseLiability';
      if (hasAny(lname, KW.provisions)) return 'NCL_Provisions';
      if (hasAny(lname, KW.ltDebt)) return 'NCL_LongTermDebt';
      return 'NCL_Other';
    case 'CL':
      if (hasAny(lname, KW.currentPortion)) return 'CL_CurrentPortionLTD';
      if (hasAny(lname, KW.accruals)) return 'CL_Accruals';
      if (hasAny(lname, KW.stBorrow)) return 'CL_ShortTermBorrowings';
      if (hasAny(lname, KW.payables)) return 'CL_Payables';
      return 'CL_Other';
    case 'EQ':
      if (hasAny(lname, KW.apic)) return 'EQ_APIC';
      if (hasAny(lname, KW.retained)) return 'EQ_RetainedEarnings';
      if (hasAny(lname, KW.reserves)) return 'EQ_OtherReserves';
      if (hasAny(lname, KW.shareCapital)) return 'EQ_ShareCapital';
      return 'EQ_OtherReserves';
    case 'REV':
      if (hasAny(lname, KW.otherIncome)) return 'REV_Other';
      return 'REV_Operating';
    case 'COGS': return 'COGS';
    case 'OPEX':
      if (hasAny(lname, KW.da)) return 'OPEX_DA';
      if (hasAny(lname, KW.selling)) return 'OPEX_Selling';
      return 'OPEX_GA';
    case 'FIN':
      if (hasAny(lname, KW.finIncome)) return 'FIN_Income';
      return 'FIN_Cost';
    case 'TAX': return 'TAX_Income';
    case 'MEMO': return 'MEMO';
    default: return 'CA_Other';
  }
}

// ---------- Pure-name fallback (no number / unknown prefix) ----------
function categoryFromNameOnly(name: string): AccountCategory {
  const l = name.toLowerCase();
  // P&L first (so "interest expense" doesn't fall through to receivables etc.)
  if (hasAny(l, KW.tax)) return 'TAX_Income';
  if (hasAny(l, KW.finCost)) return 'FIN_Cost';
  if (hasAny(l, KW.finIncome)) return 'FIN_Income';
  if (hasAny(l, KW.cogs)) return 'COGS';
  if (hasAny(l, KW.da)) return 'OPEX_DA';
  if (hasAny(l, KW.selling)) return 'OPEX_Selling';
  if (hasAny(l, KW.otherIncome)) return 'REV_Other';
  if (hasAny(l, KW.revenue)) return 'REV_Operating';
  // Equity
  if (hasAny(l, KW.apic)) return 'EQ_APIC';
  if (hasAny(l, KW.retained)) return 'EQ_RetainedEarnings';
  if (hasAny(l, KW.reserves)) return 'EQ_OtherReserves';
  if (hasAny(l, KW.shareCapital)) return 'EQ_ShareCapital';
  // Liabilities
  if (hasAny(l, KW.currentPortion)) return 'CL_CurrentPortionLTD';
  if (hasAny(l, KW.accruals)) return 'CL_Accruals';
  if (hasAny(l, KW.stBorrow)) return 'CL_ShortTermBorrowings';
  if (hasAny(l, KW.payables)) return 'CL_Payables';
  if (hasAny(l, KW.deferredTaxLiab)) return 'NCL_DeferredTaxLiability';
  if (hasAny(l, KW.leaseLiab)) return 'NCL_LeaseLiability';
  if (hasAny(l, KW.provisions)) return 'NCL_Provisions';
  if (hasAny(l, KW.ltDebt)) return 'NCL_LongTermDebt';
  // Assets
  if (hasAny(l, KW.cash)) return 'CA_Cash';
  if (hasAny(l, KW.receivables)) return 'CA_Receivables';
  if (hasAny(l, KW.inventory)) return 'CA_Inventory';
  if (hasAny(l, KW.prepayments)) return 'CA_Prepayments';
  if (hasAny(l, KW.rou)) return 'NCA_ROU';
  if (hasAny(l, KW.intangible)) return 'NCA_Intangible';
  if (hasAny(l, KW.deferredTaxAsset)) return 'NCA_DeferredTax';
  if (hasAny(l, KW.longInvestment)) return 'NCA_Investment';
  if (hasAny(l, KW.ppe)) return 'NCA_PPE';
  // Default: treat as G&A expense
  return 'OPEX_GA';
}

// ---------- Public classification entry ----------
export function classifyAccount(name: string, number?: string): AccountCategory {
  const lname = (name || '').toLowerCase();
  const bucket = bucketFromNumber(number);
  if (bucket) return refineWithName(bucket, lname);
  return categoryFromNameOnly(name || '');
}

// Legacy helper kept for any existing callers
export function suggestAccountType(name: string): AccountType {
  return categoryToType(classifyAccount(name));
}

// ---------- Formatting ----------
export function formatNumber(num: number): string {
  if (Math.abs(num) < 0.01) return '—';
  if (num < 0) {
    return `(${Math.abs(num).toLocaleString('en-US', { maximumFractionDigits: 0 })})`;
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// ---------- Aggregation helpers ----------
export function netAmount(accs: AccountEntry[]): number {
  return accs.reduce((s, a) => s + a.debit - a.credit, 0);
}

// For presentation: convert raw net into "natural" positive amount based on category
export function presentAmount(a: AccountEntry): number {
  const net = a.debit - a.credit;
  // Assets are debit-natural → positive net is good
  // Liabilities, Equity, Revenue are credit-natural → negative net is "positive" balance
  if (a.category.startsWith('NCA_') || a.category.startsWith('CA_')) return net;
  if (a.category.startsWith('NCL_') || a.category.startsWith('CL_') ||
      a.category.startsWith('EQ_') || a.category.startsWith('REV_') ||
      a.category === 'FIN_Income') return -net;
  // Expenses, COGS, FIN_Cost, TAX → debit-natural
  return net;
}

export function sumByCategory(accounts: AccountEntry[], cats: AccountCategory[]): number {
  return accounts
    .filter(a => cats.includes(a.category))
    .reduce((s, a) => s + presentAmount(a), 0);
}
