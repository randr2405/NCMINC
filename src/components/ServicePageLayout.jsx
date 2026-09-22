import { Link } from 'react-router-dom'

export default function ServicePageLayout({ title, tagline, intro, highlights, sections, valuePoints }) {
  return (
    <div className="text-black">
      {/* Hero */}
      <section className="px-8 py-16 text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
          {tagline && (
            <p className="text-lg font-semibold mb-6" style={{ color: 'var(--ncm-silver)' }}>{tagline}</p>
          )}
          {intro && <p className="text-gray-300 leading-relaxed">{intro}</p>}
        </div>
      </section>

      {/* Highlights strip */}
      {highlights && highlights.length > 0 && (
        <section className="px-8 py-10" style={{ backgroundColor: 'var(--ncm-black)' }}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 border-t pt-8" style={{ borderColor: '#2a2a2a' }}>
            {highlights.map((h) => (
              <div key={h} className="text-center text-sm font-medium text-gray-200">
                {h}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Service sections */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((s) => (
            <div key={s.title} className="p-6 rounded-lg border" style={{ borderColor: 'var(--ncm-silver)' }}>
              <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--ncm-red)' }}>{s.title}</h3>
              {s.description && <p className="text-sm text-gray-600 mb-3">{s.description}</p>}
              <ul className="text-sm text-gray-700 space-y-1.5">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: 'var(--ncm-red)' }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Value delivered */}
      {valuePoints && valuePoints.length > 0 && (
        <section className="px-8 py-16" style={{ backgroundColor: 'var(--ncm-grey)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--ncm-black)' }}>
              The Value We Deliver
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {valuePoints.map((v) => (
                <div key={v} className="flex items-start gap-3 bg-white p-4 rounded-lg border" style={{ borderColor: 'var(--ncm-silver)' }}>
                  <span style={{ color: 'var(--ncm-red)' }}>✔</span>
                  <span className="text-sm text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-red)' }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="mb-8 max-w-xl mx-auto">
          Speak to our team about how these services can support your business.
        </p>
        <Link
          to="/contact"
          className="inline-block px-6 py-3 rounded-md font-semibold bg-white"
          style={{ color: 'var(--ncm-red)' }}
        >
          Contact Us
        </Link>
      </section>
    </div>
  )
}