import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

/** Fires `visible = true` once the element scrolls into view, then stops watching.
 *  Falls back to visible=true immediately if IntersectionObserver isn't available,
 *  or if the element is already on screen when it mounts, so content can never
 *  get stuck invisible. */
function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    // Already in (or close to) the viewport on mount — show it immediately
    // instead of waiting for a scroll event that may never come.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
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
      { threshold, rootMargin: '0px 0px -5% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}

/** Counts up from 0 to `end` once it scrolls into view. */
function Counter({ end, suffix = '', duration = 1400 }) {
  const [ref, visible] = useReveal(0.3)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    let frame
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(end * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, end, duration])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', style = {}, children }) {
  const [ref, visible] = useReveal()
  return (
    <Tag
      ref={ref}
      className={
        'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ' +
        className
      }
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}

export default function Home() {
  const [heroIn, setHeroIn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 60)
    return () => clearTimeout(t)
  }, [])

  const services = [
    {
      title: 'Audit & Assurance',
      path: '/audit-assurance-services',
      items: ['Statutory Audits', 'External Audits', 'Internal Audits', 'Independent Reviews', 'Due Diligence Reviews'],
    },
    {
      title: 'Accounting & Financial Reporting',
      path: '/accounting-financial-reporting',
      items: ['Monthly Bookkeeping', 'Management Accounts', 'Annual Financial Statements', 'IFRS / IFRS for SMEs Compliance', 'Cash Flow Management'],
    },
    {
      title: 'Tax Services',
      path: '/tax-services',
      items: ['Corporate & Individual Income Tax', 'VAT Registration and Compliance', 'PAYE, UIF and SDL Compliance', 'Tax Planning and Advisory', 'SARS Objections and Appeals'],
    },
    {
      title: 'Business Advisory',
      path: '/business-advisory-services',
      items: ['Business Consulting', 'Strategic Planning', 'Financial Modelling', 'Business Valuations', 'Mergers and Acquisitions Support'],
    },
    {
      title: 'Company Secretarial Services',
      path: '/company-secretarial-services',
      items: ['Company Registrations', 'CIPC Compliance', 'Annual Returns', 'Share Allotments and Transfers', 'Beneficial Ownership Compliance'],
    },
    {
      title: 'Payroll & HR Services',
      path: '/payroll-hr-services',
      items: ['Payroll Processing', 'EMP201 and EMP501 Submissions', 'UIF Administration', 'IRP5 Certificates', 'Employment Tax Advisory'],
    },
    {
      title: 'Fiduciary & Trust Services',
      path: '/fiduciary-trust-services',
      items: ['Trust Formation and Administration', 'Estate Planning', 'Deceased Estate Administration', 'Trustee Services', 'Succession Planning'],
    },
    {
      title: 'B-BBEE Advisory',
      path: '/bbbee-services',
      items: ['B-BBEE Verification Preparation', 'Scorecard Assessments', 'Ownership Structuring', 'Enterprise & Supplier Development', 'B-BBEE Compliance Consulting'],
    },
    {
      title: 'Business Process Outsourcing',
      path: '/business-process-outsourcing',
      items: ['Outsourced Accounting', 'Virtual CFO Services', 'Financial Controller Services', 'Finance Department Outsourcing', 'Management Reporting'],
    },
  ]

  return (
    <div className="text-black overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative px-6 sm:px-8 py-20 sm:py-28 text-center text-white overflow-hidden"
        style={{ backgroundColor: 'var(--ncm-black)' }}
      >
        {/* subtle drifting accent glow, purely decorative */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: 'var(--ncm-red)' }}
        />

        <div className="relative">
          <p
            className="uppercase tracking-widest text-xs sm:text-sm mb-4 transition-all duration-700 ease-out"
            style={{
              color: 'var(--ncm-silver)',
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'none' : 'translateY(10px)',
            }}
          >
            Chartered Accountants (SA) & Registered Auditors
          </p>

          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight transition-all duration-700 ease-out"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'none' : 'translateY(16px)',
              transitionDelay: '100ms',
            }}
          >
            Trusted Advice.{' '}
            <span className="relative inline-block" style={{ color: 'var(--ncm-red)' }}>
              Smart Solutions.
              <span
                className="absolute left-0 -bottom-1 h-[3px] rounded-full transition-all duration-[900ms] ease-out"
                style={{
                  backgroundColor: 'var(--ncm-red)',
                  width: heroIn ? '100%' : '0%',
                  transitionDelay: '550ms',
                }}
              />
            </span>
            <br />
            Stronger Businesses.
          </h1>

          <p
            className="max-w-2xl mx-auto mt-6 text-gray-300 text-base sm:text-lg transition-all duration-700 ease-out"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'none' : 'translateY(16px)',
              transitionDelay: '220ms',
            }}
          >
            We are a professional accounting and audit firm committed to delivering
            exceptional service, value and integrity.
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4 transition-all duration-700 ease-out"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'none' : 'translateY(16px)',
              transitionDelay: '340ms',
            }}
          >
            <Link
              to="/contact"
              className="px-6 py-3 rounded-md font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              style={{ backgroundColor: 'var(--ncm-red)' }}
            >
              Get in Touch
            </Link>
            <Link
              to="/about-us"
              className="px-6 py-3 rounded-md font-semibold border transition-colors duration-200 hover:bg-white/10"
              style={{ borderColor: 'var(--ncm-silver)', color: 'var(--ncm-silver)' }}
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Intro strip */}
      <section className="px-6 sm:px-8 py-14 text-center" style={{ backgroundColor: 'var(--ncm-grey)' }}>
        <Reveal className="max-w-3xl mx-auto">
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            For{' '}
            <span className="font-semibold" style={{ color: 'var(--ncm-black)' }}>
              <Counter end={40} suffix="+" />
            </span>{' '}
            years, NCM Inc has served the South African business community with
            professionalism, integrity and a commitment to excellence. Today, under new
            management, we combine that heritage with modern technology and a client-focused
            approach to professional services.
          </p>
        </Reveal>
      </section>

      {/* Services grid */}
      <section className="px-6 sm:px-8 py-16 max-w-6xl mx-auto">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-red)' }}>
          Our Professional Services
        </Reveal>
        <Reveal delay={80} className="text-center text-gray-600 mb-12">
          An integrated range of professional services under one trusted roof.
        </Reveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.path} delay={(i % 3) * 90} className="h-full">
              <Link
                to={s.path}
                className="group flex flex-col h-full p-6 rounded-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: 'var(--ncm-silver)' }}
              >
                <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--ncm-black)' }}>
                  {s.title}
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 flex-1">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span style={{ color: 'var(--ncm-red)' }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <span
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: 'var(--ncm-red)' }}
                >
                  Learn more →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why NCM strip */}
      <section className="px-6 sm:px-8 py-16 text-white text-center" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <Reveal as="h2" className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
          More Than Compliance. A Professional Partner.
        </Reveal>
        <Reveal delay={80} className="max-w-2xl mx-auto text-gray-300 mb-8 text-sm sm:text-base">
          Businesses today require more than accountants who prepare financial statements
          and tax returns — they require advisers who understand their challenges, identify
          opportunities and help them make informed decisions.
        </Reveal>
        <Reveal delay={160}>
          <Link
            to="/about-us"
            className="inline-block px-6 py-3 rounded-md font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: 'var(--ncm-red)' }}
          >
            Why Choose NCM Inc
          </Link>
        </Reveal>
      </section>


    </div>
  )
}