import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--ncm-silver)' }}>
      <div className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: 'var(--ncm-black)' }}>
            NCM <span style={{ color: 'var(--ncm-red)' }}>INC</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/about-us" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--ncm-black)' }}>
            About Us
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="cursor-pointer hover:opacity-70 transition-opacity" style={{ color: 'var(--ncm-black)' }}>
              Services
            </button>
            {servicesOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-md py-2 w-72 z-10 border"
                style={{ borderColor: 'var(--ncm-silver)' }}
              >
                {services.map((s) => (
                  <Link
                    key={s.path}
                    to={s.path}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 text-left"
                    style={{ color: 'var(--ncm-black)' }}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/contact"
            className="px-5 py-2 rounded-md font-semibold text-white"
            style={{ backgroundColor: 'var(--ncm-red)' }}
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-2xl"
          style={{ color: 'var(--ncm-black)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-8 pb-4 flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'var(--ncm-silver)' }}>
          <Link to="/about-us" onClick={() => setMobileOpen(false)} style={{ color: 'var(--ncm-black)' }}>
            About Us
          </Link>
          <details>
            <summary className="cursor-pointer" style={{ color: 'var(--ncm-black)' }}>Services</summary>
            <div className="flex flex-col gap-2 mt-2 pl-4">
              {services.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm"
                  style={{ color: 'var(--ncm-black)' }}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </details>
          <Link to="/contact" onClick={() => setMobileOpen(false)} style={{ color: 'var(--ncm-red)' }}>
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  )
}