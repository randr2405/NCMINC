import { Link } from 'react-router-dom'

export default function Home() {
  const services = [
    {
      title: "Audit & Assurance",
      path: "/audit-assurance-services",
      items: ["Statutory Audits", "External Audits", "Internal Audits", "Independent Reviews", "Due Diligence Reviews"],
    },
    {
      title: "Accounting & Financial Reporting",
      path: "/accounting-financial-reporting",
      items: ["Monthly Bookkeeping", "Management Accounts", "Annual Financial Statements", "IFRS / IFRS for SMEs Compliance", "Cash Flow Management"],
    },
    {
      title: "Tax Services",
      path: "/tax-services",
      items: ["Corporate & Individual Income Tax", "VAT Registration and Compliance", "PAYE, UIF and SDL Compliance", "Tax Planning and Advisory", "SARS Objections and Appeals"],
    },
    {
      title: "Business Advisory",
      path: "/business-advisory-services",
      items: ["Business Consulting", "Strategic Planning", "Financial Modelling", "Business Valuations", "Mergers and Acquisitions Support"],
    },
    {
      title: "Company Secretarial Services",
      path: "/company-secretarial-services",
      items: ["Company Registrations", "CIPC Compliance", "Annual Returns", "Share Allotments and Transfers", "Beneficial Ownership Compliance"],
    },
    {
      title: "Payroll & HR Services",
      path: "/payroll-hr-services",
      items: ["Payroll Processing", "EMP201 and EMP501 Submissions", "UIF Administration", "IRP5 Certificates", "Employment Tax Advisory"],
    },
    {
      title: "Fiduciary & Trust Services",
      path: "/fiduciary-trust-services",
      items: ["Trust Formation and Administration", "Estate Planning", "Deceased Estate Administration", "Trustee Services", "Succession Planning"],
    },
    {
      title: "B-BBEE Advisory",
      path: "/bbbee-services",
      items: ["B-BBEE Verification Preparation", "Scorecard Assessments", "Ownership Structuring", "Enterprise & Supplier Development", "B-BBEE Compliance Consulting"],
    },
    {
      title: "Business Process Outsourcing",
      path: "/business-process-outsourcing",
      items: ["Outsourced Accounting", "Virtual CFO Services", "Financial Controller Services", "Finance Department Outsourcing", "Management Reporting"],
    },
  ]

  return (
    <div className="text-black">
      {/* Hero */}
      <section className="px-8 py-24 text-center text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <p className="uppercase tracking-widest text-sm mb-4" style={{ color: 'var(--ncm-silver)' }}>
          Chartered Accountants (SA) & Registered Auditors
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Trusted Advice. <span style={{ color: 'var(--ncm-red)' }}>Smart Solutions.</span><br />
          Stronger Businesses.
        </h1>
        <p className="max-w-2xl mx-auto mt-6 text-gray-300 text-lg">
          We are a professional accounting and audit firm committed to delivering
          exceptional service, value and integrity.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/contact"
            className="px-6 py-3 rounded-md font-semibold text-white"
            style={{ backgroundColor: 'var(--ncm-red)' }}
          >
            Get in Touch
          </Link>
          <Link
            to="/about-us"
            className="px-6 py-3 rounded-md font-semibold border"
            style={{ borderColor: 'var(--ncm-silver)', color: 'var(--ncm-silver)' }}
          >
            Learn More About Us
          </Link>
        </div>
      </section>

      {/* Intro strip */}
      <section className="px-8 py-14 text-center" style={{ backgroundColor: 'var(--ncm-grey)' }}>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg">
          For more than 40 years, NCM Inc has served the South African business community
          with professionalism, integrity and a commitment to excellence. Today, under new
          management, we combine that heritage with modern technology and a client-focused
          approach to professional services.
        </p>
      </section>

      {/* Services grid */}
      <section className="px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-red)' }}>
          Our Professional Services
        </h2>
        <p className="text-center text-gray-600 mb-12">
          An integrated range of professional services under one trusted roof.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.path}
              to={s.path}
              className="block p-6 rounded-lg border hover:shadow-lg transition-shadow"
              style={{ borderColor: 'var(--ncm-silver)' }}
            >
              <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--ncm-black)' }}>
                {s.title}
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: 'var(--ncm-red)' }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <span className="inline-block mt-4 text-sm font-medium" style={{ color: 'var(--ncm-red)' }}>
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why NCM strip */}
      <section className="px-8 py-16 text-white text-center" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          More Than Compliance. A Professional Partner.
        </h2>
        <p className="max-w-2xl mx-auto text-gray-300 mb-8">
          Businesses today require more than accountants who prepare financial statements
          and tax returns — they require advisers who understand their challenges, identify
          opportunities and help them make informed decisions.
        </p>
        <Link
          to="/about-us"
          className="inline-block px-6 py-3 rounded-md font-semibold text-white"
          style={{ backgroundColor: 'var(--ncm-red)' }}
        >
          Why Choose NCM Inc
        </Link>
      </section>

      {/* Contact strip */}
      <section className="px-8 py-14 text-center" style={{ backgroundColor: 'var(--ncm-grey)' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--ncm-black)' }}>Get in Touch</h2>
        <p className="text-gray-600 mb-8">Durban, Umhlanga, Ballito and Richards Bay</p>
        <div className="flex flex-wrap justify-center gap-8 text-gray-700 text-sm">
          <span>📞 062 830 3044</span>
          <span>💬 083 333 9349</span>
          <span>✉️ admin@ncmca.co.za</span>
          <span>🌐 www.ncmca.co.za</span>
        </div>
        <p className="mt-8 italic text-gray-500">
          Delivering Excellence Through Integrity, Insight and Innovation.
        </p>
      </section>
    </div>
  )
}