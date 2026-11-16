import nodemailer from 'nodemailer'

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone, position, message, cvName, cvBase64 } = req.body || {}

  if (!name || !email || !position || !message || !cvBase64) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const buf = Buffer.from(cvBase64, 'base64')
  if (buf.subarray(0, 4).toString() !== '%PDF') {
    return res.status(400).json({ error: 'CV must be a PDF' })
  }

  const time = new Date().toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg',
  })

  const safeFilename = String(cvName || 'cv.pdf').replace(/[^\w.\- ]/g, '_')

  try {
    await transporter.sendMail({
      from: `"NCM Inc Website" <${process.env.GMAIL_USER}>`,
      to: process.env.CAREERS_TO || 'admin@ncmca.co.za',
      replyTo: `"${String(name).replace(/["\r\n]/g, '')}" <${email}>`,
      subject: `New Application: ${String(position).replace(/[\r\n]/g, ' ')} - from ${String(name).replace(/[\r\n]/g, ' ')}`,
      html: `
        <p>A new application was received from the NCM Inc website careers form.</p>
        <p><strong>Name:</strong> ${esc(name)}<br>
        <strong>Email:</strong> ${esc(email)}<br>
        <strong>Phone:</strong> ${esc(phone) || '-'}<br>
        <strong>Position:</strong> ${esc(position)}<br>
        <strong>Received:</strong> ${time}</p>
        <p><strong>Message:</strong><br>${esc(message).replace(/\n/g, '<br>')}</p>
        <p>CV attached.</p>
      `,
      attachments: [{ filename: safeFilename, content: buf, contentType: 'application/pdf' }],
    })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Mail error:', err)
    return res.status(500).json({ error: 'Failed to send' })
  }
}