# IFRS Financial Statement Builder

Takes a trial balance and produces a full IFRS-structured set of financial statements, with the analysis layer a finance team would normally rebuild by hand in Excel every period.

## What it does

**Statements**
- Balance sheet laid out to IFRS: non-current assets (PPE, right-of-use, intangibles, long-term investments, deferred tax), current assets, non-current and current liabilities (including lease liabilities, provisions, current portion of long-term debt), and equity
- Income statement down to net income: gross profit and margin, operating profit (EBIT), EBITDA, net finance cost, profit before tax, tax, net margin
- Balance check with the imbalance figure shown, not just a pass/fail

**Working with the data**
- Upload a trial balance
- Account classification into IFRS categories
- Adjusting entries before the statements are finalised

**Analysis**
- Vertical analysis (common-size)
- Horizontal analysis (period over period)
- Financial ratios
- Budget entry and budget-versus-actual comparison
- Export

## Why it exists

Preparing statements from a trial balance is mechanical work that still eats a day or two of every close, mostly because the mapping and the balance check get rebuilt from scratch each time. The classification logic here is explicit and sits in one place (`src/lib/ifrs.ts`, `src/lib/accountUtils.ts`), so it can be read, argued with, and adjusted rather than buried in spreadsheet formulas.

## Stack

React, TypeScript, Vite, Tailwind, shadcn/ui. Tests with Vitest and Playwright.

No backend and no database — everything runs in the browser, so nothing you upload leaves your machine.

## Running locally

```bash
git clone <this-repo>
cd ifrs-financial-statement-builder
npm install
npm run dev
```

## Background

I'm a fractional CFO working with SMEs, startups and NGOs across Türkiye, Syria and the GCC. This came out of doing the same close process for enough clients to want it codified.

Waleed Al-Safadi — Budget Consultancy and Development
info@budget-cd.com

## License

MIT
