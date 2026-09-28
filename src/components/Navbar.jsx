import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeTimer = useRef(null)
  const drawerCloseRef = useRef(null)
  const burgerRef = useRef(null)
  const location = useLocation()

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
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMobileServicesOpen(false)
    setServicesOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setServicesOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (mobileOpen) {
      const t = setTimeout(() => drawerCloseRef.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [mobileOpen])

  const openServices = () => {
    clearTimeout(closeTimer.current)
    setServicesOpen(true)
  }
  const closeServicesDelayed = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120)
  }
  const closeMobile = () => {
    setMobileOpen(false)
    setMobileServicesOpen(false)
    burgerRef.current?.focus()
  }

  return (
    <nav
      className={
        'sticky top-0 z-50 bg-white transition-shadow duration-300 ' +
        (scrolled ? 'shadow-md' : 'shadow-none border-b')
      }
      style={{ borderColor: scrolled ? 'transparent' : 'var(--ncm-grey)' }}
    >
      <div
        className={
          'flex items-center justify-between px-4 sm:px-8 max-w-6xl mx-auto transition-all duration-300 ' +
          (scrolled ? 'py-2 md:py-3' : 'py-3 md:py-4')
        }
      >
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--ncm-black)' }}>
            NCM{' '}
            <span
              className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              style={{ color: 'var(--ncm-teal)' }}
            >
              INC
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/about-us" className="group/link relative py-1" style={{ color: 'var(--ncm-black)' }}>
            About Us
            <span
              className="absolute left-0 -bottom-1 h-[2px] w-0 transition-all duration-300 group-hover/link:w-full"
              style={{ backgroundColor: 'var(--ncm-teal)' }}
            />
          </Link>

          <div className="relative" onMouseEnter={openServices} onMouseLeave={closeServicesDelayed}>
            <button
              className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity duration-200"
              style={{ color: 'var(--ncm-black)' }}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              onFocus={openServices}
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
              style={{ borderColor: 'var(--ncm-grey)' }}
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
                    style={{ color: 'var(--ncm-teal)' }}
                  >
                    ›
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Link to="/careers" className="group/link relative py-1" style={{ color: 'var(--ncm-black)' }}>
            Careers
            <span
              className="absolute left-0 -bottom-1 h-[2px] w-0 transition-all duration-300 group-hover/link:w-full"
              style={{ backgroundColor: 'var(--ncm-teal)' }}
            />
          </Link>

          <Link
            to="/contact"
            className="px-5 py-2 rounded-md font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            style={{ backgroundColor: 'var(--ncm-teal)' }}
          >
            Contact Us
          </Link>
        </div>

        <button
          ref={burgerRef}
          className="md:hidden w-11 h-11 -mr-2 flex flex-col justify-center items-center gap-1.5"
          style={{ color: 'var(--ncm-black)' }}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-drawer"
        >
          <span className="block h-[2px] w-6 bg-current" />
          <span className="block h-[2px] w-6 bg-current" />
          <span className="block h-[2px] w-6 bg-current" />
        </button>
      </div>

      <div
        className={
          'md:hidden fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ease-out ' +
          (mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!mobileOpen}
        className={
          'md:hidden fixed top-0 right-0 z-[70] h-[100dvh] w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out ' +
          (mobileOpen ? 'translate-x-0 visible' : 'translate-x-full invisible')
        }
      >
        <div
          className="flex items-center justify-between px-5 h-16 shrink-0 border-b"
          style={{ borderColor: 'var(--ncm-grey)' }}
        >
          <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--ncm-black)' }}>
            NCM <span style={{ color: 'var(--ncm-teal)' }}>INC</span>
          </span>
          <button
            ref={drawerCloseRef}
            className="w-11 h-11 -mr-2 flex items-center justify-center"
            style={{ color: 'var(--ncm-black)' }}
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 4 L16 16 M16 4 L4 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 flex flex-col">
          <Link
            to="/about-us"
            onClick={closeMobile}
            className="flex items-center min-h-[48px] text-base font-medium"
            style={{ color: 'var(--ncm-black)' }}
          >
            About Us
          </Link>

          <button
            className="flex items-center justify-between min-h-[48px] w-full text-left text-base font-medium"
            style={{ color: 'var(--ncm-black)' }}
            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            aria-expanded={mobileServicesOpen}
          >
            Services
            <svg
              width="12"
              height="12"
              viewBox="0 0 10 10"
              className={'transition-transform duration-300 ' + (mobileServicesOpen ? 'rotate-180' : '')}
              style={{ color: 'var(--ncm-teal)' }}
            >
              <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            className={
              'overflow-hidden transition-all duration-300 ease-in-out ' +
              (mobileServicesOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0')
            }
          >
            <div className="flex flex-col pl-4 pb-2 border-l-2 ml-1" style={{ borderColor: 'var(--ncm-teal)' }}>
              {services.map(s => (
                <Link
                  key={s.path}
                  to={s.path}
                  onClick={closeMobile}
                  className="flex items-center min-h-[44px] text-sm pl-3"
                  style={{ color: 'var(--ncm-black)' }}
                  tabIndex={mobileServicesOpen ? 0 : -1}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/careers"
            onClick={closeMobile}
            className="flex items-center min-h-[48px] text-base font-medium"
            style={{ color: 'var(--ncm-black)' }}
          >
            Careers
          </Link>
        </div>

        <div className="shrink-0 px-5 py-4 border-t" style={{ borderColor: 'var(--ncm-grey)' }}>
          <Link
            to="/contact"
            onClick={closeMobile}
            className="flex items-center justify-center min-h-[48px] rounded-md font-semibold text-white"
            style={{ backgroundColor: 'var(--ncm-teal)' }}
          >
            Contact Us
          </Link>
        </div>
      </aside>
    </nav>
  )
}