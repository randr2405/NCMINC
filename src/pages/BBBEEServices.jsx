import ServicePageLayout from '../components/ServicePageLayout'

export default function BBBEEServices() {
  return (
    <ServicePageLayout
      title="B-BBEE Services"
      intro="At NCM Inc, we assist businesses in navigating the B-BBEE framework, improving their transformation performance and strengthening their competitiveness in the marketplace. Our approach goes beyond scorecard preparation — we help clients develop practical, sustainable strategies that align B-BBEE compliance with their broader business objectives."
      sections={[
        {
          title: 'B-BBEE Verification Preparation & Readiness',
          items: [
            'Pre-verification assessments',
            'Evidence and document reviews',
            'Gap analysis',
            'Verification preparation and support',
          ],
        },
        {
          title: 'B-BBEE Scorecard Assessments',
          items: [
            'Generic and specialised scorecards',
            'Annual scorecard assessments',
            'Element-by-element performance analysis',
            'Identification of improvement opportunities',
          ],
        },
        {
          title: 'Ownership Structuring & Advisory',
          items: [
            'B-BBEE ownership assessments',
            'Ownership structure analysis',
            'Transaction structuring considerations',
            'Advice on optimising ownership points',
          ],
        },
        {
          title: 'Management Control & Employment Equity',
          items: [
            'Management control assessments',
            'Employment equity alignment',
            'Skills and workforce planning',
            'Identification of potential compliance gaps',
          ],
        },
        {
          title: 'Skills Development',
          items: [
            'Skills development strategy',
            'Learnership and training planning',
            'Skills expenditure assessments',
            'Alignment of training initiatives with B-BBEE objectives',
          ],
        },
        {
          title: 'Enterprise & Supplier Development',
          items: [
            'Enterprise development strategies',
            'Supplier development programmes',
            'Beneficiary identification and assessment',
            'Procurement and supplier optimisation',
            'Structuring qualifying initiatives',
          ],
        },
        {
          title: 'Socio-Economic Development',
          items: [
            'SED strategy and planning',
            'Qualifying beneficiary assessments',
            'Contribution planning',
            'Evidence and compliance support',
          ],
        },
        {
          title: 'B-BBEE Compliance & Advisory',
          items: [
            'B-BBEE policy and regulatory guidance',
            'Ongoing compliance monitoring',
            'Supporting-documentation reviews',
            'Transformation strategy',
            'B-BBEE risk assessments',
          ],
        },
        {
          title: 'Strategic B-BBEE Advisory',
          description: "We don't simply help you obtain a score — we help you understand what drives your score and how to improve it. Our advisory approach considers the following to develop a practical transformation roadmap appropriate to your business:",
          items: [
            'Ownership',
            'Procurement',
            'Skills Development',
            'Enterprise and Supplier Development',
            'Management Control',
            'Socio-Economic Development',
          ],
        },
      ]}
    />
  )
}