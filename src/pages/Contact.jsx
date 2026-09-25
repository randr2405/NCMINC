import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl'

const EMAILJS_SERVICE_ID = 'service_hrlhqm6'
const EMAILJS_TEMPLATE_ID = 'template_0c0a3vf'
const EMAILJS_PUBLIC_KEY = '1UTJkjoUojZi_XgnG'

const PARTICLES_DEFAULT_COLORS = ['#e5484d', '#ffffff', '#cfd3d6']

const particlesHexToRgb = (hex) => {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const int = parseInt(hex.slice(0, 6), 16)
  const r = ((int >> 16) & 255) / 255
  const g = ((int >> 8) & 255) / 255
  const b = (int & 255) / 255
  return [r, g, b]
}

const particlesVertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`

const particlesFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`

const PARTICLES_CSS = `
.ncm-particles-container {
  position: relative;
  width: 100%;
  height: 100%;
}
`

let ncmParticlesStylesInjected = false
function useNcmParticlesStyles() {
  useEffect(() => {
    if (ncmParticlesStylesInjected || typeof document === 'undefined') return
    if (document.getElementById('ncm-particles-styles')) {
      ncmParticlesStylesInjected = true
      return
    }
    const tag = document.createElement('style')
    tag.id = 'ncm-particles-styles'
    tag.textContent = PARTICLES_CSS
    document.head.appendChild(tag)
    ncmParticlesStylesInjected = true
  }, [])
}

function Particles({
  particleCount = 220,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = true,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  className,
}) {
  useNcmParticlesStyles()

  const containerRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      dpr: pixelRatio,
      depth: false,
      alpha: true,
    })
    const gl = renderer.gl
    container.appendChild(gl.canvas)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'
    gl.clearColor(0, 0, 0, 0)

    const camera = new Camera(gl, { fov: 15 })
    camera.position.set(0, 0, cameraDistance)

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height })
    }
    window.addEventListener('resize', resize, false)
    resize()

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      mouseRef.current = { x, y }
    }

    if (moveParticlesOnHover) {
      container.addEventListener('mousemove', handleMouseMove)
    }

    const count = particleCount
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count * 4)
    const colors = new Float32Array(count * 3)
    const palette = particleColors && particleColors.length > 0 ? particleColors : PARTICLES_DEFAULT_COLORS

    for (let i = 0; i < count; i++) {
      let x, y, z, len
      do {
        x = Math.random() * 2 - 1
        y = Math.random() * 2 - 1
        z = Math.random() * 2 - 1
        len = x * x + y * y + z * z
      } while (len > 1 || len === 0)
      const r = Math.cbrt(Math.random())
      positions.set([x * r, y * r, z * r], i * 3)
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4)
      const col = particlesHexToRgb(palette[Math.floor(Math.random() * palette.length)])
      colors.set(col, i * 3)
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    })

    const program = new Program(gl, {
      vertex: particlesVertex,
      fragment: particlesFragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    })

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program })

    let animationFrameId
    let lastTime = performance.now()
    let elapsed = 0

    const update = (t) => {
      animationFrameId = requestAnimationFrame(update)
      const delta = t - lastTime
      lastTime = t
      elapsed += delta * speed

      program.uniforms.uTime.value = elapsed * 0.001

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor
        particles.position.y = -mouseRef.current.y * particleHoverFactor
      } else {
        particles.position.x = 0
        particles.position.y = 0
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15
        particles.rotation.z += 0.01 * speed
      }

      renderer.render({ scene: particles, camera })
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('resize', resize)
      if (moveParticlesOnHover) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
      cancelAnimationFrame(animationFrameId)
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    pixelRatio,
  ])

  return <div ref={containerRef} className={`ncm-particles-container${className ? ` ${className}` : ''}`} />
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState(null)

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
      <section
        className="relative px-4 sm:px-8 py-16 text-center text-white overflow-hidden"
        style={{ backgroundColor: 'var(--ncm-black)' }}
      >
        <div className="absolute inset-0">
          <Particles
            particleColors={['#e5484d', '#ffffff', '#cfd3d6']}
            particleCount={220}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Have a question or need professional advice? Get in touch and our team will
            respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-8 py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
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