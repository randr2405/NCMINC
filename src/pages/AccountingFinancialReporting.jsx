import ServicePageLayout from '../components/ServicePageLayout'

export default function AccountingFinancialReporting() {
  return (
    <ServicePageLayout
      title="Accounting & Financial Reporting"
      tagline="Accurate Financial Information. Informed Business Decisions."
      intro="At NCM Inc, we understand that accurate accounting and reliable financial reporting form the foundation of every successful business. Whether you are a start-up, growing SME, established company, trust, non-profit organisation, or owner-managed business, our accounting and financial reporting services are designed to provide you with accurate financial information, regulatory compliance, and valuable insights to support informed decision-making."
      highlights={[
        'Accurate Information',
        'Better Decisions',
        'Compliance Assurance',
        'Improved Cash Flow',
        'Confidence for Stakeholders',
        'Insights for Growth',
      ]}
      sections={[
        {
          title: '1. Bookkeeping & Financial Record Management',
          items: [
            'Daily, weekly, monthly and annual bookkeeping',
            'Recording and processing of financial transactions',
            'General ledger maintenance',
            'Bank, cash and credit card reconciliations',
            'Accounts payable and receivable management',
            'Debtors and creditors reconciliations',
            'Inventory accounting and stock control support',
            'Payroll accounting integration',
            'Fixed asset register maintenance',
            'Financial record clean-up and reconstruction',
            'Cloud accounting support and implementation',
          ],
        },
        {
          title: '2. Preparation of Annual Financial Statements',
          items: [
            'Statement of Financial Position (Balance Sheet)',
            'Statement of Profit or Loss and Other Comprehensive Income',
            'Statement of Changes in Equity',
            'Statement of Cash Flows',
            'Detailed Notes to the Financial Statements',
            'Accounting Policies and Disclosures',
            "Directors' Reports where applicable",
            'Supporting schedules and working papers',
          ],
        },
        {
          title: '3. Management Accounts & Periodic Reporting',
          items: [
            'Monthly, quarterly and interim management accounts',
            'Executive financial summaries',
            'Departmental performance reports',
            'Revenue and expense trend analysis',
            'Profitability reports',
            'Budget versus actual performance reports',
            'Cash flow reports and working capital analysis',
          ],
        },
        {
          title: '4. Financial Reporting & Regulatory Compliance',
          items: [
            'Reporting in accordance with applicable accounting standards',
            'Companies Act compliance support',
            'Corporate governance reporting assistance',
            'Financial information for regulatory submissions',
            'Compliance reporting for trusts and non-profit organisations',
            'Independent review and audit preparation support',
          ],
        },
        {
          title: '5. Cash Flow Management & Forecasting',
          items: [
            'Cash flow forecasting and budgeting',
            'Working capital management',
            'Liquidity assessments',
            'Cash flow scenario planning',
            'Debtor collection analysis',
            'Creditor payment planning',
            'Capital expenditure forecasting',
          ],
        },
        {
          title: '6. Budgeting & Financial Planning',
          items: [
            'Annual operating budgets',
            'Capital expenditure budgets',
            'Revenue and expense forecasting',
            'Departmental and project budgets',
            'Multi-year financial planning',
            'Scenario and sensitivity analysis',
            'Budget performance monitoring',
          ],
        },
        {
          title: '7. Financial Analysis & Business Performance Reviews',
          description: 'Profitability, liquidity, solvency and operational performance reviews, including:',
          items: [
            'Gross and net profit analysis',
            'Product, service and customer profitability reviews',
            'Current ratio, quick ratio and working capital assessments',
            'Debt-to-equity and leverage analysis',
            'Revenue growth and cost management assessments',
            'Benchmarking against industry standards',
          ],
        },
        {
          title: '8. Year-End Accounting & Financial Close',
          items: [
            'Year-end reconciliations and general ledger reviews',
            'Fixed asset verification and depreciation calculations',
            'Accrual and provision calculations',
            'Inventory valuations',
            'Debtor and creditor confirmations',
            'Tax adjustment calculations',
            'Audit and independent review preparation',
          ],
        },
        {
          title: 'Cloud Accounting & Digital Financial Solutions',
          description: 'We support the implementation and management of cloud-based accounting systems, including:',
          items: [
            'Real-time financial reporting',
            'Secure cloud-based record keeping',
            'Automated transaction processing',
            'Remote access to financial information',
            'System setup, migration, training and ongoing support',
          ],
        },
      ]}
      valuePoints={[
        'Accurate and reliable financial information',
        'Improved decision-making through meaningful reporting',
        'Enhanced regulatory compliance',
        'Better cash flow management',
        'Increased profitability and operational efficiency',
        'Reduced financial and compliance risks',
        'Greater confidence for investors, lenders and stakeholders',
        'Stronger foundations for business growth and long-term success',
      ]}
    />
  )
}