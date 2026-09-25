import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl'
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SentIcon, Tick02Icon } from '@hugeicons/core-free-icons'

const EMAILJS_SERVICE_ID = 'service_hrlhqm6'
const EMAILJS_TEMPLATE_ID = 'template_0c0a3vf'
const EMAILJS_PUBLIC_KEY = '1UTJkjoUojZi_XgnG'

const PARTICLES_DEFAULT_COLORS = ['#0f766e', '#14b8a6', '#5eead4']

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
  particleCount = 160,
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

const REVEAL_EASE = [0.16, 1, 0.3, 1]

function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  style = {},
  y = 28,
  x = 0,
  scale = 1,
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.3,
  ...rest
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[Tag] || motion.div

  if (reduce) {
    return (
      <MotionTag className={className} style={style} {...rest}>
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: REVEAL_EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

function RevealGroup({ children, className = '', stagger = 0.09, delayChildren = 0, once = true, amount = 0.25 }) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

function RevealItem({ children, className = '', style = {}, y = 20, ...rest }) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <div className={className} style={style} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: REVEAL_EASE } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

const SLIDE_SEND_PAD = 4
const SLIDE_SEND_SQUASH_MAX = 0.08
const SLIDE_SEND_SQUASH_DIV = 110
const SLIDE_SEND_SWELL = 1.03
const SLIDE_SEND_MIN_PENDING = 300
const SLIDE_SEND_EASE_OUT = [0.23, 1, 0.32, 1]
const SLIDE_SEND_SHAKE = [0, -5, 5, -3, 3, -1, 0]

const slideSendClamp = (value, min, max) => Math.min(max, Math.max(min, value))
const slideSendOnColor = (hex) => {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? [...raw].map((ch) => ch + ch).join('') : raw.slice(0, 6)
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return '#ffffff'
  const yiq = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000
  return yiq >= 128 ? '#111111' : '#ffffff'
}
const slideSendVelocityOf = (hist) => {
  if (hist.length < 2) return 0
  const [t0, x0] = hist[0]
  const [t1, x1] = hist[hist.length - 1]
  return ((x1 - x0) / Math.max(1, t1 - t0)) * 1000
}
const slideSendFinePointer = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

function SlideSendSpinner({ size }) {
  return (
    <svg className="slide-send__spinner" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

const SLIDE_SEND_CSS = `
.slide-send {
  --ss-track: #262626;
  --ss-ink: #f5f5f5;
  --ss-ok: #22c55e;
  --ss-no: #e5484d;
  --ss-on-ink: #111111;
  --ss-on-ok: #111111;
  --ss-on-no: #ffffff;
  --ss-radius: 28px;
  --ss-grip-r: 24px;
  --ss-pad: 4px;
  --ss-font: 14px;

  position: relative;
  display: inline-block;
  vertical-align: middle;
  font-family: inherit;
}

.slide-send[data-disabled] {
  opacity: 0.55;
  pointer-events: none;
}

.slide-send__track {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--ss-radius);
  background: var(--ss-track);
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.slide-send[data-held] .slide-send__track {
  cursor: grabbing;
}

.slide-send[data-phase='pending'] .slide-send__track,
.slide-send[data-phase='done'] .slide-send__track {
  cursor: default;
}

.slide-send__label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  font-size: var(--ss-font);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.006em;
  white-space: nowrap;
}

.slide-send__text {
  grid-area: 1 / 1;
  color: color-mix(in srgb, var(--ss-ink) 45%, transparent);
  transition:
    opacity 200ms ease,
    filter 200ms ease;
}

.slide-send__text--error {
  color: var(--ss-no);
  opacity: 0;
  filter: blur(2px);
}

.slide-send[data-phase='error'] .slide-send__text--plain {
  opacity: 0;
  filter: blur(2px);
}

.slide-send[data-phase='error'] .slide-send__text--error {
  opacity: 1;
  filter: none;
}

.slide-send__capsule {
  position: absolute;
  top: var(--ss-pad);
  left: var(--ss-pad);
  width: calc(100% - var(--ss-pad) * 2);
  height: calc(100% - var(--ss-pad) * 2);
  background: var(--ss-ink);
  color: var(--ss-on-ink);
  outline: none;
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.slide-send[data-phase='done'] .slide-send__capsule {
  background: var(--ss-ok);
  color: var(--ss-on-ok);
}

.slide-send[data-phase='error'] .slide-send__capsule {
  background: var(--ss-no);
  color: var(--ss-on-no);
}

.slide-send__capsule:focus-visible {
  box-shadow: inset 0 0 0 2px var(--ss-track);
}

.slide-send__content {
  position: absolute;
  inset: 0;
}

.slide-send__arrow,
.slide-send__spin,
.slide-send__done {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
  font-size: var(--ss-font);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.006em;
  white-space: nowrap;
}

.slide-send__arrow svg,
.slide-send__done svg,
.slide-send__spinner {
  display: block;
}

.slide-send__arrow,
.slide-send__spin {
  transition: filter 200ms ease;
}

.slide-send[data-phase='pending'] .slide-send__arrow {
  filter: blur(2px);
}

.slide-send:not([data-phase='pending']) .slide-send__spin {
  filter: blur(2px);
}

.slide-send__spinner {
  animation: slide-send-spin 1s linear infinite;
  animation-play-state: paused;
}

.slide-send[data-phase='pending'] .slide-send__spinner {
  animation-play-state: running;
}

@keyframes slide-send-spin {
  to {
    transform: rotate(360deg);
  }
}

.slide-send__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .slide-send__spinner {
    animation: slide-send-breathe 1.4s ease-in-out infinite;
    animation-play-state: paused;
  }

  .slide-send[data-phase='pending'] .slide-send__spinner {
    animation-play-state: running;
  }

  @keyframes slide-send-breathe {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.4;
    }
  }
}
`

let slideSendStylesInjected = false
function useSlideSendStyles() {
  useEffect(() => {
    if (slideSendStylesInjected || typeof document === 'undefined') return
    if (document.getElementById('slide-send-styles')) {
      slideSendStylesInjected = true
      return
    }
    const tag = document.createElement('style')
    tag.id = 'slide-send-styles'
    tag.textContent = SLIDE_SEND_CSS
    document.head.appendChild(tag)
    slideSendStylesInjected = true
  }, [])
}

function SlideSend({
  label = 'Slide to send',
  doneLabel = 'Sent',
  errorLabel = 'Send failed',
  onConfirm,
  onDone,
  onError,
  trackColor = '#262626',
  handleColor = '#f5f5f5',
  successColor = '#22c55e',
  dangerColor = '#e5484d',
  width = 280,
  height = 56,
  radius = 28,
  speed = 50,
  returnBounce = 0.38,
  landingDip = 0.026,
  holdMs = 1500,
  disabled = false,
  icon,
  className = '',
}) {
  useSlideSendStyles()

  const reduce = useReducedMotion()
  const [phase, setPhase] = useState('idle')
  const [held, setHeld] = useState(false)
  const [hot, setHot] = useState(false)

  const wrapRef = useRef(null)
  const trackRef = useRef(null)
  const capsuleRef = useRef(null)
  const grip = useRef(null)
  const timer = useRef(0)
  const homeTimer = useRef(0)
  const run = useRef(0)
  const unwatch = useRef(null)
  const live = useRef({ move: () => {}, up: () => {} })
  const lastPercent = useRef(0)

  const GRIP = height - SLIDE_SEND_PAD * 2
  const INNER = width - SLIDE_SEND_PAD * 2
  const TRAVEL = Math.max(1, INNER - GRIP)
  const r = slideSendClamp(radius, 0, height / 2)
  const gripR = Math.max(0, r - SLIDE_SEND_PAD)
  const k = 260 + (slideSendClamp(speed, 0, 100) / 100) * 640
  const mass = 0.9
  const critical = 2 * Math.sqrt(k * mass)
  const commitSpring = { type: 'spring', stiffness: k, damping: critical, mass }
  const homeSpring = { ...commitSpring, damping: critical * (1 - slideSendClamp(returnBounce, 0, 0.5)) }

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start 88%', 'start 42%'] })
  const revealY = useTransform(scrollYProgress, [0, 1], [26, 0])
  const revealOpacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const revealScale = useTransform(scrollYProgress, [0, 1], [0.94, 1])

  const x = useMotionValue(0)
  const anchor = useMotionValue(0)
  const shown = useMotionValue(1)
  const spin = useMotionValue(0)
  const pulse = useMotionValue(1)
  const shake = useMotionValue(0)
  const seen = useTransform(x, (v) => slideSendClamp(v, 0, TRAVEL))
  const edge = useTransform([seen, anchor], ([v, a]) => v + GRIP + slideSendClamp(a - v, 0, TRAVEL))
  const clip = useTransform(edge, (R) => `inset(0 ${INNER - R}px 0 0 round ${gripR}px)`)
  const content = useTransform([seen, edge], ([v, R]) => `translateX(${(v + R) / 2 - INNER / 2}px)`)
  const swell = hot && !held && phase === 'idle' && !reduce ? SLIDE_SEND_SWELL : 1
  const shape = useTransform(x, (v) => {
    const q = 1 - Math.min(SLIDE_SEND_SQUASH_MAX, Math.max(0, -v) / SLIDE_SEND_SQUASH_DIV)
    return `scale(${q * swell}, ${swell / q})`
  })
  const origin = useTransform(seen, (v) => `${v}px 50%`)
  const say = useTransform(seen, [0, TRAVEL * 0.55], [1, 0])
  const arrow = useTransform(
    [seen, shown],
    ([v, on]) => on * slideSendClamp(1 - (v - TRAVEL * 0.55) / (TRAVEL * 0.4), 0, 1)
  )
  const trackTransform = useTransform([shake, pulse], ([s, p]) => `translateX(${s}px) scale(${p})`)

  const labelText = typeof label === 'string' ? label : 'Slide to confirm'
  useMotionValueEvent(seen, 'change', (v) => {
    const percent = Math.round((v / TRAVEL) * 100)
    if (percent === lastPercent.current || !capsuleRef.current) return
    lastPercent.current = percent
    capsuleRef.current.setAttribute('aria-valuenow', String(percent))
    capsuleRef.current.setAttribute('aria-valuetext', `${labelText}, ${percent}%`)
  })

  useEffect(
    () => () => {
      clearTimeout(timer.current)
      clearTimeout(homeTimer.current)
      unwatch.current?.()
      run.current += 1
    },
    []
  )

  const local = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return (clientX - rect.left) / (rect.width / width || 1)
  }

  const goHome = (velocity) => {
    if (reduce) animate(x, 0, { duration: 0.2, ease: SLIDE_SEND_EASE_OUT })
    else animate(x, 0, { ...homeSpring, velocity: Math.min(0, velocity) })
  }

  const settle = () => {
    setPhase('idle')
    animate(shown, 1, { duration: 0.2, delay: 0.12 })
    if (reduce) anchor.set(0)
    else animate(anchor, 0, { type: 'spring', duration: 0.3, bounce: 0 })
  }

  const resolve = (viaKey) => {
    setPhase('done')
    anchor.set(x.get())
    animate(spin, 0, { duration: 0.12 })
    if (reduce) x.set(0)
    else {
      animate(x, 0, commitSpring)
      if (!viaKey && landingDip > 0) {
        animate(pulse, [1, 1 - landingDip, 1], { duration: 0.46, times: [0, 0.62, 1], ease: SLIDE_SEND_EASE_OUT, delay: 0.1 })
      }
    }
    onDone?.()
    if (holdMs > 0) timer.current = setTimeout(settle, holdMs)
  }

  const reject = (reason) => {
    setPhase('error')
    onError?.(reason)
    animate(spin, 0, { duration: 0.12 })
    animate(shown, 1, { duration: 0.2, delay: 0.12 })
    if (reduce) goHome(0)
    else {
      animate(shake, SLIDE_SEND_SHAKE, { duration: 0.45, ease: SLIDE_SEND_EASE_OUT })
      homeTimer.current = setTimeout(() => {
        if (!grip.current) goHome(0)
      }, 300)
    }
    timer.current = setTimeout(() => setPhase('idle'), Math.max(holdMs, 1500))
  }

  const commit = (viaKey) => {
    clearTimeout(timer.current)
    const id = ++run.current
    x.set(TRAVEL)
    let out
    try {
      out = onConfirm?.()
    } catch (reason) {
      reject(reason)
      return
    }
    const pending = out && typeof out.then === 'function' ? out : null
    if (!pending) {
      animate(shown, 0, { duration: 0.12 })
      resolve(viaKey)
      return
    }
    setPhase('pending')
    animate(shown, 0, { duration: 0.2 })
    animate(spin, 1, { duration: 0.2 })
    const t0 = performance.now()
    const later = (fn) => {
      setTimeout(
        () => {
          if (id === run.current) fn()
        },
        Math.max(0, SLIDE_SEND_MIN_PENDING - (performance.now() - t0))
      )
    }
    pending.then(
      () => later(() => resolve(viaKey)),
      (reason) => later(() => reject(reason))
    )
  }

  const down = (e) => {
    if (disabled || grip.current || phase === 'pending' || phase === 'done' || e.button !== 0) return
    x.stop()
    grip.current = { id: e.pointerId, grab: null, moved: false, hist: [] }
    setHeld(true)
    try {
      trackRef.current?.setPointerCapture(e.pointerId)
    } catch {}
    unwatch.current?.()
    const onMove = (ev) => ev.isTrusted && live.current.move(ev)
    const onUp = (ev) => ev.isTrusted && live.current.up(ev)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    unwatch.current = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      unwatch.current = null
    }
  }

  const move = (e) => {
    const g = grip.current
    if (!g || g.id !== e.pointerId) return
    const at = local(e.clientX)
    if (g.grab === null) {
      g.grab = at - x.get()
      return
    }
    const next = slideSendClamp(at - g.grab, 0, TRAVEL)
    if (Math.abs(next - x.get()) > 0.5) g.moved = true
    g.hist.push([e.timeStamp, next])
    if (g.hist.length > 4) g.hist.shift()
    x.set(next)
  }

  const up = (e) => {
    const g = grip.current
    if (!g || g.id !== e.pointerId) return
    grip.current = null
    unwatch.current?.()
    try {
      trackRef.current?.releasePointerCapture(e.pointerId)
    } catch {}
    setHeld(false)
    if (x.get() >= TRAVEL) commit(false)
    else if (g.moved) goHome(slideSendVelocityOf(g.hist))
  }
  live.current = { move, up }

  const onKeyDown = (e) => {
    if (disabled || phase === 'pending' || phase === 'done') return
    const step = TRAVEL / 10
    if (e.key === 'End') {
      e.preventDefault()
      commit(true)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(TRAVEL, x.get() + step)
      x.set(next)
      if (next >= TRAVEL) commit(true)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      x.set(Math.max(0, x.get() - step))
    } else if (e.key === 'Home' || e.key === 'Escape') {
      e.preventDefault()
      if (grip.current) up({ pointerId: grip.current.id })
      else x.set(0)
    }
  }

  const fontSize = slideSendClamp(Math.round(height * 0.25), 13, 17)
  const iconSize = Math.round(GRIP * 0.42)
  const done = phase === 'done'

  return (
    <motion.div
      ref={wrapRef}
      className={`slide-send${className ? ` ${className}` : ''}`}
      data-phase={phase}
      data-held={held ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      style={{
        width,
        height,
        '--ss-track': trackColor,
        '--ss-ink': handleColor,
        '--ss-ok': successColor,
        '--ss-no': dangerColor,
        '--ss-on-ink': slideSendOnColor(handleColor),
        '--ss-on-ok': slideSendOnColor(successColor),
        '--ss-on-no': slideSendOnColor(dangerColor),
        '--ss-radius': `${r}px`,
        '--ss-grip-r': `${gripR}px`,
        '--ss-pad': `${SLIDE_SEND_PAD}px`,
        '--ss-font': `${fontSize}px`,
        opacity: reduce ? 1 : revealOpacity,
        y: reduce ? 0 : revealY,
        scale: reduce ? 1 : revealScale,
      }}
    >
      <motion.div
        ref={trackRef}
        className="slide-send__track"
        style={{ transform: trackTransform }}
        onPointerDown={down}
      >
        <motion.span className="slide-send__label" style={{ opacity: say }} aria-hidden="true">
          <span className="slide-send__text slide-send__text--plain">{label}</span>
          <span className="slide-send__text slide-send__text--error">{errorLabel}</span>
        </motion.span>
        <motion.div
          ref={capsuleRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={labelText}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-busy={phase === 'pending' || undefined}
          aria-disabled={disabled || undefined}
          className="slide-send__capsule"
          style={{ clipPath: clip, transform: shape, transformOrigin: origin }}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse' && slideSendFinePointer()) setHot(true)
          }}
          onPointerLeave={() => setHot(false)}
          onKeyDown={onKeyDown}
        >
          <motion.div className="slide-send__content" style={{ transform: content }}>
            <motion.span className="slide-send__arrow" style={{ opacity: arrow }} aria-hidden="true">
              {icon ?? <HugeiconsIcon icon={SentIcon} size={iconSize} strokeWidth={2} />}
            </motion.span>
            <motion.span className="slide-send__spin" style={{ opacity: spin }} aria-hidden="true">
              <SlideSendSpinner size={iconSize} />
            </motion.span>
            <motion.span
              className="slide-send__done"
              aria-hidden="true"
              initial={false}
              animate={{ opacity: done ? 1 : 0, scale: done || reduce ? 1 : 0.95 }}
              transition={{ duration: 0.2, ease: SLIDE_SEND_EASE_OUT }}
            >
              <HugeiconsIcon icon={Tick02Icon} size={Math.round(GRIP * 0.38)} strokeWidth={2.5} />
              {doneLabel}
            </motion.span>
          </motion.div>
        </motion.div>
        <span className="slide-send__sr" aria-live="polite">
          {phase === 'pending' ? 'Working' : phase === 'done' ? doneLabel : phase === 'error' ? errorLabel : ''}
        </span>
      </motion.div>
    </motion.div>
  )
}

function ContactHero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.2])
  const leftX = useTransform(scrollYProgress, [0, 1], [0, -60])
  const rightX = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section
      ref={ref}
      className="relative px-4 sm:px-8 py-16 text-center text-white overflow-hidden"
      style={{ backgroundColor: 'var(--ncm-black)' }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 w-1/3 md:w-2/5"
        style={{ x: reduce ? 0 : leftX }}
      >
        <Particles
          particleColors={['#0f766e', '#14b8a6', '#5eead4']}
          particleCount={140}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={90}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        />
      </motion.div>
      <motion.div
        className="absolute inset-y-0 right-0 w-1/3 md:w-2/5"
        style={{ x: reduce ? 0 : rightX }}
      >
        <Particles
          particleColors={['#0f766e', '#14b8a6', '#5eead4']}
          particleCount={140}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={90}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        />
      </motion.div>
      <motion.div
        className="relative z-10"
        style={{ y: reduce ? 0 : heroY, opacity: reduce ? 1 : heroOpacity }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: REVEAL_EASE }}
        >
          Contact Us
        </motion.h1>
        <motion.p
          className="text-gray-300 max-w-xl mx-auto"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: REVEAL_EASE }}
        >
          Have a question or need professional advice? Get in touch and our team will
          respond as soon as possible.
        </motion.p>
      </motion.div>
    </section>
  )
}

