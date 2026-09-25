import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing'
import * as THREE from 'three'
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
import Lenis from 'lenis'

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

const EMAILJS_SERVICE_ID = 'service_84h3ijq'
const EMAILJS_TEMPLATE_ID = 'template_uiqsv7j'
const EMAILJS_PUBLIC_KEY = '4fhuYl5hFBniQ1LVE'

const DEFAULT_EFFECT_OPTIONS = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x0f766e,
    brokenLines: 0x0f766e,
    leftCars: [0x0f766e, 0x14b8a6, 0x0d9488],
    rightCars: [0x5eead4, 0x2dd4bf, 0x14b8a6],
    sticks: 0x5eead4,
  },
}

function Hyperspeed({ effectOptions = DEFAULT_EFFECT_OPTIONS, lightMode = false }) {
  const hyperspeed = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    if (appRef.current) {
      appRef.current.dispose()
      appRef.current = null
      const container = hyperspeed.current
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
    }
    const mountainUniforms = {
      uFreq: { value: new THREE.Vector3(3, 6, 10) },
      uAmp: { value: new THREE.Vector3(30, 30, 20) },
    }

    const xyUniforms = {
      uFreq: { value: new THREE.Vector2(5, 2) },
      uAmp: { value: new THREE.Vector2(25, 15) },
    }

    const LongRaceUniforms = {
      uFreq: { value: new THREE.Vector2(2, 3) },
      uAmp: { value: new THREE.Vector2(35, 10) },
    }

    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) },
    }

    const deepUniforms = {
      uFreq: { value: new THREE.Vector2(4, 8) },
      uAmp: { value: new THREE.Vector2(10, 20) },
      uPowY: { value: new THREE.Vector2(20, 2) },
    }

    let nsin = val => Math.sin(val) * 0.5 + 0.5

    const distortions = {
      mountainDistortion: {
        uniforms: mountainUniforms,
        getDistortion: `
          uniform vec3 uAmp;
          uniform vec3 uFreq;
          #define PI 3.14159265358979
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          vec3 getDistortion(float progress){
            float movementProgressFix = 0.02;
            return vec3( 
              cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
              nsin(progress * PI * uFreq.y + uTime) * uAmp.y - nsin(movementProgressFix * PI * uFreq.y + uTime) * uAmp.y,
              nsin(progress * PI * uFreq.z + uTime) * uAmp.z - nsin(movementProgressFix * PI * uFreq.z + uTime) * uAmp.z
            );
          }
        `,
        getJS: (progress, time) => {
          let movementProgressFix = 0.02
          let uFreq = mountainUniforms.uFreq.value
          let uAmp = mountainUniforms.uAmp.value
          let distortion = new THREE.Vector3(
            Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x -
              Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
            nsin(progress * Math.PI * uFreq.y + time) * uAmp.y -
              nsin(movementProgressFix * Math.PI * uFreq.y + time) * uAmp.y,
            nsin(progress * Math.PI * uFreq.z + time) * uAmp.z -
              nsin(movementProgressFix * Math.PI * uFreq.z + time) * uAmp.z
          )
          let lookAtAmp = new THREE.Vector3(2, 2, 2)
          let lookAtOffset = new THREE.Vector3(0, 0, -5)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        },
      },
      xyDistortion: {
        uniforms: xyUniforms,
        getDistortion: `
          uniform vec2 uFreq;
          uniform vec2 uAmp;
          #define PI 3.14159265358979
          vec3 getDistortion(float progress){
            float movementProgressFix = 0.02;
            return vec3( 
              cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
              sin(progress * PI * uFreq.y + PI/2. + uTime) * uAmp.y - sin(movementProgressFix * PI * uFreq.y + PI/2. + uTime) * uAmp.y,
              0.
            );
          }
        `,
        getJS: (progress, time) => {
          let movementProgressFix = 0.02
          let uFreq = xyUniforms.uFreq.value
          let uAmp = xyUniforms.uAmp.value
          let distortion = new THREE.Vector3(
            Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x -
              Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
            Math.sin(progress * Math.PI * uFreq.y + time + Math.PI / 2) * uAmp.y -
              Math.sin(movementProgressFix * Math.PI * uFreq.y + time + Math.PI / 2) * uAmp.y,
            0
          )
          let lookAtAmp = new THREE.Vector3(2, 0.4, 1)
          let lookAtOffset = new THREE.Vector3(0, 0, -3)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        },
      },
      LongRaceDistortion: {
        uniforms: LongRaceUniforms,
        getDistortion: `
          uniform vec2 uFreq;
          uniform vec2 uAmp;
          #define PI 3.14159265358979
          vec3 getDistortion(float progress){
            float camProgress = 0.0125;
            return vec3( 
              sin(progress * PI * uFreq.x + uTime) * uAmp.x - sin(camProgress * PI * uFreq.x + uTime) * uAmp.x,
              sin(progress * PI * uFreq.y + uTime) * uAmp.y - sin(camProgress * PI * uFreq.y + uTime) * uAmp.y,
              0.
            );
          }
        `,
        getJS: (progress, time) => {
          let camProgress = 0.0125
          let uFreq = LongRaceUniforms.uFreq.value
          let uAmp = LongRaceUniforms.uAmp.value
          let distortion = new THREE.Vector3(
            Math.sin(progress * Math.PI * uFreq.x + time) * uAmp.x -
              Math.sin(camProgress * Math.PI * uFreq.x + time) * uAmp.x,
            Math.sin(progress * Math.PI * uFreq.y + time) * uAmp.y -
              Math.sin(camProgress * Math.PI * uFreq.y + time) * uAmp.y,
            0
          )
          let lookAtAmp = new THREE.Vector3(1, 1, 0)
          let lookAtOffset = new THREE.Vector3(0, 0, -5)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        },
      },
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r + uTime) * uAmp.r +
              pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.0125),
              getDistortionY(progress) - getDistortionY(0.0125),
              0.
            );
          }
        `,
        getJS: (progress, time) => {
          const uFreq = turbulentUniforms.uFreq.value
          const uAmp = turbulentUniforms.uAmp.value

          const getX = p =>
            Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
            Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y

          const getY = p =>
            -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
            Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w

          let distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.007),
            getY(progress) - getY(progress + 0.007),
            0
          )
          let lookAtAmp = new THREE.Vector3(-2, -5, 0)
          let lookAtOffset = new THREE.Vector3(0, 0, -10)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        },
      },
      deepDistortion: {
        uniforms: deepUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          uniform vec2 uPowY;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              sin(progress * PI * uFreq.x + uTime) * uAmp.x
            );
          }
          float getDistortionY(float progress){
            return (
              pow(abs(progress * uPowY.x), uPowY.y) + sin(progress * PI * uFreq.y + uTime) * uAmp.y
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.02),
              getDistortionY(progress) - getDistortionY(0.02),
              0.
            );
          }
        `,
        getJS: (progress, time) => {
          const uFreq = deepUniforms.uFreq.value
          const uAmp = deepUniforms.uAmp.value
          const uPowY = deepUniforms.uPowY.value

          const getX = p => Math.sin(p * Math.PI * uFreq.x + time) * uAmp.x
          const getY = p => Math.pow(p * uPowY.x, uPowY.y) + Math.sin(p * Math.PI * uFreq.y + time) * uAmp.y

          let distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.01),
            getY(progress) - getY(progress + 0.01),
            0
          )
          let lookAtAmp = new THREE.Vector3(-2, -4, 0)
          let lookAtOffset = new THREE.Vector3(0, 0, -10)
          return distortion.multiply(lookAtAmp).add(lookAtOffset)
        },
      },
    }

    class App {
      constructor(container, options = {}) {
        this.options = options
        if (this.options.distortion == null) {
          this.options.distortion = {
            uniforms: distortion_uniforms,
            getDistortion: distortion_vertex,
          }
        }
        this.container = container
        this.hasValidSize = false

        const initW = Math.max(1, container.offsetWidth)
        const initH = Math.max(1, container.offsetHeight)

        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
        })
        this.renderer.setSize(initW, initH, false)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.domElement.style.width = '100%'
        this.renderer.domElement.style.height = '100%'
        this.renderer.domElement.style.display = 'block'
        this.composer = new EffectComposer(this.renderer)
        container.append(this.renderer.domElement)

        this.camera = new THREE.PerspectiveCamera(options.fov, initW / initH, 0.1, 10000)
        this.camera.position.z = -5
        this.camera.position.y = 8
        this.camera.position.x = 0
        this.scene = new THREE.Scene()
        this.scene.background = null

        let fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500)
        this.scene.fog = fog
        this.fogUniforms = {
          fogColor: { value: fog.color },
          fogNear: { value: fog.near },
          fogFar: { value: fog.far },
        }
        this.timer = new THREE.Timer()
        this.timer.connect(document)
        this.assets = {}
        this.disposed = false

        this.road = new Road(this, options)
        this.leftCarLights = new CarLights(
          this,
          options,
          options.colors.leftCars,
          options.movingAwaySpeed,
          new THREE.Vector2(0, 1 - options.carLightsFade)
        )
        this.rightCarLights = new CarLights(
          this,
          options,
          options.colors.rightCars,
          options.movingCloserSpeed,
          new THREE.Vector2(1, 0 + options.carLightsFade)
        )
        this.leftSticks = new LightsSticks(this, options)

        this.fovTarget = options.fov
        this.speedUpTarget = 0
        this.speedUp = 0
        this.timeOffset = 0

        this.tick = this.tick.bind(this)
        this.init = this.init.bind(this)
        this.setSize = this.setSize.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)

        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.onContextMenu = this.onContextMenu.bind(this)

        this.onWindowResize = this.onWindowResize.bind(this)
        window.addEventListener('resize', this.onWindowResize)

        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          this.hasValidSize = true
        }
      }

      onWindowResize() {
        const width = this.container.offsetWidth
        const height = this.container.offsetHeight

        if (width <= 0 || height <= 0) {
          this.hasValidSize = false
          return
        }

        this.renderer.setSize(width, height)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.composer.setSize(width, height)
        this.hasValidSize = true
      }

      initPasses() {
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.bloomPass = new EffectPass(
          this.camera,
          new BloomEffect({
            luminanceThreshold: 0.2,
            luminanceSmoothing: 0,
            resolutionScale: 1,
          })
        )

        const smaaPass = new EffectPass(
          this.camera,
          new SMAAEffect({
            preset: SMAAPreset.MEDIUM,
            searchImage: SMAAEffect.searchImageDataURL,
            areaImage: SMAAEffect.areaImageDataURL,
          })
        )
        this.renderPass.renderToScreen = false
        this.bloomPass.renderToScreen = false
        smaaPass.renderToScreen = true
        this.composer.addPass(this.renderPass)
        this.composer.addPass(this.bloomPass)
        this.composer.addPass(smaaPass)
      }

      loadAssets() {
        const assets = this.assets
        return new Promise(resolve => {
          const manager = new THREE.LoadingManager(resolve)

          const searchImage = new Image()
          const areaImage = new Image()
          assets.smaa = {}
          searchImage.addEventListener('load', function () {
            assets.smaa.search = this
            manager.itemEnd('smaa-search')
          })

          areaImage.addEventListener('load', function () {
            assets.smaa.area = this
            manager.itemEnd('smaa-area')
          })
          manager.itemStart('smaa-search')
          manager.itemStart('smaa-area')

          searchImage.src = SMAAEffect.searchImageDataURL
          areaImage.src = SMAAEffect.areaImageDataURL
        })
      }

      init() {
        this.initPasses()
        const options = this.options
        this.road.init()
        this.leftCarLights.init()

        this.leftCarLights.mesh.position.setX(-options.roadWidth / 2 - options.islandWidth / 2)
        this.rightCarLights.init()
        this.rightCarLights.mesh.position.setX(options.roadWidth / 2 + options.islandWidth / 2)
        this.leftSticks.init()
        this.leftSticks.mesh.position.setX(-(options.roadWidth + options.islandWidth / 2))

        this.container.addEventListener('mousedown', this.onMouseDown)
        this.container.addEventListener('mouseup', this.onMouseUp)
        this.container.addEventListener('mouseout', this.onMouseUp)

        this.container.addEventListener('touchstart', this.onTouchStart, { passive: true })
        this.container.addEventListener('touchend', this.onTouchEnd, { passive: true })
        this.container.addEventListener('touchcancel', this.onTouchEnd, { passive: true })

        this.container.addEventListener('contextmenu', this.onContextMenu)

        this.tick()
      }

      onMouseDown(ev) {
        if (this.options.onSpeedUp) this.options.onSpeedUp(ev)
        this.fovTarget = this.options.fovSpeedUp
        this.speedUpTarget = this.options.speedUp
      }

      onMouseUp(ev) {
        if (this.options.onSlowDown) this.options.onSlowDown(ev)
        this.fovTarget = this.options.fov
        this.speedUpTarget = 0
      }

      onTouchStart(ev) {
        if (this.options.onSpeedUp) this.options.onSpeedUp(ev)
        this.fovTarget = this.options.fovSpeedUp
        this.speedUpTarget = this.options.speedUp
      }

      onTouchEnd(ev) {
        if (this.options.onSlowDown) this.options.onSlowDown(ev)
        this.fovTarget = this.options.fov
        this.speedUpTarget = 0
      }

      onContextMenu(ev) {
        ev.preventDefault()
      }

      update(delta) {
        let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta)
        this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001)
        this.timeOffset += this.speedUp * delta

        const time = this.timer.getElapsed() + this.timeOffset

        this.rightCarLights.update(time)
        this.leftCarLights.update(time)
        this.leftSticks.update(time)
        this.road.update(time)

        let updateCamera = false
        let fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage)
        if (fovChange !== 0) {
          this.camera.fov += fovChange * delta * 6
          updateCamera = true
        }

        if (this.options.distortion.getJS) {
          const distortion = this.options.distortion.getJS(0.025, time)

          this.camera.lookAt(
            new THREE.Vector3(
              this.camera.position.x + distortion.x,
              this.camera.position.y + distortion.y,
              this.camera.position.z + distortion.z
            )
          )
          updateCamera = true
        }
        if (updateCamera) {
          this.camera.updateProjectionMatrix()
        }
      }

      render(delta) {
        this.composer.render(delta)
      }

      dispose() {
        this.disposed = true
        this.timer.dispose()

        if (this.scene) {
          this.scene.traverse(object => {
            const obj = object
            if (!obj.isMesh) return

            if (obj.geometry) obj.geometry.dispose()

            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach(material => material.dispose())
              } else {
                obj.material.dispose()
              }
            }
          })
          this.scene.clear()
        }

        if (this.renderer) {
          this.renderer.dispose()
          this.renderer.forceContextLoss()
          if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
          }
        }
        if (this.composer) {
          this.composer.dispose()
        }

        window.removeEventListener('resize', this.onWindowResize)
        if (this.container) {
          this.container.removeEventListener('mousedown', this.onMouseDown)
          this.container.removeEventListener('mouseup', this.onMouseUp)
          this.container.removeEventListener('mouseout', this.onMouseUp)

          this.container.removeEventListener('touchstart', this.onTouchStart)
          this.container.removeEventListener('touchend', this.onTouchEnd)
          this.container.removeEventListener('touchcancel', this.onTouchEnd)
          this.container.removeEventListener('contextmenu', this.onContextMenu)
        }
      }

      setSize(width, height, updateStyles) {
        if (width <= 0 || height <= 0) {
          this.hasValidSize = false
          return
        }
        this.composer.setSize(width, height, updateStyles)
        this.hasValidSize = true
      }

      tick() {
        if (this.disposed) return

        if (!this.hasValidSize) {
          const w = this.container.offsetWidth
          const h = this.container.offsetHeight
          if (w > 0 && h > 0) {
            this.renderer.setSize(w, h, false)
            this.camera.aspect = w / h
            this.camera.updateProjectionMatrix()
            this.composer.setSize(w, h)
            this.hasValidSize = true
            this.timer.reset()
          } else {
            requestAnimationFrame(this.tick)
            return
          }
        }

        if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
          const canvas = this.renderer.domElement
          if (this.hasValidSize) {
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
          }
        }

        if (this.hasValidSize) {
          this.timer.update()
          const delta = this.timer.getDelta()
          this.render(delta)
          this.update(delta)
        }

        requestAnimationFrame(this.tick)
      }
    }

    const distortion_uniforms = {
      uDistortionX: { value: new THREE.Vector2(80, 3) },
      uDistortionY: { value: new THREE.Vector2(-40, 2.5) },
    }

    const distortion_vertex = `
      #define PI 3.14159265358979
      uniform vec2 uDistortionX;
      uniform vec2 uDistortionY;
      float nsin(float val){
        return sin(val) * 0.5 + 0.5;
      }
      vec3 getDistortion(float progress){
        progress = clamp(progress, 0., 1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3( 
          xAmp * nsin(progress * PI * xFreq - PI / 2.),
          yAmp * nsin(progress * PI * yFreq - PI / 2.),
          0.
        );
      }
    `

    const random = base => {
      if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0]
      return Math.random() * base
    }

    const pickRandom = arr => {
      if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)]
      return arr
    }

    function lerp(current, target, speed = 0.1, limit = 0.001) {
      let change = (target - current) * speed
      if (Math.abs(change) < limit) {
        change = target - current
      }
      return change
    }

    class CarLights {
      constructor(webgl, options, colors, speed, fade) {
        this.webgl = webgl
        this.options = options
        this.colors = colors
        this.speed = speed
        this.fade = fade
      }

      init() {
        const options = this.options
        let curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1))
        let geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false)

        let instanced = new THREE.InstancedBufferGeometry().copy(geometry)
        instanced.instanceCount = options.lightPairsPerRoadWay * 2

        let laneWidth = options.roadWidth / options.lanesPerRoad

        let aOffset = []
        let aMetrics = []
        let aColor = []

        let colors = this.colors
        if (Array.isArray(colors)) {
          colors = colors.map(c => new THREE.Color(c))
        } else {
          colors = new THREE.Color(colors)
        }

        for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
          let radius = random(options.carLightsRadius)
          let length = random(options.carLightsLength)
          let speed = random(this.speed)

          let carLane = i % options.lanesPerRoad
          let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2

          let carWidth = random(options.carWidthPercentage) * laneWidth
          let carShiftX = random(options.carShiftX) * laneWidth
          laneX += carShiftX

          let offsetY = random(options.carFloorSeparation) + radius * 1.3

          let offsetZ = -random(options.length)

          aOffset.push(laneX - carWidth / 2)
          aOffset.push(offsetY)
          aOffset.push(offsetZ)

          aOffset.push(laneX + carWidth / 2)
          aOffset.push(offsetY)
          aOffset.push(offsetZ)

          aMetrics.push(radius)
          aMetrics.push(length)
          aMetrics.push(speed)

          aMetrics.push(radius)
          aMetrics.push(length)
          aMetrics.push(speed)

          let color = pickRandom(colors)
          aColor.push(color.r)
          aColor.push(color.g)
          aColor.push(color.b)

          aColor.push(color.r)
          aColor.push(color.g)
          aColor.push(color.b)
        }

        instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false))
        instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false))
        instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false))

        let material = new THREE.ShaderMaterial({
          fragmentShader: carLightsFragment,
          vertexShader: carLightsVertex,
          transparent: true,
          uniforms: Object.assign(
            {
              uTime: { value: 0 },
              uTravelLength: { value: options.length },
              uFade: { value: this.fade },
            },
            this.webgl.fogUniforms,
            options.distortion.uniforms
          ),
        })

        material.onBeforeCompile = shader => {
          shader.vertexShader = shader.vertexShader.replace(
            '#include <getDistortion_vertex>',
            options.distortion.getDistortion
          )
        }

        let mesh = new THREE.Mesh(instanced, material)
        mesh.frustumCulled = false
        this.webgl.scene.add(mesh)
        this.mesh = mesh
      }

      update(time) {
        this.mesh.material.uniforms.uTime.value = time
      }
    }

    const carLightsFragment = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_fragment']}
      varying vec3 vColor;
      varying vec2 vUv; 
      uniform vec2 uFade;
      void main() {
        vec3 color = vec3(vColor);
        float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
        gl_FragColor = vec4(color, alpha);
        if (gl_FragColor.a < 0.0001) discard;
        ${THREE.ShaderChunk['fog_fragment']}
      }
    `

    const carLightsVertex = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_vertex']}
      attribute vec3 aOffset;
      attribute vec3 aMetrics;
      attribute vec3 aColor;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec2 vUv; 
      varying vec3 vColor; 
      #include <getDistortion_vertex>
      void main() {
        vec3 transformed = position.xyz;
        float radius = aMetrics.r;
        float myLength = aMetrics.g;
        float speed = aMetrics.b;

        transformed.xy *= radius;
        transformed.z *= myLength;

        transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
        transformed.xy += aOffset.xy;

        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        vColor = aColor;
        ${THREE.ShaderChunk['fog_vertex']}
      }
    `

    class LightsSticks {
      constructor(webgl, options) {
        this.webgl = webgl
        this.options = options
      }

      init() {
        const options = this.options
        const geometry = new THREE.PlaneGeometry(1, 1)
        let instanced = new THREE.InstancedBufferGeometry().copy(geometry)
        let totalSticks = options.totalSideLightSticks
        instanced.instanceCount = totalSticks

        let stickoffset = options.length / (totalSticks - 1)
        const aOffset = []
        const aColor = []
        const aMetrics = []

        let colors = options.colors.sticks
        if (Array.isArray(colors)) {
          colors = colors.map(c => new THREE.Color(c))
        } else {
          colors = new THREE.Color(colors)
        }

        for (let i = 0; i < totalSticks; i++) {
          let width = random(options.lightStickWidth)
          let height = random(options.lightStickHeight)
          aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random())

          let color = pickRandom(colors)
          aColor.push(color.r)
          aColor.push(color.g)
          aColor.push(color.b)

          aMetrics.push(width)
          aMetrics.push(height)
        }

        instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false))
        instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false))
        instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false))

        const material = new THREE.ShaderMaterial({
          fragmentShader: sideSticksFragment,
          vertexShader: sideSticksVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(
            {
              uTravelLength: { value: options.length },
              uTime: { value: 0 },
            },
            this.webgl.fogUniforms,
            options.distortion.uniforms
          ),
        })

        material.onBeforeCompile = shader => {
          shader.vertexShader = shader.vertexShader.replace(
            '#include <getDistortion_vertex>',
            options.distortion.getDistortion
          )
        }

        const mesh = new THREE.Mesh(instanced, material)
        mesh.frustumCulled = false
        this.webgl.scene.add(mesh)
        this.mesh = mesh
      }

      update(time) {
        this.mesh.material.uniforms.uTime.value = time
      }
    }

    const sideSticksVertex = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_vertex']}
      attribute float aOffset;
      attribute vec3 aColor;
      attribute vec2 aMetrics;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec3 vColor;
      mat4 rotationY( in float angle ) {
        return mat4(	cos(angle),		0,		sin(angle),	0,
                     0,		1.0,			 0,	0,
                -sin(angle),	0,		cos(angle),	0,
                0, 		0,				0,	1);
      }
      #include <getDistortion_vertex>
      void main(){
        vec3 transformed = position.xyz;
        float width = aMetrics.x;
        float height = aMetrics.y;

        transformed.xy *= vec2(width, height);
        float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);

        transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;

        transformed.z += - uTravelLength + time;

        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);

        transformed.y += height / 2.;
        transformed.x += -width / 2.;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vColor = aColor;
        ${THREE.ShaderChunk['fog_vertex']}
      }
    `

    const sideSticksFragment = `
      #define USE_FOG;
      ${THREE.ShaderChunk['fog_pars_fragment']}
      varying vec3 vColor;
      void main(){
        vec3 color = vec3(vColor);
        gl_FragColor = vec4(color,1.);
        ${THREE.ShaderChunk['fog_fragment']}
      }
    `

    class Road {
      constructor(webgl, options) {
        this.webgl = webgl
        this.options = options
        this.uTime = { value: 0 }
      }

      createPlane(side, width, isRoad) {
        const options = this.options
        let segments = 100
        const geometry = new THREE.PlaneGeometry(
          isRoad ? options.roadWidth : options.islandWidth,
          options.length,
          20,
          segments
        )
        let uniforms = {
          uTravelLength: { value: options.length },
          uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) },
          uTime: this.uTime,
        }

        if (isRoad) {
          uniforms = Object.assign(uniforms, {
            uLanes: { value: options.lanesPerRoad },
            uBrokenLinesColor: { value: new THREE.Color(options.colors.brokenLines) },
            uShoulderLinesColor: { value: new THREE.Color(options.colors.shoulderLines) },
            uShoulderLinesWidthPercentage: { value: options.shoulderLinesWidthPercentage },
            uBrokenLinesLengthPercentage: { value: options.brokenLinesLengthPercentage },
            uBrokenLinesWidthPercentage: { value: options.brokenLinesWidthPercentage },
          })
        }

        const material = new THREE.ShaderMaterial({
          fragmentShader: isRoad ? roadFragment : islandFragment,
          vertexShader: roadVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(uniforms, this.webgl.fogUniforms, options.distortion.uniforms),
        })

        material.onBeforeCompile = shader => {
          shader.vertexShader = shader.vertexShader.replace(
            '#include <getDistortion_vertex>',
            options.distortion.getDistortion
          )
        }

        const mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.x = -Math.PI / 2
        mesh.position.z = -options.length / 2
        mesh.position.x += (this.options.islandWidth / 2 + options.roadWidth / 2) * side
        this.webgl.scene.add(mesh)

        return mesh
      }

      init() {
        this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true)
        this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true)
        this.island = this.createPlane(0, this.options.islandWidth, false)
      }

      update(time) {
        this.uTime.value = time
      }
    }

    const roadBaseFragment = `
      #define USE_FOG;
      varying vec2 vUv; 
      uniform vec3 uColor;
      uniform float uTime;
      #include <roadMarkings_vars>
      ${THREE.ShaderChunk['fog_pars_fragment']}
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(uColor);
        #include <roadMarkings_fragment>
        gl_FragColor = vec4(color, 1.);
        ${THREE.ShaderChunk['fog_fragment']}
      }
    `

    const islandFragment = roadBaseFragment
      .replace('#include <roadMarkings_fragment>', '')
      .replace('#include <roadMarkings_vars>', '')

    const roadMarkings_vars = `
      uniform float uLanes;
      uniform vec3 uBrokenLinesColor;
      uniform vec3 uShoulderLinesColor;
      uniform float uShoulderLinesWidthPercentage;
      uniform float uBrokenLinesWidthPercentage;
      uniform float uBrokenLinesLengthPercentage;
      highp float random(vec2 co) {
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt = dot(co.xy, vec2(a, b));
        highp float sn = mod(dt, 3.14);
        return fract(sin(sn) * c);
      }
    `

    const roadMarkings_fragment = `
      uv.y = mod(uv.y + uTime * 0.05, 1.);
      float laneWidth = 1.0 / uLanes;
      float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
      float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;

      float brokenLines = step(1.0 - brokenLineWidth, fract(uv.x * 2.0)) * step(laneEmptySpace, fract(uv.y * 10.0));
      float sideLines = step(1.0 - brokenLineWidth, fract((uv.x - laneWidth * (uLanes - 1.0)) * 2.0)) + step(brokenLineWidth, uv.x);

      brokenLines = mix(brokenLines, sideLines, uv.x);
    `

    const roadFragment = roadBaseFragment
      .replace('#include <roadMarkings_fragment>', roadMarkings_fragment)
      .replace('#include <roadMarkings_vars>', roadMarkings_vars)

    const roadVertex = `
      #define USE_FOG;
      uniform float uTime;
      ${THREE.ShaderChunk['fog_pars_vertex']}
      uniform float uTravelLength;
      varying vec2 vUv; 
      #include <getDistortion_vertex>
      void main() {
        vec3 transformed = position.xyz;
        vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
        transformed.x += distortion.x;
        transformed.z += distortion.y;
        transformed.y += -1. * distortion.z;  
        
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        ${THREE.ShaderChunk['fog_vertex']}
      }
    `

    function resizeRendererToDisplaySize(renderer, setSize) {
      const canvas = renderer.domElement
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width <= 0 || height <= 0) return false
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) {
        setSize(width, height, false)
      }
      return needResize
    }

    const container = hyperspeed.current
    if (!container) return

    const options = {
      ...DEFAULT_EFFECT_OPTIONS,
      ...effectOptions,
      colors: {
        ...DEFAULT_EFFECT_OPTIONS.colors,
        ...effectOptions.colors,
        ...(lightMode
          ? {
              roadColor: 0xffffff,
              islandColor: 0xf8f7fa,
              background: 0xffffff,
              shoulderLines: 0x0f766e,
              brokenLines: 0x14b8a6,
            }
          : {}),
      },
    }
    options.distortion = distortions[options.distortion]

    const myApp = new App(container, options)
    appRef.current = myApp
    myApp.loadAssets().then(myApp.init)

    return () => {
      if (appRef.current) {
        appRef.current.dispose()
        appRef.current = null
      }
    }
  }, [effectOptions, lightMode])

  return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} ref={hyperspeed}></div>
}

const heroHyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x0f766e,
    brokenLines: 0x0f766e,
    leftCars: [0x0f766e, 0x14b8a6, 0x0d9488],
    rightCars: [0x5eead4, 0x2dd4bf, 0x14b8a6],
    sticks: 0x5eead4,
  },
}

export default function Careers() {
  const openings = []

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: '',
  })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
  }

  const submitApplication = () => {
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

    return emailjs
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
        throw err
      })
  }

  return (
    <div className="text-black">
      <section className="relative px-4 sm:px-8 py-24 sm:py-32 text-center text-white overflow-hidden" style={{ backgroundColor: '#000' }}>
        <div className="absolute inset-y-0 left-0 w-3/5 md:w-[55%] overflow-hidden">
          <Hyperspeed effectOptions={heroHyperspeedOptions} />
        </div>
        <div className="absolute inset-y-0 right-0 w-3/5 md:w-[55%] overflow-hidden" style={{ transform: 'scaleX(-1)' }}>
          <Hyperspeed effectOptions={heroHyperspeedOptions} />
        </div>
        <div className="relative z-10 flex justify-center">
          <div
            className="max-w-md px-8 py-10 rounded-2xl"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Careers at NCM Inc</h1>
            <p className="text-gray-200">
              Build your career with a firm that combines professional heritage with
              modern thinking. We're always interested in hearing from talented,
              driven individuals.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--ncm-teal)' }}>Why Work With Us</h2>
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

      <section className="px-4 sm:px-8 py-16" style={{ backgroundColor: '#f0f7f6' }}>
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
                  style={{ borderColor: 'var(--ncm-grey)' }}
                >
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
                  </div>
                  <a
                    href="#apply"
                    className="text-sm font-medium"
                    style={{ color: 'var(--ncm-teal)' }}
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

      <section id="apply" className="px-4 sm:px-8 py-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-teal)' }}>
          Apply Now
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Fill in your details below. We'll be in touch if there's a suitable opportunity.
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-4">
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
              style={{ borderColor: 'var(--ncm-grey)' }}
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
                style={{ borderColor: 'var(--ncm-grey)' }}
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
                style={{ borderColor: 'var(--ncm-grey)' }}
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
              style={{ borderColor: 'var(--ncm-grey)' }}
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
              style={{ borderColor: 'var(--ncm-grey)' }}
            />
          </div>

          <div
            className="text-sm rounded-md px-4 py-3"
            style={{ backgroundColor: '#f0f7f6', border: '1px solid #cfe8e4', color: 'var(--ncm-teal)' }}
          >
            📎 Please email your CV directly to <strong>info@ncmca.co.za</strong> along
            with this application, referencing the position you're applying for.
          </div>

        </form>

        <div className="flex flex-col items-center gap-3 mt-8">
          <SlideSend
            label="Slide to submit"
            doneLabel="Submitted!"
            errorLabel="Failed to send"
            onConfirm={submitApplication}
            trackColor="#e8f2f1"
            handleColor="var(--ncm-teal)"
            successColor="#22c55e"
            dangerColor="#e5484d"
            width={320}
            height={56}
            radius={28}
            disabled={!formData.name || !formData.email || !formData.position || !formData.message}
          />
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
        </div>
      </section>

      <section className="px-4 sm:px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-teal)' }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions First?</h2>
        <p className="mb-8 max-w-xl mx-auto">
          Reach out to us directly if you'd like to know more before applying.
        </p>
        <Link
          to="/contact"
          className="inline-block px-6 py-3 rounded-md font-semibold bg-white"
          style={{ color: 'var(--ncm-teal)' }}
        >
          Get in Touch
        </Link>
      </section>
    </div>
  )
}