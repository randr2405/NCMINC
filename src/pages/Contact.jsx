import { useState } from 'react'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID = 'service_hrlhqm6'
const EMAILJS_TEMPLATE_ID = 'template_0c0a3vf'
const EMAILJS_PUBLIC_KEY = '1UTJkjoUojZi_XgnG'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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
      subject: formData.subject,
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
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
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
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          Have a question or need professional advice? Get in touch and our team will
          respond as soon as possible.
        </p>
      </section>

      <section className="px-4 sm:px-8 py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact details */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ncm-red)' }}>Get in Touch</h2>

          <div className="space-y-5 text-gray-700">
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--ncm-red)' }}>📞</span>
              <div>
                <p className="font-semibold">Call Us</p>
                <p className="text-sm">062 830 3044</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--ncm-red)' }}>💬</span>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm">083 333 9349</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--ncm-red)' }}>✉️</span>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm">admin@ncmca.co.za</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--ncm-red)' }}>🌐</span>
              <div>
                <p className="font-semibold">Website</p>
                <p className="text-sm">www.ncmca.co.za</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--ncm-red)' }}>📍</span>
              <div>
                <p className="font-semibold">Locations</p>
                <p className="text-sm">Durban, Umhlanga, Ballito and Richards Bay</p>
              </div>
            </div>
          </div>

          <p className="mt-10 italic text-gray-500 text-sm">
            Delivering Excellence Through Integrity, Insight and Innovation.
          </p>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ncm-red)' }}>Send a Message</h2>

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
              <label htmlFor="subject" className="block text-sm font-medium mb-1 text-gray-700">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
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
                value={formData.message}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--ncm-silver)' }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 rounded-md font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--ncm-red)' }}
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <p className="text-green-600 text-sm text-center">
                Message sent successfully! We'll be in touch shortly.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-600 text-sm text-center">
                Something went wrong. Please try again or contact us directly.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}