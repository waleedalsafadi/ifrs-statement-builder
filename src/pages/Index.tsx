import { useState, useCallback } from 'react';
import { AccountEntry, AccountCategory, classifyAccount, categoryToType } from '@/lib/accountUtils';
import { BudgetItem } from '@/lib/budgetTypes';
import FileUpload from '@/components/FileUpload';
import BalanceSummary from '@/components/BalanceSummary';
import AccountsTable from '@/components/AccountsTable';
import AdjustmentEntry from '@/components/AdjustmentEntry';
import FinancialStatements from '@/components/FinancialStatements';
import VerticalAnalysis from '@/components/VerticalAnalysis';
import HorizontalAnalysis from '@/components/HorizontalAnalysis';
import FinancialRatios from '@/components/FinancialRatios';
import BudgetEntry from '@/components/BudgetEntry';
import BudgetAnalysis from '@/components/BudgetAnalysis';
import Dashboard from '@/components/Dashboard';
import ReportHeader from '@/components/ReportHeader';
import ExportButtons from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart3, ArrowLeftRight, TrendingUp, Target, LayoutDashboard } from 'lucide-react';

export default function Index() {
  const [currentAccounts, setCurrentAccounts] = useState<AccountEntry[]>([]);
  const [previousAccounts, setPreviousAccounts] = useState<AccountEntry[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [showStatements, setShowStatements] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [reportDate, setReportDate] = useState('');

  const totalDebit = currentAccounts.reduce((s, a) => s + a.debit, 0);
  const totalCredit = currentAccounts.reduce((s, a) => s + a.credit, 0);
  const difference = totalDebit - totalCredit;
  const isBalanced = Math.abs(difference) < 0.01;

  const handleCurrentLoaded = useCallback((data: AccountEntry[]) => {
    setCurrentAccounts(data);
    setShowStatements(false);
  }, []);

  const handlePreviousLoaded = useCallback((data: AccountEntry[]) => {
    setPreviousAccounts(data.map((a, i) => ({ ...a, id: `prev-${i}` })));
  }, []);

  const handleUpdateCategory = useCallback((id: string, category: AccountCategory) => {
    setCurrentAccounts(prev => prev.map(a => a.id === id ? { ...a, category, type: categoryToType(category) } : a));
  }, []);

  const handleAddAdjustment = useCallback((entry: { name: string; number?: string; debit: number; credit: number }) => {
    const category = classifyAccount(entry.name, entry.number);
    const newEntry: AccountEntry = {
      ...entry,
      id: `adj-${Date.now()}`,
      category,
      type: categoryToType(category),
    };
    setCurrentAccounts(prev => [...prev, newEntry]);
    setShowStatements(false);
  }, []);

  const hasPrevious = previousAccounts.length > 0;
  const hasBudget = budgetItems.length > 0;

  const incomeAccountNames = currentAccounts
    .filter(a => ['Revenue', 'COGS', 'Expense'].includes(a.type))
    .map(a => a.name);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">📋 محلل ميزان المراجعة</h1>
            <p className="text-xs text-muted-foreground">ارفع ملفاتك وأنشئ القوائم المالية والتحليلات</p>
          </div>
          <div className="flex items-center gap-3">
            {showStatements && isBalanced && (
              <ExportButtons accounts={currentAccounts} companyName={companyName} reportDate={reportDate} />
            )}
            {currentAccounts.length > 0 && isBalanced && !showStatements && (
              <Button onClick={() => setShowStatements(true)} className="gap-2">
                <FileText className="w-4 h-4" />
                إنشاء القوائم والتحليلات
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            label="الفترة الحالية"
            sublabel="ملف ميزان المراجعة للفترة الحالية (مطلوب)"
            onDataLoaded={handleCurrentLoaded}
          />
          <FileUpload
            label="الفترة السابقة"
            sublabel="ملف ميزان المراجعة للفترة السابقة (اختياري)"
            onDataLoaded={handlePreviousLoaded}
          />
        </div>

        {currentAccounts.length > 0 && (
          <>
            <ReportHeader
              companyName={companyName}
              reportDate={reportDate}
              onCompanyNameChange={setCompanyName}
              onReportDateChange={setReportDate}
            />

            <BalanceSummary accounts={currentAccounts} />
            {!isBalanced && (
              <AdjustmentEntry onAdd={handleAddAdjustment} difference={difference} />
            )}
            <AccountsTable accounts={currentAccounts} onUpdateCategory={handleUpdateCategory} />

            {isBalanced && !hasBudget && (
              <BudgetEntry incomeAccountNames={incomeAccountNames} onBudgetLoaded={setBudgetItems} />
            )}

            {showStatements && isBalanced && (
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1.5 h-auto flex-wrap gap-1">
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    الداشبورد
                  </TabsTrigger>
                  <TabsTrigger value="statements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold gap-2">
                    <FileText className="w-4 h-4" />
                    القوائم المالية
                  </TabsTrigger>
                  <TabsTrigger value="vertical" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold gap-2">
                    <BarChart3 className="w-4 h-4" />
                    التحليل العامودي
                  </TabsTrigger>
                  <TabsTrigger value="horizontal" disabled={!hasPrevious} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold gap-2 disabled:opacity-40">
                    <ArrowLeftRight className="w-4 h-4" />
                    التحليل الأفقي
                  </TabsTrigger>
                  <TabsTrigger value="ratios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold gap-2">
                    <TrendingUp className="w-4 h-4" />
                    النسب المالية
                  </TabsTrigger>
                  <TabsTrigger value="budget" disabled={!hasBudget} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold gap-2 disabled:opacity-40">
                    <Target className="w-4 h-4" />
                    الموازنة
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6">
                  <Dashboard
                    currentAccounts={currentAccounts}
                    previousAccounts={hasPrevious ? previousAccounts : null}
                    budget={hasBudget ? budgetItems : null}
                  />
                </TabsContent>
                <TabsContent value="statements" className="mt-6">
                  <FinancialStatements accounts={currentAccounts} />
                </TabsContent>
                <TabsContent value="vertical" className="mt-6">
                  <VerticalAnalysis accounts={currentAccounts} />
                </TabsContent>
                <TabsContent value="horizontal" className="mt-6">
                  {hasPrevious && <HorizontalAnalysis currentAccounts={currentAccounts} previousAccounts={previousAccounts} />}
                </TabsContent>
                <TabsContent value="ratios" className="mt-6">
                  <FinancialRatios currentAccounts={currentAccounts} previousAccounts={hasPrevious ? previousAccounts : null} />
                </TabsContent>
                <TabsContent value="budget" className="mt-6">
                  {hasBudget && <BudgetAnalysis accounts={currentAccounts} budget={budgetItems} />}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>
    </div>
  );
}
