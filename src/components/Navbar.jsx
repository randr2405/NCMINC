import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false)

  const services = [
    { name: 'Accounting & Financial Reporting', path: '/accounting-financial-reporting' },
    { name: 'Audit & Assurance Services', path: '/audit-assurance-services' },
    { name: 'Tax Services', path: '/tax-services' },
    { name: 'Business Process Outsourcing', path: '/business-process-outsourcing' },
    { name: 'Company Secretarial Services', path: '/company-secretarial-services' },
    { name: 'Payroll & HR Services', path: '/payroll-hr-services' },
    { name: 'Fiduciary & Trust Services', path: '/fiduciary-trust-services' },
    { name: 'B-BBEE Services', path: '/bbbee-services' },
    { name: 'Business Advisory Services', path: '/business-advisory-services' },
  ]

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm relative">
      <Link to="/" className="text-xl font-semibold">NCM Inc</Link>
      <div className="flex items-center gap-6">
        <Link to="/about-us">About Us</Link>

        <div
          className="relative"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
        >
          <button className="cursor-pointer">Services</button>
          {servicesOpen && (
            <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 w-64 z-10">
              {services.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  className="block px-4 py-2 text-sm hover:bg-gray-100 text-left"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  )
}