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

export default function AboutUs() {
  const [heroIn, setHeroIn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 60)
    return () => clearTimeout(t)
  }, [])

  const values = [
    { title: 'Integrity', text: 'We conduct ourselves with honesty, transparency and professional independence. We believe trust is earned through consistent actions and accountability.' },
    { title: 'Professional Excellence', text: 'We are committed to maintaining high professional standards and delivering technically sound, reliable and commercially relevant advice.' },
    { title: 'Client Focus', text: "Every client is different. We take the time to understand our clients' businesses, objectives and challenges so that our services are relevant to their individual circumstances." },
    { title: 'Innovation', text: 'The accounting and business environment is constantly changing. We embrace technology, new ideas and improved processes to deliver more efficient and effective solutions.' },
    { title: 'Accountability', text: 'We take responsibility for the quality of our work, our advice and our commitments to clients.' },
    { title: 'Partnership', text: 'We aim to build long-term relationships rather than transactional engagements. Our role is to work alongside our clients as trusted professional advisers.' },
    { title: 'Excellence in Service', text: 'Professional expertise means little without exceptional service. We strive to be responsive, accessible and proactive in everything we do.' },
  ]

  const whyNCM = [
    { title: '40+ Years of Heritage', text: 'Our four decades of experience provide a strong foundation of professional knowledge and institutional experience.' },
    { title: 'Chartered Accounting & Audit Expertise', text: 'Our professional offering brings together accounting, auditing, taxation, advisory and related services.' },
    { title: 'One Integrated Practice', text: 'Clients can access a broad range of professional and business support services through one trusted professional firm.' },
    { title: 'Practical Advice', text: 'We focus on providing advice that can be understood, implemented and used to support better business decisions.' },
    { title: 'Modern Technology', text: 'We are embracing digital systems and technology to improve efficiency, reporting, communication and service delivery.' },
    { title: 'Personalised Service', text: 'We believe professional services should remain personal. Our clients are more than numbers on a system.' },
    { title: 'Long-Term Relationships', text: 'Our objective is to develop relationships that extend beyond individual engagements and become long-term professional partnerships.' },
    { title: 'Business-Focused Thinking', text: 'We look beyond compliance to understand the commercial realities affecting our clients and their businesses.' },
  ]

  const leadership = [
    'Professional accountability',
    'Technical excellence',
    'Ethical leadership',
    'Client-focused decision-making',
    'Continuous improvement',
    'Innovation and technology',
    'Strong governance',
    'Long-term value creation',
  ]

  const approach = [
    { title: 'Understand', text: 'We take the time to understand our clients, their businesses, their financial position and their objectives.' },
    { title: 'Advise', text: 'We provide professional advice based on technical expertise, commercial understanding and the specific circumstances of each client.' },
    { title: 'Support', text: 'We remain alongside our clients as their businesses evolve, providing ongoing professional support as new opportunities and challenges arise.' },
  ]

  return (
    <div className="text-black overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-black text-white px-6 sm:px-8 py-20 sm:py-24 text-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: 'var(--ncm-red)' }}
        />
        <div className="relative">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transition-all duration-700 ease-out"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateY(16px)' }}
          >
            About NCM Inc
          </h1>
          <p
            className="text-lg md:text-xl text-gray-300 transition-all duration-700 ease-out"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateY(16px)', transitionDelay: '120ms' }}
          >
            A Legacy of Excellence. A Future of Innovation.
          </p>
          <p
            className="max-w-2xl mx-auto mt-6 text-gray-300 transition-all duration-700 ease-out"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateY(16px)', transitionDelay: '220ms' }}
          >
            For more than 40 years, NCM Inc Chartered Accountants (SA) &amp; Registered Auditors
            has been serving the South African business community with professionalism,
            integrity and a commitment to excellence.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--ncm-red)' }}>
          Our Story
        </Reveal>
        <Reveal delay={60} as="h3" className="text-lg sm:text-xl font-semibold mb-6">
          Four Decades of Professional Excellence
        </Reveal>
        <Reveal delay={100} className="mb-4 text-gray-700">
          NCM Inc's story is one of resilience, opportunity, professional excellence and
          continuous evolution. Established more than four decades ago, NCM Inc was among
          South Africa's pioneering Chartered Accounting practices, developing a reputation
          for professional service, technical expertise and trusted client relationships.
        </Reveal>
        <Reveal delay={160} className="mb-4 text-gray-700">
          Over the years, NCM Inc has supported businesses, entrepreneurs, families and
          communities through changing economic conditions, evolving legislation and an
          increasingly complex regulatory environment.
        </Reveal>
        <Reveal delay={220} className="mb-8 text-gray-700">
          Today, NCM Inc has entered a new chapter under new management, preserving the
          professional values and reputation developed over more than 40 years while
          introducing modern systems, technology, expanded service offerings and a renewed
          focus on client experience.
        </Reveal>
        <Reveal delay={280}>
          <blockquote className="border-l-4 pl-6 italic text-gray-800" style={{ borderColor: 'var(--ncm-red)' }}>
            Our heritage gives us experience.<br />
            Our people give us expertise.<br />
            Our technology gives us agility.<br />
            Our clients give us purpose.
          </blockquote>
        </Reveal>
      </section>

      {/* Our Values */}
      <section className="px-6 sm:px-8 py-16" style={{ backgroundColor: 'var(--ncm-grey)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-red)' }}>
            Our Values
          </Reveal>
          <Reveal delay={60} className="text-center text-gray-600 mb-10">
            What Guides Everything We Do
          </Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 3) * 90} className="h-full">
                <div
                  className="h-full bg-white p-6 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{ borderColor: 'var(--ncm-silver)' }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ncm-black)' }}>{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--ncm-red)' }}>
          Our Leadership
        </Reveal>
        <Reveal delay={60} as="h3" className="text-lg sm:text-xl font-semibold mb-6">
          Experienced Professionals. Forward-Thinking Leadership.
        </Reveal>
        <Reveal delay={100} className="mb-6 text-gray-700">
          NCM Inc is led by a team committed to combining professional expertise, commercial
          understanding and modern thinking. Under the firm's new management, NCM Inc is
          focused on creating a professional practice that is responsive to the changing
          needs of businesses and individuals.
        </Reveal>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
          {leadership.map((item, i) => (
            <Reveal key={item} delay={140 + (i % 4) * 60} className="flex items-center gap-2 text-gray-700">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--ncm-red)' }}
              />
              {item}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why NCM */}
      <section className="px-6 sm:px-8 py-16 text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-red)' }}>
            Why NCM
          </Reveal>
          <Reveal delay={60} className="text-center text-gray-300 mb-10">
            More Than Compliance. A Professional Partner.
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {whyNCM.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 100} className="h-full">
                <div
                  className="h-full p-5 rounded-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ncm-silver)' }}>{w.title}</h3>
                  <p className="text-sm text-gray-300">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach — an actual 3-step sequence, so it earns the connecting line */}
      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto text-center">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-10" style={{ color: 'var(--ncm-red)' }}>
          Our Approach
        </Reveal>
        <div className="relative grid md:grid-cols-3 gap-10 md:gap-8">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-5 left-[16.5%] right-[16.5%] h-px"
            style={{ backgroundColor: 'var(--ncm-silver)' }}
          />
          {approach.map((step, i) => (
            <Reveal key={step.title} delay={i * 140} className="relative">
              <div
                className="mx-auto mb-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold relative z-10"
                style={{ backgroundColor: 'var(--ncm-red)' }}
              >
                {i + 1}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Building the Future */}
      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto text-center">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--ncm-red)' }}>
          Building the Future
        </Reveal>
        <Reveal delay={60} as="h3" className="text-lg sm:text-xl font-semibold mb-6">
          Our Legacy Is Our Foundation. Our Future Is Our Opportunity.
        </Reveal>
        <Reveal delay={100} className="mb-4 text-gray-700">
          NCM Inc is proud of its history. More than four decades of professional service
          have created a foundation of experience, relationships and knowledge that we
          intend to carry forward.
        </Reveal>
        <Reveal delay={160} className="mb-4 text-gray-700">
          But we also recognise that the professional services environment is changing
          rapidly. Technology, regulation, globalisation and changing client expectations
          are reshaping the way businesses operate. NCM Inc is responding to that change.
        </Reveal>
        <Reveal delay={220} className="mb-4 text-gray-700">
          We are investing in people, technology, systems and service capabilities to
          create a professional practice that is modern, responsive and future-focused.
        </Reveal>
        <Reveal delay={280} className="font-semibold text-gray-800">
          Our ambition is not simply to continue the NCM Inc story. It is to build its next chapter.
        </Reveal>
      </section>

      {/* Our Promise */}
      <section className="px-6 sm:px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-red)' }}>
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2">
          Our Promise
        </Reveal>
        <Reveal delay={60} className="text-lg mb-6">
          Trusted Advice. Smart Solutions. Stronger Businesses.
        </Reveal>
        <Reveal delay={120} className="max-w-2xl mx-auto mb-2">
          Whether you are an established corporation, growing business, entrepreneur, family,
          trust or individual, we are committed to providing professional solutions tailored
          to your needs.
        </Reveal>
        <Reveal delay={180}>
          <Link
            to="/contact"
            className="inline-block mt-8 px-6 py-3 rounded-md font-semibold bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            style={{ color: 'var(--ncm-red)' }}
          >
            Get in Touch
          </Link>
        </Reveal>
        <Reveal delay={240} className="font-semibold mt-8">
          NCM Inc Chartered Accountants (SA) &amp; Registered Auditors
        </Reveal>
        <Reveal delay={280} className="text-sm text-gray-100">
          A Legacy of Excellence. A Future of Innovation.
        </Reveal>
      </section>
    </div>
  )
}