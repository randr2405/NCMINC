import ServicePageLayout from '../components/ServicePageLayout'

export default function FiduciaryTrustServices() {
  return (
    <ServicePageLayout
      title="Fiduciary & Trust Services"
      sections={[
        {
          title: 'Trust Formation & Registration',
          items: [
            'Inter Vivos Trusts',
            'Testamentary Trusts',
            'Family and Asset Protection Trusts',
            'Charitable and Special-Purpose Trusts',
            'Trust Deed Drafting & Amendments',
          ],
        },
        {
          title: 'Trust Administration',
          items: [
            'Full Trust Administration',
            'Trustee Appointment & Resignation',
            'Trustee Resolutions & Minutes',
            'Beneficiary Administration',
            'Trust Accounting & Financial Statements',
            'Trust Asset & Investment Administration',
            'Maintenance of Trust Records',
          ],
        },
        {
          title: 'Trust Tax & Compliance',
          items: [
            'Trust Income Tax Returns',
            'Provisional Tax Administration',
            'Capital Gains Tax',
            'Donations Tax',
            'Beneficiary Tax & Distributions',
            'SARS Trust Compliance',
            'Beneficial Ownership Compliance',
            'Trustee Compliance & Record Keeping',
          ],
        },
        {
          title: 'Estate Planning & Wealth Structuring',
          items: [
            'Estate Planning',
            'Intergenerational Wealth Planning',
            'Asset Protection Structures',
            'Succession Planning',
            'Family Wealth Structures',
            'Business & Investment Structuring',
            'Tax-Efficient Wealth Transfer',
          ],
        },
        {
          title: 'Deceased Estate Administration',
          items: [
            'Estate Administration',
            'Executor Services',
            'Estate Accounts',
            'Estate Tax & SARS Compliance',
            'Asset & Liability Verification',
            'Distribution to Beneficiaries',
            'Estate Planning & Winding-Up',
          ],
        },
        {
          title: 'Fiduciary Advisory',
          items: [
            'Independent Trustee Services',
            'Professional Trustee Services',
            'Trustee Advisory',
            'Beneficiary Advisory',
            'Trust Reviews & Restructuring',
            'Fiduciary Risk Management',
            'Succession & Governance Advisory',
          ],
        },
      ]}
    />
  )
}