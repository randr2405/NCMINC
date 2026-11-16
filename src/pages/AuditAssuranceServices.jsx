import ServicePageLayout from '../components/ServicePageLayout'

export default function AuditAssuranceServices() {
  return (
    <ServicePageLayout
      title="Audit & Assurance Services"
      tagline="Trusted Audit. Reliable Insight. Better Decisions."
      intro="At NCM Inc Chartered Accountants (SA) & Registered Auditors, we provide independent audit and assurance services designed to enhance credibility, strengthen governance, improve risk management, and give stakeholders confidence in your financial information. Whether you are a growing business, a large corporate, a non-profit organisation, a trust, or a public interest entity, our experienced professionals deliver practical solutions tailored to your specific industry and regulatory requirements."
      highlights={[
        'Independent & Objective',
        'Experienced Professionals',
        'Industry Expertise',
        'Risk-Focused Approach',
        'Value-Adding Insights',
        'Commitment to Excellence',
      ]}
      sections={[
        {
          title: 'Statutory, External & Compliance Audits',
          description: 'Independent audits in accordance with the International Standards on Auditing (ISA) and applicable South African legislation, including an objective assessment of your financial reporting processes and controls, and of your compliance with applicable legislation, regulations, policies and industry standards, providing:',
          items: [
            'Independent verification of financial statements and assurance over their accuracy and completeness',
            'Enhanced credibility and confidence among investors, lenders and stakeholders',
            'Companies Act compliance',
            'Improved financial transparency and accountability',
            'Identification of key business and financial risks',
            'Improved corporate governance',
            'Enhanced operational efficiency',
            'Stronger financial reporting practices',
            'Tax compliance',
            'Trust administration compliance',
            'Industry-specific regulations',
            'Internal policy adherence',
          ],
        },
        {
          title: 'Internal Audit Services',
          description: 'Evaluating and improving risk management, governance and internal control systems. Key areas reviewed:',
          items: [
            'Financial controls',
            'Operational effectiveness',
            'Regulatory compliance',
            'Information technology controls',
            'Fraud prevention measures',
            'Risk management frameworks',
          ],
        },
        {
          title: 'Forensic Audits',
          description: 'Specialised investigations into suspected fraud, irregularities and financial misconduct, delivering clear, evidence-based findings you can act on. Our forensic services include:',
          items: [
            'Fraud and financial misconduct investigations',
            'Detection of misappropriation of assets and funds',
            'Forensic analysis of accounting records and transactions',
            'Evidence gathering and preservation',
            'Fraud risk assessments and control weakness identification',
            'Expert reports to support disciplinary, civil and criminal proceedings',
            'Recommendations to strengthen fraud prevention measures',
          ],
        },
        {
          title: 'Independent Reviews',
          description: 'For entities not requiring a full audit — limited assurance engagements offering:',
          items: [
            'Cost-effective assurance solution',
            'Compliance with regulatory requirements',
            'Improved financial credibility',
            'Enhanced stakeholder confidence',
            'Timely reporting',
          ],
        },
        {
          title: 'Agreed-Upon Procedures Engagements',
          description: 'Specific procedures agreed between the client and relevant stakeholders, reporting factual findings without expressing an audit opinion. Common engagements:',
          items: [
            'Grant expenditure verification',
            'Contract compliance reviews',
            'Funding utilisation assessments',
            'Regulatory reporting verification',
            'Financial information validation',
          ],
        },
        {
          title: 'Audit Readiness Assessments',
          description: 'Ensuring your organisation is fully prepared before the audit process begins.',
          items: [
            'Financial statement preparation',
            'Supporting documentation reviews',
            'Internal control assessments',
            'Compliance gap identification',
            'Audit file preparation',
            'Management reporting reviews',
          ],
        },
        {
          title: 'Risk Management Reviews',
          description: 'Helping organisations understand and manage risk for sustainable growth.',
          items: [
            'Identify strategic and operational risks',
            'Assess risk mitigation measures',
            'Strengthen internal controls',
            'Improve governance structures',
            'Enhance business resilience',
            'Support informed decision-making',
          ],
        },
        {
          title: 'Corporate Governance Assurance',
          description: 'Strengthening governance frameworks and aligning with best practices.',
          items: [
            'Board governance effectiveness',
            'Governance framework assessments',
            'Committee performance reviews',
            'Ethics and compliance monitoring',
            'King IV™ governance principles',
            'Accountability and transparency enhancements',
          ],
        },
      ]}
      valuePoints={[
        'Independent & Objective — unbiased assurance you can trust',
        'Experienced Professionals — qualified Chartered Accountants & Registered Auditors',
        'Industry Expertise — experience across all industries and sectors, with no limitation to any specific field',
        'Regulatory Knowledge — deep understanding of South African regulatory, tax and financial reporting requirements',
        'Risk-Focused Approach — identifying risks before they become problems',
        'Value-Adding Insights — practical recommendations that support growth and improved performance',
      ]}
    />
  )
}