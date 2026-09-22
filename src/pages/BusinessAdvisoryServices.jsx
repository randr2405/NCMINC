import ServicePageLayout from '../components/ServicePageLayout'

export default function BusinessAdvisoryServices() {
  return (
    <ServicePageLayout
      title="Business Advisory Services"
      tagline="Strategic Insight. Sustainable Growth. Measurable Results."
      intro="At NCM Inc, our Business Advisory Services are designed to help business owners, directors, entrepreneurs, and investors make informed decisions that drive profitability, growth, and long-term sustainability. We work closely with our clients to identify opportunities, overcome challenges, improve operational efficiency, and create strategies that support business success in a constantly changing economic environment. Whether you are starting a new venture, expanding operations, restructuring your business, seeking funding, or preparing for a merger or acquisition, our experienced advisors provide practical solutions tailored to your unique business needs."
      sections={[
        {
          title: 'Strategic Business Consulting',
          description: 'Expert guidance to help businesses define clear objectives, develop effective strategies, and achieve sustainable growth.',
          items: [
            'Business strategy development',
            'Growth and expansion planning',
            'Competitive market analysis',
            'Business performance reviews',
            'Strategic goal setting and implementation',
            'Corporate governance advisory',
            'Organisational restructuring',
            'Operational efficiency assessments',
            'Risk management and mitigation strategies',
          ],
        },
        {
          title: 'Financial Modelling & Forecasting',
          description: 'Reliable financial forecasts essential for effective decision-making and securing investor confidence.',
          items: [
            'Detailed financial forecasting',
            'Revenue and profitability projections',
            'Cash flow forecasting',
            'Capital expenditure planning',
            'Budget preparation and management',
            'Scenario and sensitivity analysis',
            'Investment feasibility modelling',
            'Funding and loan application support',
          ],
        },
        {
          title: 'Business Valuations',
          description: 'Understanding the true value of your business for strategic planning, transactions and succession. We provide valuations for business sales, shareholder buy-outs, succession and estate planning, litigation support and more, using:',
          items: [
            'Earnings-based valuations',
            'Discounted cash flow models',
            'Asset-based valuations',
            'Market comparison approaches',
          ],
        },
        {
          title: 'Feasibility Studies & Business Planning',
          description: 'Confidence that an opportunity is viable before investing significant resources. Ideal for new ventures, property developments, franchise opportunities, expansion projects and new product launches.',
          items: [
            'Market demand analysis',
            'Industry and competitor assessments',
            'Financial viability reviews',
            'Cost-benefit analysis',
            'Operational feasibility evaluations',
            'Risk assessments',
            'Investment return projections',
            'Business plan preparation',
          ],
        },
        {
          title: 'Cash Flow Management & Profit Improvement',
          description: 'Helping businesses that are profitable but still face cash flow challenges.',
          items: [
            'Improve working capital management',
            'Optimise debtor collections',
            'Manage creditor obligations',
            'Reduce unnecessary costs',
            'Improve profitability margins',
            'Enhance cash conversion cycles',
            'Develop cash preservation strategies',
          ],
        },
        {
          title: 'Mergers & Acquisitions Support',
          description: 'Assistance throughout the acquisition, merger and disposal process.',
          items: [
            'Acquisition target assessments',
            'Financial due diligence',
            'Valuation reviews',
            'Transaction structuring',
            'Financial and tax implications analysis',
            'Negotiation support',
            'Post-acquisition integration planning',
          ],
        },
        {
          title: 'Corporate Finance Advisory',
          description: 'Accessing finance is often critical for business growth.',
          items: [
            'Funding strategy development',
            'Loan and finance applications',
            'Investor presentations',
            'Capital raising support',
            'Debt restructuring',
            'Working capital financing',
            'Equity funding assessments',
          ],
        },
        {
          title: 'Business Restructuring & Turnaround Services',
          description: 'Timely intervention when businesses face financial or operational difficulties.',
          items: [
            'Financial distress assessments',
            'Business recovery planning',
            'Cost reduction strategies',
            'Debt restructuring',
            'Profitability improvement programmes',
            'Operational restructuring',
            'Cash flow stabilisation',
          ],
        },
        {
          title: 'Succession Planning & Exit Strategies',
          description: 'Planning for the future is essential for business continuity and wealth preservation.',
          items: [
            'Develop succession plans',
            'Structure ownership transitions',
            'Prepare businesses for sale',
            'Maximise business value before exit',
            'Facilitate family business transitions',
            'Manage stakeholder expectations',
          ],
        },
        {
          title: 'Management Consulting',
          description: 'Assisting management teams in strengthening business performance through:',
          items: [
            'Key Performance Indicator (KPI) development',
            'Management reporting frameworks',
            'Internal control improvements',
            'Business process optimisation',
            'Performance monitoring systems',
            'Strategic performance reviews',
          ],
        },
        {
          title: 'Entrepreneur & SME Advisory',
          description: 'Specialised support for small and medium-sized businesses.',
          items: [
            'Start-up consulting',
            'Business registrations',
            'Funding readiness assessments',
            'Financial management support',
            'Growth planning',
            'Compliance guidance',
            'Business mentoring',
          ],
        },
      ]}
      valuePoints={[
        'Chartered Accountants (SA) and Registered Auditors',
        'Practical, results-driven advice',
        'Industry-specific expertise',
        'Tailored business solutions',
        'Strategic and financial insight',
        'Long-term partnership approach',
        'Trusted advisors committed to your success',
      ]}
    />
  )
}