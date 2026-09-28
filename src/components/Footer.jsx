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
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const colClass = 'transition-all duration-700 ease-out'

  const colStyle = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(16px)',
    transitionDelay: `${delay}ms`,
  })

  const linkClass =
    'inline-flex items-center min-h-[36px] sm:min-h-0 transition-all duration-200 hover:text-white sm:hover:translate-x-1'

  const contactLinkClass = 'hover:text-white transition-colors duration-200 py-1'

  return (
    <footer ref={footerRef} className="relative text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
      <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--ncm-teal)' }} />

      <div className="px-5 sm:px-8 py-10 sm:py-14 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-left">
        <div className={colClass} style={colStyle(0)}>
          <h3 className="text-xl font-bold mb-2">
            NCM <span style={{ color: 'var(--ncm-teal)' }}>INC</span>
          </h3>
          <p className="text-sm text-gray-400 mb-4">Chartered Accountants (SA) &amp; Registered Auditors</p>
          <p className="text-sm italic text-gray-400">
            Delivering Excellence Through Integrity, Insight and Innovation.
          </p>
        </div>

        <div className={colClass} style={colStyle(80)}>
          <h4 className="font-semibold mb-3 sm:mb-4" style={{ color: 'var(--ncm-grey)' }}>
            Quick Links
          </h4>
          <ul className="space-y-1 sm:space-y-2 text-sm text-gray-400">
            <li>
              <Link to="/" className={linkClass}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about-us" className={linkClass}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/careers" className={linkClass}>
                Careers
              </Link>
            </li>
            <li>
              <Link to="/contact" className={linkClass}>
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className={colClass} style={colStyle(160)}>
          <h4 className="font-semibold mb-3 sm:mb-4" style={{ color: 'var(--ncm-grey)' }}>
            Our Services
          </h4>
          <ul className="space-y-1 sm:space-y-2 text-sm text-gray-400">
            {services.map((s) => (
              <li key={s.path}>
                <Link to={s.path} className={linkClass}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={colClass} style={colStyle(240)}>
          <h4 className="font-semibold mb-3 sm:mb-4" style={{ color: 'var(--ncm-grey)' }}>
            Get in Touch
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-teal)' }}>📞</span>
              <a href="tel:0628303044" className={contactLinkClass}>
                062 830 3044
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-teal)' }}>💬</span>
              <a href="https://wa.me/27833339349" target="_blank" rel="noreferrer" className={contactLinkClass}>
                083 333 9349
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-teal)' }}>✉️</span>
              <a href="mailto:admin@ncmca.co.za" className={contactLinkClass + ' break-all'}>
                admin@ncmca.co.za
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: 'var(--ncm-teal)' }}>🌐</span>
              <a href="https://www.ncmca.co.za" target="_blank" rel="noreferrer" className={contactLinkClass}>
                www.ncmca.co.za
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: 'var(--ncm-teal)' }}>📍</span>
              <span>Durban, Umhlanga, Ballito &amp; Richards Bay</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="border-t px-5 pt-6 text-center text-xs text-gray-500"
        style={{ borderColor: '#2a2a2a', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        © {year} NCM Inc Chartered Accountants (SA) &amp; Registered Auditors. All rights reserved.
      </div>

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={
          'fixed right-4 sm:right-6 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ' +
          (showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none')
        }
        style={{
          backgroundColor: 'var(--ncm-teal)',
          bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 13V3M8 3L3 8M8 3l5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </footer>
  )
}