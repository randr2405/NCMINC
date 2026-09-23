import { useState } from 'react'
import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID = 'service_84h3ijq'
const EMAILJS_TEMPLATE_ID = 'template_uiqsv7j'
const EMAILJS_PUBLIC_KEY = '4fhuYl5hFBniQ1LVE'

export default function Careers() {
  const openings = [
    // Add real openings here, e.g.:
    // { title: 'Trainee Accountant', location: 'Durban', type: 'Full-Time' },
  ]

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: '',
  })
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')

    const templateParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      message: formData.message,
      time: new Date().toLocaleString('en-ZA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, {
        publicKey: EMAILJS_PUBLIC_KEY,
      })
      .then(() => {
        setStatus('success')
        setFormData({ name: '', email: '', phone: '', position: '', message: '' })
      })
      .catch((err) => {
        console.error('EmailJS error:', err)
        setStatus('error')
      })
  }

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
                  <a
                    href="#apply"
                    className="text-sm font-medium"
                    style={{ color: 'var(--ncm-red)' }}
                  >
                    Apply →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              We don't have any open positions right now, but we're always happy
              to hear from talented people. Fill in the form below and we'll keep
              your details on file for future opportunities.
            </p>
          )}
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="px-4 sm:px-8 py-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-red)' }}>
          Apply Now
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Fill in your details below. We'll be in touch if there's a suitable opportunity.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--ncm-silver)' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--ncm-silver)' }}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--ncm-silver)' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium mb-1 text-gray-700">Position Applying For</label>
            <input
              id="position"
              name="position"
              type="text"
              required
              placeholder="e.g. Trainee Accountant, General Application"
              value={formData.position}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--ncm-silver)' }}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-700">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              placeholder="Tell us a bit about yourself and why you'd like to join NCM Inc"
              value={formData.message}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--ncm-silver)' }}
            />
          </div>

          <div
            className="text-sm rounded-md px-4 py-3"
            style={{ backgroundColor: '#fff7f7', border: '1px solid #f3c9c9', color: 'var(--ncm-red)' }}
          >
            📎 Please email your CV directly to <strong>info@ncmca.co.za</strong> along
            with this application, referencing the position you're applying for.
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 rounded-md font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--ncm-red)' }}
          >
            {status === 'sending' ? 'Sending...' : 'Submit Application'}
          </button>

          {status === 'success' && (
            <p className="text-green-600 text-sm text-center">
              Application sent successfully! Don't forget to email your CV separately.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-600 text-sm text-center">
              Something went wrong. Please try again or email us directly.
            </p>
          )}
        </form>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-red)' }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions First?</h2>
        <p className="mb-8 max-w-xl mx-auto">
          Reach out to us directly if you'd like to know more before applying.
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