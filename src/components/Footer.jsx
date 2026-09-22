import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

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
  const footerRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const colClass =
    'transition-all duration-700 ease-out ' +
    'motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0'

  return (
    <footer ref={footerRef} className="relative text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
      {/* thin accent line at the very top of the footer */}
      <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--ncm-red)' }} />

      <div className="px-8 py-14 max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-left">
        {/* Brand */}
        <div
          className={colClass}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transitionDelay: '0ms' }}
        >
          <h3 className="text-xl font-bold mb-2">
            NCM <span style={{ color: 'var(--ncm-red)' }}>INC</span>
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Chartered Accountants (SA) &amp; Registered Auditors
          </p>
          <p className="text-sm italic text-gray-400">
            Delivering Excellence Through Integrity, Insight and Innovation.
          </p>
        </div>

        {/* Quick links */}
        <div
          className={colClass}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transitionDelay: '80ms' }}
        >
          <h4 className="font-semibold mb-4" style={{ color: 'var(--ncm-silver)' }}>Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="/" className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about-us" className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div
          className={colClass}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transitionDelay: '160ms' }}
        >
          <h4 className="font-semibold mb-4" style={{ color: 'var(--ncm-silver)' }}>Our Services</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {services.map((s) => (
              <li key={s.path}>
                <Link
                  to={s.path}
                  className="inline-block transition-all duration-200 hover:text-white hover:translate-x-1"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div
          className={colClass}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transitionDelay: '240ms' }}
        >
          <h4 className="font-semibold mb-4" style={{ color: 'var(--ncm-silver)' }}>Get in Touch</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-red)' }}>📞</span> 062 830 3044
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-red)' }}>💬</span> 083 333 9349
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-red)' }}>✉️</span>
              <a href="mailto:admin@ncmca.co.za" className="hover:text-white transition-colors duration-200">
                admin@ncmca.co.za
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-red)' }}>🌐</span>
              <a
                href="https://www.ncmca.co.za"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                www.ncmca.co.za
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--ncm-red)' }}>📍</span>
              <span>Durban, Umhlanga, Ballito &amp; Richards Bay</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-gray-500" style={{ borderColor: '#2a2a2a' }}>
        © {year} NCM Inc Chartered Accountants (SA) &amp; Registered Auditors. All rights reserved.
      </div>

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={
          'fixed bottom-6 right-6 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ' +
          (showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none')
        }
        style={{ backgroundColor: 'var(--ncm-red)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 13V3M8 3L3 8M8 3l5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </footer>
  )
}