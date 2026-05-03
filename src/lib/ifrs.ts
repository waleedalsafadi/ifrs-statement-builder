import {
  AccountEntry, AccountCategory, sumByCategory,
} from './accountUtils';

export interface BalanceSheetData {
  // Non-current assets
  ppe: number;
  rou: number;
  intangible: number;
  ltInvestment: number;
  deferredTaxAsset: number;
  ncaOther: number;
  totalNCA: number;
  // Current assets
  inventory: number;
  receivables: number;
  prepayments: number;
  cash: number;
  caOther: number;
  totalCA: number;
  totalAssets: number;
  // Non-current liabilities
  ltDebt: number;
  leaseLiability: number;
  provisions: number;
  deferredTaxLiability: number;
  nclOther: number;
  totalNCL: number;
  // Current liabilities
  payables: number;
  stBorrowings: number;
  accruals: number;
  currentPortionLTD: number;
  clOther: number;
  totalCL: number;
  totalLiabilities: number;
  // Equity
  shareCapital: number;
  apic: number;
  retainedEarnings: number;
  otherReserves: number;
  netIncome: number;
  totalEquity: number;
  totalLiabAndEquity: number;
  balanced: boolean;
  imbalance: number;
}

export interface IncomeStatementData {
  revenueOperating: number;
  revenueOther: number;
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  selling: number;
  ga: number;
  da: number;
  totalOpex: number;
  operatingProfit: number;       // EBIT
  ebitda: number;
  operatingMargin: number;
  finIncome: number;
  finCost: number;
  netFinanceCost: number;
  profitBeforeTax: number;
  taxExpense: number;
  netIncome: number;
  netMargin: number;
}

export function computeIncomeStatement(accounts: AccountEntry[]): IncomeStatementData {
  const sum = (cats: AccountCategory[]) => sumByCategory(accounts, cats);

  const revenueOperating = sum(['REV_Operating']);
  const revenueOther = sum(['REV_Other']);
  const totalRevenue = revenueOperating + revenueOther;
  const cogs = sum(['COGS']);
  const grossProfit = totalRevenue - cogs;
  const grossMargin = totalRevenue ? (grossProfit / totalRevenue) * 100 : 0;

  const selling = sum(['OPEX_Selling']);
  const ga = sum(['OPEX_GA']);
  const da = sum(['OPEX_DA']);
  const totalOpex = selling + ga + da;

  const operatingProfit = grossProfit - totalOpex;
  const ebitda = operatingProfit + da;
  const operatingMargin = totalRevenue ? (operatingProfit / totalRevenue) * 100 : 0;

  const finIncome = sum(['FIN_Income']);
  const finCost = sum(['FIN_Cost']);
  const netFinanceCost = finCost - finIncome;

  const profitBeforeTax = operatingProfit - netFinanceCost;
  const taxExpense = sum(['TAX_Income']);
  const netIncome = profitBeforeTax - taxExpense;
  const netMargin = totalRevenue ? (netIncome / totalRevenue) * 100 : 0;

  return {
    revenueOperating, revenueOther, totalRevenue,
    cogs, grossProfit, grossMargin,
    selling, ga, da, totalOpex,
    operatingProfit, ebitda, operatingMargin,
    finIncome, finCost, netFinanceCost,
    profitBeforeTax, taxExpense, netIncome, netMargin,
  };
}

export function computeBalanceSheet(accounts: AccountEntry[]): BalanceSheetData {
  const sum = (cats: AccountCategory[]) => sumByCategory(accounts, cats);
  const is = computeIncomeStatement(accounts);

  const ppe = sum(['NCA_PPE']);
  const rou = sum(['NCA_ROU']);
  const intangible = sum(['NCA_Intangible']);
  const ltInvestment = sum(['NCA_Investment']);
  const deferredTaxAsset = sum(['NCA_DeferredTax']);
  const ncaOther = sum(['NCA_Other']);
  const totalNCA = ppe + rou + intangible + ltInvestment + deferredTaxAsset + ncaOther;

  const inventory = sum(['CA_Inventory']);
  const receivables = sum(['CA_Receivables']);
  const prepayments = sum(['CA_Prepayments']);
  const cash = sum(['CA_Cash']);
  const caOther = sum(['CA_Other']);
  const totalCA = inventory + receivables + prepayments + cash + caOther;

  const totalAssets = totalNCA + totalCA;

  const ltDebt = sum(['NCL_LongTermDebt']);
  const leaseLiability = sum(['NCL_LeaseLiability']);
  const provisions = sum(['NCL_Provisions']);
  const deferredTaxLiability = sum(['NCL_DeferredTaxLiability']);
  const nclOther = sum(['NCL_Other']);
  const totalNCL = ltDebt + leaseLiability + provisions + deferredTaxLiability + nclOther;

  const payables = sum(['CL_Payables']);
  const stBorrowings = sum(['CL_ShortTermBorrowings']);
  const accruals = sum(['CL_Accruals']);
  const currentPortionLTD = sum(['CL_CurrentPortionLTD']);
  const clOther = sum(['CL_Other']);
  const totalCL = payables + stBorrowings + accruals + currentPortionLTD + clOther;

  const totalLiabilities = totalNCL + totalCL;

  const shareCapital = sum(['EQ_ShareCapital']);
  const apic = sum(['EQ_APIC']);
  const retainedEarnings = sum(['EQ_RetainedEarnings']);
  const otherReserves = sum(['EQ_OtherReserves']);
  const netIncome = is.netIncome;
  const totalEquity = shareCapital + apic + retainedEarnings + otherReserves + netIncome;

  const totalLiabAndEquity = totalLiabilities + totalEquity;
  const imbalance = totalAssets - totalLiabAndEquity;
  const balanced = Math.abs(imbalance) < 0.5;

  return {
    ppe, rou, intangible, ltInvestment, deferredTaxAsset, ncaOther, totalNCA,
    inventory, receivables, prepayments, cash, caOther, totalCA,
    totalAssets,
    ltDebt, leaseLiability, provisions, deferredTaxLiability, nclOther, totalNCL,
    payables, stBorrowings, accruals, currentPortionLTD, clOther, totalCL,
    totalLiabilities,
    shareCapital, apic, retainedEarnings, otherReserves, netIncome, totalEquity,
    totalLiabAndEquity, balanced, imbalance,
  };
}
