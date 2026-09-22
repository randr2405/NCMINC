import { Link } from 'react-router-dom'

export default function Careers() {
  const openings = [
    // Add real openings here, e.g.:
    // { title: 'Trainee Accountant', location: 'Durban', type: 'Full-Time' },
  ]

  return (
    <div className="text-black">
      {/* Hero */}
      <section className="px-4 sm:px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Careers at NCM Inc</h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          Build your career with a firm that combines professional heritage with
          modern thinking. We're always interested in hearing from talented,
          driven individuals.
        </p>
      </section>

      {/* Why work here */}
      <section className="px-4 sm:px-8 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--ncm-red)' }}>Why Work With Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-2">Professional Growth</h3>
            <p className="text-gray-600 text-sm">Structured mentorship and exposure to a broad range of clients and industries.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Modern Practice</h3>
            <p className="text-gray-600 text-sm">Combining 40+ years of heritage with current technology and ways of working.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Real Responsibility</h3>
            <p className="text-gray-600 text-sm">Meaningful client-facing work from early on, not just back-office tasks.</p>
          </div>
        </div>
      </section>

      {/* Current openings */}
      <section className="px-4 sm:px-8 py-16" style={{ backgroundColor: 'var(--ncm-grey)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--ncm-black)' }}>
            Current Openings
          </h2>

          {openings.length > 0 ? (
            <div className="space-y-4">
              {openings.map((job) => (
                <div
                  key={job.title}
                  className="bg-white p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  style={{ borderColor: 'var(--ncm-silver)' }}
                >
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
                  </div>
                  <Link
                    to="/contact"
                    className="text-sm font-medium"
                    style={{ color: 'var(--ncm-red)' }}
                  >
                    Apply →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              We don't have any open positions right now, but we're always happy
              to hear from talented people. Send us your CV and we'll keep it on
              file for future opportunities.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-red)' }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Interested in Joining Us?</h2>
        <p className="mb-8 max-w-xl mx-auto">
          Send us your CV and a short introduction, and we'll be in touch if a suitable opportunity arises.
        </p>
        <Link
          to="/contact"
          className="inline-block px-6 py-3 rounded-md font-semibold bg-white"
          style={{ color: 'var(--ncm-red)' }}
        >
          Get in Touch
        </Link>
      </section>
    </div>
  )
}