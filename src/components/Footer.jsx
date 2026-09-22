import { Link } from 'react-router-dom'

export default function Footer() {
  const services = [
    { name: 'Audit & Assurance', path: '/audit-assurance-services' },
    { name: 'Accounting & Financial Reporting', path: '/accounting-financial-reporting' },
    { name: 'Tax Services', path: '/tax-services' },
    { name: 'Business Advisory', path: '/business-advisory-services' },
    { name: 'Company Secretarial Services', path: '/company-secretarial-services' },
    { name: 'Payroll & HR Services', path: '/payroll-hr-services' },
    { name: 'Fiduciary & Trust Services', path: '/fiduciary-trust-services' },
    { name: 'B-BBEE Advisory', path: '/bbbee-services' },
    { name: 'Business Process Outsourcing', path: '/business-process-outsourcing' },
  ]

  const year = new Date().getFullYear()

  return (
    <footer className="text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
      <div className="px-8 py-14 max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-left">
        {/* Brand */}
        <div>
          <h3 className="text-xl font-bold mb-2">
            NCM <span style={{ color: 'var(--ncm-red)' }}>INC</span>
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Chartered Accountants (SA) & Registered Auditors
          </p>
          <p className="text-sm italic text-gray-400">
            Delivering Excellence Through Integrity, Insight and Innovation.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-semibold mb-4" style={{ color: 'var(--ncm-silver)' }}>Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about-us" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold mb-4" style={{ color: 'var(--ncm-silver)' }}>Our Services</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {services.map((s) => (
              <li key={s.path}>
                <Link to={s.path} className="hover:text-white">{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4" style={{ color: 'var(--ncm-silver)' }}>Get in Touch</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📞 062 830 3044</li>
            <li>💬 083 333 9349</li>
            <li>✉️ admin@ncmca.co.za</li>
            <li>🌐 www.ncmca.co.za</li>
            <li>📍 Durban, Umhlanga, Ballito & Richards Bay</li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-gray-500" style={{ borderColor: '#2a2a2a' }}>
        © {year} NCM Inc Chartered Accountants (SA) & Registered Auditors. All rights reserved.
      </div>
    </footer>
  )
}