export default function AboutUs() {
  const values = [
    { title: "Integrity", text: "We conduct ourselves with honesty, transparency and professional independence. We believe trust is earned through consistent actions and accountability." },
    { title: "Professional Excellence", text: "We are committed to maintaining high professional standards and delivering technically sound, reliable and commercially relevant advice." },
    { title: "Client Focus", text: "Every client is different. We take the time to understand our clients' businesses, objectives and challenges so that our services are relevant to their individual circumstances." },
    { title: "Innovation", text: "The accounting and business environment is constantly changing. We embrace technology, new ideas and improved processes to deliver more efficient and effective solutions." },
    { title: "Accountability", text: "We take responsibility for the quality of our work, our advice and our commitments to clients." },
    { title: "Partnership", text: "We aim to build long-term relationships rather than transactional engagements. Our role is to work alongside our clients as trusted professional advisers." },
    { title: "Excellence in Service", text: "Professional expertise means little without exceptional service. We strive to be responsive, accessible and proactive in everything we do." },
  ]

  const whyNCM = [
    { title: "40+ Years of Heritage", text: "Our four decades of experience provide a strong foundation of professional knowledge and institutional experience." },
    { title: "Chartered Accounting & Audit Expertise", text: "Our professional offering brings together accounting, auditing, taxation, advisory and related services." },
    { title: "One Integrated Practice", text: "Clients can access a broad range of professional and business support services through one trusted professional firm." },
    { title: "Practical Advice", text: "We focus on providing advice that can be understood, implemented and used to support better business decisions." },
    { title: "Modern Technology", text: "We are embracing digital systems and technology to improve efficiency, reporting, communication and service delivery." },
    { title: "Personalised Service", text: "We believe professional services should remain personal. Our clients are more than numbers on a system." },
    { title: "Long-Term Relationships", text: "Our objective is to develop relationships that extend beyond individual engagements and become long-term professional partnerships." },
    { title: "Business-Focused Thinking", text: "We look beyond compliance to understand the commercial realities affecting our clients and their businesses." },
  ]

  return (
    <div className="text-black">
      {/* Hero */}
      <section className="bg-black text-white px-8 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About NCM Inc</h1>
        <p className="text-lg md:text-xl text-gray-300">A Legacy of Excellence. A Future of Innovation.</p>
        <p className="max-w-2xl mx-auto mt-6 text-gray-300">
          For more than 40 years, NCM Inc Chartered Accountants (SA) & Registered Auditors
          has been serving the South African business community with professionalism,
          integrity and a commitment to excellence.
        </p>
      </section>

      {/* Our Story */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ncm-red)' }}>Our Story</h2>
        <h3 className="text-xl font-semibold mb-6">Four Decades of Professional Excellence</h3>
        <p className="mb-4 text-gray-700">
          NCM Inc's story is one of resilience, opportunity, professional excellence and
          continuous evolution. Established more than four decades ago, NCM Inc was among
          South Africa's pioneering Chartered Accounting practices, developing a reputation
          for professional service, technical expertise and trusted client relationships.
        </p>
        <p className="mb-4 text-gray-700">
          Over the years, NCM Inc has supported businesses, entrepreneurs, families and
          communities through changing economic conditions, evolving legislation and an
          increasingly complex regulatory environment.
        </p>
        <p className="mb-8 text-gray-700">
          Today, NCM Inc has entered a new chapter under new management, preserving the
          professional values and reputation developed over more than 40 years while
          introducing modern systems, technology, expanded service offerings and a renewed
          focus on client experience.
        </p>
        <blockquote className="border-l-4 pl-6 italic text-gray-800" style={{ borderColor: 'var(--ncm-red)' }}>
          Our heritage gives us experience.<br />
          Our people give us expertise.<br />
          Our technology gives us agility.<br />
          Our clients give us purpose.
        </blockquote>
      </section>

      {/* Our Values */}
      <section className="px-8 py-16" style={{ backgroundColor: 'var(--ncm-grey)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-red)' }}>Our Values</h2>
          <p className="text-center text-gray-600 mb-10">What Guides Everything We Do</p>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white p-6 rounded-lg shadow-sm border" style={{ borderColor: 'var(--ncm-silver)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--ncm-black)' }}>{v.title}</h3>
                <p className="text-sm text-gray-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ncm-red)' }}>Our Leadership</h2>
        <h3 className="text-xl font-semibold mb-6">Experienced Professionals. Forward-Thinking Leadership.</h3>
        <p className="mb-6 text-gray-700">
          NCM Inc is led by a team committed to combining professional expertise, commercial
          understanding and modern thinking. Under the firm's new management, NCM Inc is
          focused on creating a professional practice that is responsive to the changing
          needs of businesses and individuals.
        </p>
        <ul className="grid md:grid-cols-2 gap-2 text-gray-700 list-disc list-inside">
          <li>Professional accountability</li>
          <li>Technical excellence</li>
          <li>Ethical leadership</li>
          <li>Client-focused decision-making</li>
          <li>Continuous improvement</li>
          <li>Innovation and technology</li>
          <li>Strong governance</li>
          <li>Long-term value creation</li>
        </ul>
      </section>

      {/* Why NCM */}
      <section className="px-8 py-16 text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-red)' }}>Why NCM</h2>
          <p className="text-center text-gray-300 mb-10">More Than Compliance. A Professional Partner.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {whyNCM.map((w) => (
              <div key={w.title} className="p-5 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--ncm-silver)' }}>{w.title}</h3>
                <p className="text-sm text-gray-300">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="px-8 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--ncm-red)' }}>Our Approach</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-2">Understand</h3>
            <p className="text-gray-600 text-sm">We take the time to understand our clients, their businesses, their financial position and their objectives.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Advise</h3>
            <p className="text-gray-600 text-sm">We provide professional advice based on technical expertise, commercial understanding and the specific circumstances of each client.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Support</h3>
            <p className="text-gray-600 text-sm">We remain alongside our clients as their businesses evolve, providing ongoing professional support as new opportunities and challenges arise.</p>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-red)' }}>
        <h2 className="text-3xl font-bold mb-2">Our Promise</h2>
        <p className="text-lg mb-6">Trusted Advice. Smart Solutions. Stronger Businesses.</p>
        <p className="max-w-2xl mx-auto mb-2">
          Whether you are an established corporation, growing business, entrepreneur, family,
          trust or individual, we are committed to providing professional solutions tailored
          to your needs.
        </p>
        <p className="font-semibold mt-8">NCM Inc Chartered Accountants (SA) & Registered Auditors</p>
        <p className="text-sm text-gray-100">A Legacy of Excellence. A Future of Innovation.</p>
      </section>
    </div>
  )
}