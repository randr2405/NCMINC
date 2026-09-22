import ServicePageLayout from '../components/ServicePageLayout'

export default function TaxServices() {
  return (
    <ServicePageLayout
      title="Tax Services"
      tagline="Stay Compliant. Minimise Tax Risk. Maximise Tax Efficiency."
      intro="Tax compliance in South Africa is increasingly complex, with evolving legislation, strict SARS enforcement, and heightened reporting obligations across all taxpayer categories. At NCM Inc, we provide a fully integrated tax service offering that combines technical expertise, strategic planning, and proactive risk management. Our approach goes beyond compliance — we focus on tax efficiency, financial optimisation, and long-term protection of wealth and business value."
      highlights={[
        'Expert Advice',
        'Tax Efficiency Focused',
        'SARS Compliance',
        'Your Trusted Tax Partner',
      ]}
      sections={[
        {
          title: 'Corporate Income Tax',
          description: 'End-to-end corporate tax compliance and advisory for companies of all sizes, from SMEs to complex group structures.',
          items: [
            'Company income tax registrations with SARS',
            'Preparation, review and submission of annual ITR14 returns',
            'Detailed tax computations aligned to IFRS and accounting records',
            'Deferred tax analysis and reconciliation support',
            'Corporate tax planning aligned to business strategy',
            'Group company tax optimisation and intercompany structuring',
            'Preparation for SARS audits, verifications and reviews',
            'Objections, appeals and dispute resolution',
          ],
        },
        {
          title: 'Individual Income Tax',
          description: 'Complete personal tax management for individuals, professionals and high-net-worth taxpayers.',
          items: [
            'Annual ITR12 income tax return preparation and submission',
            'Provisional tax planning for self-employed individuals and investors',
            'Structuring of remuneration (salary, dividends, bonuses, allowances)',
            'Capital gains tax (CGT) calculations on asset disposals',
            'Rental income tax compliance and property portfolio structuring',
            'Foreign income declarations and offshore investment taxation',
            'Retirement fund, annuity and investment tax planning',
            'Tax clearance certificates for tenders, emigration and finance',
          ],
        },
        {
          title: 'Provisional Tax Services',
          description: 'Critical to avoiding penalties and interest while maintaining cash flow stability.',
          items: [
            'Calculation of accurate provisional tax liabilities',
            'Preparation and submission of IRP6 returns (1st, 2nd and 3rd periods)',
            'Income forecasting based on business performance trends',
            'Cash flow planning aligned to tax obligations',
            'Year-end reconciliation of provisional vs final tax',
            'Strategies to minimise underestimation penalties and interest',
          ],
        },
        {
          title: 'Value Added Tax (VAT)',
          description: 'One of the most sensitive and high-risk tax areas due to frequent audits and strict enforcement.',
          items: [
            'VAT registration, deregistration and category changes',
            'Monthly and bi-monthly VAT 201 return submissions',
            'Input and output VAT reconciliation',
            'VAT ledger balancing and compliance reviews',
            'Assistance with VAT audits, verifications and queries',
            'VAT refund claims and dispute resolution',
            'Industry-specific VAT advisory (property, retail, services, imports/exports)',
          ],
        },
        {
          title: 'Payroll Taxes',
          description: 'Complete payroll tax compliance and employee tax administration.',
          items: [
            'PAYE, UIF and SDL registrations',
            'Monthly EMP201 submissions and reconciliations',
            'Annual EMP501 employer reconciliation declarations',
            'Preparation and issuance of IRP5/IT3(a) certificates',
            'Employee tax calculation and structuring',
            'Employer compliance audits and SARS inspections',
          ],
        },
        {
          title: 'Trust Taxation',
          description: 'Specialised tax handling for the complex attribution rules and distribution structures trusts require.',
          items: [
            'Trust registration with SARS and legal compliance setup',
            'Annual IT12TR trust tax return preparation',
            'Trust deed analysis and tax structuring advice',
            'Income distribution vs retention tax planning',
            'Beneficiary taxation implications and attribution rules',
            'Capital gains tax planning within trust structures',
            'SARS audit support for trusts',
          ],
        },
        {
          title: 'Capital Gains Tax (CGT)',
          description: 'Precise CGT calculations and strategic planning for asset disposals.',
          items: [
            'Calculation of capital gains and losses',
            'Property sale tax implications and exclusions',
            'Share portfolio and investment disposal planning',
            'Business asset sale structuring',
            'Primary residence exclusion optimisation',
            'CGT inclusion rate planning for individuals and companies',
          ],
        },
        {
          title: 'Estate, Donations & Transfer Tax',
          description: 'Supporting intergenerational wealth transfer and estate compliance.',
          items: [
            'Estate duty calculations and SARS submissions',
            'Estate structuring and pre-death tax planning',
            'Donations tax planning and compliance',
            'Transfer duty advisory on property transactions',
            'Deceased estate tax administration and reporting',
            'Succession planning and wealth preservation strategies',
          ],
        },
        {
          title: 'SARS Audits & Dispute Resolution',
          description: 'Acting as your representative in all SARS-related matters.',
          items: [
            'Handling SARS audits, verifications and inspections',
            'Submission of supporting documentation and responses',
            'Objection and appeal preparation and submission',
            'Voluntary Disclosure Programme (VDP) applications',
            'Tax debt negotiations and payment arrangements',
            'Penalty and interest remission applications',
          ],
        },
        {
          title: 'International & Cross-Border Tax',
          description: 'Supporting individuals and businesses operating across jurisdictions.',
          items: [
            'Foreign income declaration and compliance',
            'Double Tax Agreement (DTA) applications and relief claims',
            'Tax residency determination and exit planning',
            'Expatriate tax structuring and optimisation',
            'Offshore investment tax compliance',
            'Exchange control advisory considerations',
          ],
        },
        {
          title: 'Tax Health Checks & Compliance Reviews',
          description: 'A proactive review designed to identify risks before SARS does.',
          items: [
            'Full tax compliance audits across all tax types',
            'Historical return reviews and corrections',
            'Identification of under-declared income or overclaimed deductions',
            'Risk scoring and exposure analysis',
            'VAT, PAYE and income tax reconciliation checks',
            'SARS audit readiness assessments',
          ],
        },
        {
          title: 'Tax Advisory & Planning',
          description: 'High-level strategic tax advisory aligned to business and wealth goals.',
          items: [
            'Business restructuring for tax efficiency',
            'Mergers, acquisitions and due diligence support',
            'Transaction structuring and tax impact analysis',
            'Long-term tax planning strategies',
            'Investment structuring and optimisation',
            'Wealth preservation and succession/exit planning strategies',
            'Executive remuneration structuring (salary vs dividends vs incentives)',
          ],
        },
      ]}
      valuePoints={[
        'Highly experienced tax professionals',
        'Strategic, forward-looking tax planning approach',
        'Full SARS compliance and representation',
        'Tailored solutions for individuals and businesses',
        'Accurate, timeous and compliant submissions',
        'Strong focus on risk reduction and audit prevention',
        'Efficient tax structuring for long-term savings',
        'Trusted advisory partner for financial decision-making',
      ]}
    />
  )
}