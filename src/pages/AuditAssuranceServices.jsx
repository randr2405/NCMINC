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
          title: 'Statutory Audits',
          description: 'Independent statutory audits in accordance with the International Standards on Auditing (ISA) and applicable South African legislation, providing:',
          items: [
            'Independent verification of financial statements',
            'Enhanced credibility with investors, lenders and stakeholders',
            'Compliance with Companies Act requirements',
            'Improved financial transparency and accountability',
            'Identification of key business and financial risks',
          ],
        },
        {
          title: 'External Audits',
          description: 'An objective assessment of your financial reporting processes and controls.',
          items: [
            'Increased stakeholder confidence',
            'Improved corporate governance',
            'Enhanced operational efficiency',
            'Stronger financial reporting practices',
            'Assurance over financial accuracy and completeness',
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
          title: 'Due Diligence Reviews',
          description: 'For buying, selling, merging or investing in a business — identifying risks and opportunities before critical decisions. Our reviews cover:',
          items: [
            'Financial due diligence',
            'Tax due diligence',
            'Operational assessments',
            'Compliance reviews',
            'Commercial risk analysis',
            'Working capital evaluations',
            'Quality of earnings assessments',
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
          title: 'Compliance Audits',
          description: 'Assessing compliance with applicable legislation, regulations, policies and industry standards.',
          items: [
            'Companies Act compliance',
            'Tax compliance',
            'Trust administration compliance',
            'Corporate governance requirements',
            'Industry-specific regulations',
            'Internal policy adherence',
          ],
        },
        {
          title: 'IT Audit & Technology Assurance',
          description: 'Assessing the effectiveness and security of your information systems.',
          items: [
            'IT governance reviews',
            'Cybersecurity assessments',
            'Access control reviews',
            'Data protection compliance',
            'System implementation reviews',
            'Disaster recovery evaluations',
            'IT risk assessments',
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
        'Industry Expertise — experience across manufacturing, retail, professional services, NPOs, trusts and property',
        'Regulatory Knowledge — deep understanding of South African regulatory, tax and financial reporting requirements',
        'Risk-Focused Approach — identifying risks before they become problems',
        'Value-Adding Insights — practical recommendations that support growth and improved performance',
      ]}
    />
  )
}