const CONTACT_ITEMS = [
  { icon: '📞', label: 'Call Us', value: '062 830 3044' },
  { icon: '💬', label: 'WhatsApp', value: '083 333 9349' },
  { icon: '✉️', label: 'Email', value: 'admin@ncmca.co.za' },
  { icon: '🌐', label: 'Website', value: 'www.ncmca.co.za' },
  { icon: '📍', label: 'Locations', value: 'Durban, Umhlanga, Ballito and Richards Bay' },
]

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

  const handleFormSubmit = (e) => {
    e.preventDefault()
  }

  const submitMessage = () => {
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

    return emailjs
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
        throw err
      })
  }

  return (
    <div className="text-black">
      <ContactHero />

      <section className="px-4 sm:px-8 py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <Reveal as="h2" className="text-2xl font-bold mb-6" style={{ color: 'var(--ncm-teal)' }} x={-24} y={0}>
            Get in Touch
          </Reveal>

          <RevealGroup className="space-y-5 text-gray-700" stagger={0.1}>
            {CONTACT_ITEMS.map((item) => (
              <RevealItem key={item.label} className="flex items-start gap-3" y={16}>
                <span style={{ color: 'var(--ncm-teal)' }}>{item.icon}</span>
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm">{item.value}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal
            as="p"
            className="mt-10 italic text-gray-500 text-sm"
            delay={0.1}
          >
            Delivering Excellence Through Integrity, Insight and Innovation.
          </Reveal>
        </div>

        <div>
          <Reveal as="h2" className="text-2xl font-bold mb-6" style={{ color: 'var(--ncm-teal)' }} x={24} y={0}>
            Send a Message
          </Reveal>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <RevealGroup stagger={0.08} className="space-y-4">
              <RevealItem y={18}>
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                <motion.input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01, borderColor: 'var(--ncm-teal)' }}
                  transition={{ duration: 0.2, ease: REVEAL_EASE }}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--ncm-grey)' }}
                />
              </RevealItem>

              <RevealItem y={18} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                  <motion.input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    whileFocus={{ scale: 1.01, borderColor: 'var(--ncm-teal)' }}
                    transition={{ duration: 0.2, ease: REVEAL_EASE }}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--ncm-grey)' }}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
                  <motion.input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    whileFocus={{ scale: 1.01, borderColor: 'var(--ncm-teal)' }}
                    transition={{ duration: 0.2, ease: REVEAL_EASE }}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--ncm-grey)' }}
                  />
                </div>
              </RevealItem>

              <RevealItem y={18}>
                <label htmlFor="subject" className="block text-sm font-medium mb-1 text-gray-700">Subject</label>
                <motion.input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01, borderColor: 'var(--ncm-teal)' }}
                  transition={{ duration: 0.2, ease: REVEAL_EASE }}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--ncm-grey)' }}
                />
              </RevealItem>

              <RevealItem y={18}>
                <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-700">Message</label>
                <motion.textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.01, borderColor: 'var(--ncm-teal)' }}
                  transition={{ duration: 0.2, ease: REVEAL_EASE }}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--ncm-grey)' }}
                />
              </RevealItem>
            </RevealGroup>
          </form>

          <div className="flex flex-col items-center gap-3 mt-6">
            <SlideSend
              label="Slide to send"
              doneLabel="Sent!"
              errorLabel="Failed to send"
              onConfirm={submitMessage}
              trackColor="#e8f2f1"
              handleColor="var(--ncm-teal)"
              successColor="#22c55e"
              dangerColor="#e5484d"
              width={280}
              height={56}
              radius={28}
              disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
            />
            {status === 'success' && (
              <motion.p
                className="text-green-600 text-sm text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: REVEAL_EASE }}
              >
                Message sent successfully! We'll be in touch shortly.
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                className="text-red-600 text-sm text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: REVEAL_EASE }}
              >
                Something went wrong. Please try again or contact us directly.
              </motion.p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}