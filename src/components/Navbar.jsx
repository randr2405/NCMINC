import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeTimer = useRef(null)

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const openServices = () => {
    clearTimeout(closeTimer.current)
    setServicesOpen(true)
  }
  const closeServicesDelayed = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120)
  }

  return (
    <nav
      className={
        'sticky top-0 z-50 bg-white transition-shadow duration-300 ' +
        (scrolled ? 'shadow-md' : 'shadow-none border-b')
      }
      style={{ borderColor: scrolled ? 'transparent' : 'var(--ncm-silver)' }}
    >
      <div
        className={
          'flex items-center justify-between px-8 max-w-6xl mx-auto transition-all duration-300 ' +
          (scrolled ? 'py-3' : 'py-4')
        }
      >
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ncm-black)' }}>
            NCM{' '}
            <span
              className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              style={{ color: 'var(--ncm-red)' }}
            >
              INC
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/about-us"
            className="group/link relative py-1"
            style={{ color: 'var(--ncm-black)' }}
          >
            About Us
            <span
              className="absolute left-0 -bottom-1 h-[2px] w-0 transition-all duration-300 group-hover/link:w-full"
              style={{ backgroundColor: 'var(--ncm-red)' }}
            />
          </Link>

          <div
            className="relative"
            onMouseEnter={openServices}
            onMouseLeave={closeServicesDelayed}
          >
            <button
              className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity duration-200"
              style={{ color: 'var(--ncm-black)' }}
              aria-expanded={servicesOpen}
            >
              Services
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className={'transition-transform duration-300 ' + (servicesOpen ? 'rotate-180' : '')}
              >
                <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              className={
                'absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-md py-2 w-72 border origin-top transition-all duration-200 ' +
                (servicesOpen
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 -translate-y-1 pointer-events-none')
              }
              style={{ borderColor: 'var(--ncm-silver)' }}
            >
              {services.map((s, i) => (
                <Link
                  key={s.path}
                  to={s.path}
                  className="group/item flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 text-left transition-colors duration-150"
                  style={{ color: 'var(--ncm-black)', transitionDelay: servicesOpen ? `${i * 15}ms` : '0ms' }}
                >
                  <span>{s.name}</span>
                  <span
                    className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150"
                    style={{ color: 'var(--ncm-red)' }}
                  >
                    ›
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/contact"
            className="px-5 py-2 rounded-md font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            style={{ backgroundColor: 'var(--ncm-red)' }}
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden relative z-50 w-8 h-8 flex flex-col justify-center items-center gap-1.5"
          style={{ color: 'var(--ncm-black)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block h-[2px] w-6 bg-current transition-all duration-300 origin-center"
            style={{ transform: mobileOpen ? 'translateY(6px) rotate(45deg)' : 'none' }}
          />
          <span
            className="block h-[2px] w-6 bg-current transition-all duration-300"
            style={{ opacity: mobileOpen ? 0 : 1 }}
          />
          <span
            className="block h-[2px] w-6 bg-current transition-all duration-300 origin-center"
            style={{ transform: mobileOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t ' +
          (mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0')
        }
        style={{ borderColor: 'var(--ncm-silver)' }}
      >
        <div className="px-8 py-4 flex flex-col gap-3">
          <Link to="/about-us" onClick={() => setMobileOpen(false)} style={{ color: 'var(--ncm-black)' }}>
            About Us
          </Link>
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between" style={{ color: 'var(--ncm-black)' }}>
              Services
              <span className="transition-transform duration-200 group-open:rotate-45 text-lg" style={{ color: 'var(--ncm-red)' }}>+</span>
            </summary>
            <div className="flex flex-col gap-2 mt-2 pl-4">
              {services.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--ncm-black)' }}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </details>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="font-semibold"
            style={{ color: 'var(--ncm-red)' }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  )
}