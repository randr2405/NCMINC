import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
}

const colorModeToFloat = mode => (mode === 'ember' ? 1 : mode === 'frost' ? 2 : 0)

const moltenVertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const moltenFragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform bool uEnableMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uBackgroundColor;
uniform bool uLightMode;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float time = iTime * uSpeed;
  vec2 p = uScale * ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;

  vec2 drift = vec2(0.0);
  if (uEnableMouse) {
    drift = (uMouse - 0.5) * uMouseStrength * 2.0;
  }
  p += drift;

  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;

  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float glowCore = uGlow * uCoreSize;

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= uDetail) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / length(vec2(sin(i.x + t), cos(i.y + t)));
  }

  c /= 6.0;

  float intensity = max(c - uBlackPoint, 0.0) * uBrightness;

  float g = clamp(intensity, 0.0, 1.0);

  float mid = 0.5;
  if (uColorMode > 1.5) {
    mid = 0.65;
  } else if (uColorMode > 0.5) {
    mid = 0.35;
  }

  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  col = mix(col, uColor3, smoothstep(mid, 1.0, g));

  float a = g;
  if (uGrain > 0.5) {
    float gr = hash(gl_FragCoord.xy + iTime);
    a += (gr - 0.5) * uGrainIntensity;
  }
  a = clamp(a, 0.0, 1.0) * uOpacity;
  if (uLightMode) {
    float signal = 1.0 - exp(-max(c, 0.0) * 6.5);
    float body = smoothstep(0.075, 0.68, signal);
    float ridge = smoothstep(0.42, 0.92, signal);

    vec3 lightCol = mix(uColor1, uColor2, smoothstep(0.08, 0.52, signal));
    lightCol = mix(lightCol, uColor3, smoothstep(0.52, 0.96, signal));
    lightCol = mix(lightCol, lightCol * 0.72, ridge * 0.24);

    float coverage = body * mix(0.2, 0.86, signal) * uOpacity;
    if (uGrain > 0.5) {
      float gr = hash(gl_FragCoord.xy + iTime);
      coverage += (gr - 0.5) * uGrainIntensity * body * 0.16;
    }
    fragColor = vec4(mix(uBackgroundColor, lightCol, clamp(coverage, 0.0, 0.92)), 1.0);
  } else {
    fragColor = vec4(col * a, a);
  }
}
`

const moltenCtxMap = new WeakMap()

function MoltenMetal({
  color1 = '#0d2e2a',
  color2 = '#0f766e',
  color3 = '#f2ede4',
  speed = 0.35,
  scale = 4,
  detail = 3,
  glow = 1.6,
  coreSize = 0.1,
  swirl = 1,
  fold = -0.2,
  blackPoint = 0.05,
  brightness = 1.3,
  colorMode = 'molten',
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3,
  opacity = 1.0,
  backgroundColor = '#111111',
  lightMode = false,
  style = {},
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })

    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: moltenVertex,
      fragment: moltenFragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.35 },
        uScale: { value: 4 },
        uDetail: { value: 3 },
        uGlow: { value: 1.6 },
        uCoreSize: { value: 0.1 },
        uSwirl: { value: 1 },
        uFold: { value: -0.2 },
        uBlackPoint: { value: 0.05 },
        uBrightness: { value: 1.3 },
        uColorMode: { value: 0 },
        uGrain: { value: 1 },
        uGrainIntensity: { value: 0.05 },
        uOpacity: { value: 1.0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseStrength: { value: 0.3 },
        uEnableMouse: { value: true },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
        uBackgroundColor: { value: new Float32Array([1, 1, 1]) },
        uLightMode: { value: false },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    moltenCtxMap.set(container, { renderer, program, mesh })

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      renderer.setSize(w, h)
      const res = program.uniforms.iResolution.value
      res[0] = gl.drawingBufferWidth
      res[1] = gl.drawingBufferHeight
      renderer.render({ scene: mesh })
    }

    const ro = new ResizeObserver(setSize)
    ro.observe(container)
    setSize()

    const targetMouse = [0.5, 0.5]
    const currentMouse = [0.5, 0.5]

    const handleMouseMove = e => {
      const rect = canvas.getBoundingClientRect()
      targetMouse[0] = (e.clientX - rect.left) / rect.width
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height
    }
    const handleMouseLeave = () => {
      targetMouse[0] = 0.5
      targetMouse[1] = 0.5
    }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    let raf = 0
    let isVisible = true
    let isPageVisible = !document.hidden
    const t0 = performance.now()

    const loop = t => {
      program.uniforms.iTime.value = (t - t0) * 0.001
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0])
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1])
      program.uniforms.uMouse.value[0] = currentMouse[0]
      program.uniforms.uMouse.value[1] = currentMouse[1]
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop)
    }
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        isVisible ? tryStart() : tryStop()
      },
      { threshold: 0 }
    )
    io.observe(container)

    const onVisibility = () => {
      isPageVisible = !document.hidden
      isPageVisible ? tryStart() : tryStop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    tryStart()

    return () => {
      tryStop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      moltenCtxMap.delete(container)
      if (canvas.parentNode === container) container.removeChild(canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ctx = moltenCtxMap.get(container)
    if (!ctx) return
    const u = ctx.program.uniforms

    u.uSpeed.value = speed
    u.uScale.value = scale
    u.uDetail.value = detail
    u.uGlow.value = glow
    u.uCoreSize.value = Math.max(coreSize, 0.001)
    u.uSwirl.value = swirl
    u.uFold.value = fold
    u.uBlackPoint.value = blackPoint
    u.uBrightness.value = brightness
    u.uColorMode.value = colorModeToFloat(colorMode)
    u.uGrain.value = grain ? 1 : 0
    u.uGrainIntensity.value = grainIntensity
    u.uOpacity.value = opacity
    u.uMouseStrength.value = mouseStrength
    u.uEnableMouse.value = mouseInteraction
    u.uLightMode.value = lightMode
    const c1 = hexToRgb(color1)
    const c2 = hexToRgb(color2)
    const c3 = hexToRgb(color3)
    const bg = hexToRgb(backgroundColor)
    const uc1 = u.uColor1.value
    const uc2 = u.uColor2.value
    const uc3 = u.uColor3.value
    uc1[0] = c1[0]
    uc1[1] = c1[1]
    uc1[2] = c1[2]
    uc2[0] = c2[0]
    uc2[1] = c2[1]
    uc2[2] = c2[2]
    uc3[0] = c3[0]
    uc3[1] = c3[1]
    uc3[2] = c3[2]
    u.uBackgroundColor.value[0] = bg[0]
    u.uBackgroundColor.value[1] = bg[1]
    u.uBackgroundColor.value[2] = bg[2]
  }, [
    color1,
    color2,
    color3,
    speed,
    scale,
    detail,
    glow,
    coreSize,
    swirl,
    fold,
    blackPoint,
    brightness,
    colorMode,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseStrength,
    opacity,
    backgroundColor,
    lightMode,
  ])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
    />
  )
}

function SpotlightCard({ children, className = '', spotlightColor = 'rgba(15, 118, 110, 0.32)' }) {
  const divRef = useRef(null)

  const handleMouseMove = e => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    divRef.current.style.setProperty('--mouse-x', `${x}px`)
    divRef.current.style.setProperty('--mouse-y', `${y}px`)
    divRef.current.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`sp-card-spotlight ${className}`}>
      {children}
    </div>
  )
}

function useReveal(threshold = 0.12) {
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

function Reveal({ as: Tag = 'div', delay = 0, className = '', style = {}, dir = 'up', children }) {
  const [ref, visible] = useReveal()
  const offsets = {
    up: 'translateY(24px)',
    down: 'translateY(-24px)',
    left: 'translateX(-28px)',
    right: 'translateX(28px)',
    scale: 'scale(0.94)',
  }
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
        transform: visible ? 'none' : offsets[dir] || offsets.up,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}

function Counter({ end, suffix = '', duration = 1400 }) {
  const [ref, visible] = useReveal(0.3)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    let frame
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(end * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, end, duration])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}

function useParallax() {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const progress = 1 - rect.top / vh
      setOffset(progress)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return [ref, offset]
}

export default function ServicePageLayout({
  title,
  tagline,
  intro,
  highlights = [],
  sections = [],
  valuePoints = [],
}) {
  const [heroIn, setHeroIn] = useState(false)
  const [heroRef, heroOffset] = useParallax()

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="text-black overflow-x-hidden">
      <style>{`
        .sp-card-spotlight {
          position: relative;
          overflow: hidden;
          --mouse-x: 50%;
          --mouse-y: 50%;
          --spotlight-color: rgba(15, 118, 110, 0.32);
        }
        .sp-card-spotlight::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 75%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .sp-card-spotlight:hover::before,
        .sp-card-spotlight:focus-within::before {
          opacity: 1;
        }
        .sp-pill {
          transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
        }
        .sp-pill:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15, 118, 110, 0.25);
        }
        .sp-item {
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .sp-item:hover {
          transform: translateX(4px);
          color: var(--ncm-teal);
        }
        .sp-value {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .sp-value:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.08);
        }
      `}</style>

      <section
        ref={heroRef}
        className="relative px-6 sm:px-8 py-20 sm:py-28 text-center text-white overflow-hidden"
        style={{ backgroundColor: 'var(--ncm-black)' }}
      >
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ transform: `translateY(${Math.min(heroOffset * 40, 60)}px)` }}
        >
          <MoltenMetal
            color1="#134e4a"
            color2="#14b8a6"
            color3="#f2ede4"
            speed={0.3}
            scale={4}
            detail={3}
            glow={1.8}
            coreSize={0.14}
            swirl={1}
            fold={-0.2}
            blackPoint={0.02}
            brightness={1.6}
            colorMode="molten"
            grain
            grainIntensity={0.04}
            mouseInteraction
            mouseStrength={0.25}
            opacity={0.85}
          />
        </div>

        <div className="relative">
          <p
            className="uppercase tracking-widest text-xs sm:text-sm mb-4 transition-all duration-700 ease-out"
            style={{
              color: 'var(--ncm-grey)',
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'none' : 'translateY(10px)',
            }}
          >
            Professional Services
          </p>

          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight transition-all duration-700 ease-out"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'none' : 'translateY(16px)',
              transitionDelay: '100ms',
            }}
          >
            {title}
          </h1>

          {tagline && (
            <div
              className="relative inline-block transition-all duration-700 ease-out"
              style={{
                opacity: heroIn ? 1 : 0,
                transform: heroIn ? 'none' : 'translateY(16px)',
                transitionDelay: '220ms',
              }}
            >
              <p className="text-base sm:text-lg font-medium" style={{ color: '#5eead4', textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}>
                {tagline}
              </p>
              <span
                className="absolute left-0 -bottom-1 h-[3px] rounded-full transition-all duration-[900ms] ease-out"
                style={{
                  backgroundColor: '#5eead4',
                  width: heroIn ? '100%' : '0%',
                  transitionDelay: '550ms',
                }}
              />
            </div>
          )}

          {intro && (
            <p
              className="max-w-2xl mx-auto mt-8 text-gray-300 text-base sm:text-lg transition-all duration-700 ease-out"
              style={{
                opacity: heroIn ? 1 : 0,
                transform: heroIn ? 'none' : 'translateY(16px)',
                transitionDelay: '340ms',
              }}
            >
              {intro}
            </p>
          )}

          {highlights.length > 0 && (
            <div
              className="mt-10 flex flex-wrap justify-center gap-3 transition-all duration-700 ease-out"
              style={{
                opacity: heroIn ? 1 : 0,
                transform: heroIn ? 'none' : 'translateY(16px)',
                transitionDelay: '440ms',
              }}
            >
              {highlights.map((h, i) => (
                <span
                  key={h}
                  className="sp-pill px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(94, 234, 212, 0.12)',
                    border: '1px solid rgba(94, 234, 212, 0.4)',
                    color: '#5eead4',
                    transitionDelay: `${440 + i * 40}ms`,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          )}

          <div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4 transition-all duration-700 ease-out"
            style={{
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'none' : 'translateY(16px)',
              transitionDelay: '540ms',
            }}
          >
            <Link
              to="/contact"
              className="px-6 py-3 rounded-md font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              style={{ backgroundColor: 'var(--ncm-teal)' }}
            >
              Get in Touch
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-md font-semibold border transition-colors duration-200 hover:bg-white/10"
              style={{ borderColor: 'var(--ncm-grey)', color: 'var(--ncm-grey)' }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {sections.length > 0 && (
        <section className="px-6 sm:px-8 py-16 max-w-6xl mx-auto">
          <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-teal)' }}>
            What We Offer
          </Reveal>
          <Reveal delay={80} className="text-center text-gray-600 mb-12">
            A complete, structured approach across every stage of the service.
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {sections.map((section, i) => (
              <Reveal key={section.title} delay={(i % 2) * 100} dir={i % 2 === 0 ? 'left' : 'right'} className="h-full">
                <SpotlightCard className="h-full rounded-lg border p-6" spotlightColor="rgba(20, 184, 166, 0.22)">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--ncm-black)', borderColor: 'var(--ncm-grey)' }}>
                    {section.title}
                  </h3>
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  )}
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    {section.items.map(item => (
                      <li key={item} className="sp-item flex items-start gap-2">
                        <span style={{ color: 'var(--ncm-teal)' }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {valuePoints.length > 0 && (
        <section className="px-6 sm:px-8 py-16" style={{ backgroundColor: 'var(--ncm-grey)' }}>
          <div className="max-w-5xl mx-auto">
            <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-black)' }}>
              The Value You Gain
            </Reveal>
            <Reveal delay={80} className="text-center text-gray-600 mb-12">
              Tangible outcomes that support your business, every step of the way.
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-4">
              {valuePoints.map((point, i) => (
                <Reveal key={point} delay={(i % 4) * 80} dir="scale">
                  <div
                    className="sp-value flex items-start gap-3 rounded-lg p-4 bg-white border"
                    style={{ borderColor: 'rgba(15, 118, 110, 0.2)' }}
                  >
                    <span
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: 'rgba(15, 118, 110, 0.12)',
                        color: 'var(--ncm-teal)',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 pt-0.5">{point}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 sm:px-8 py-16 text-white text-center" style={{ backgroundColor: 'var(--ncm-black)' }}>
        <Reveal as="h2" className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
          Ready to Get Started?
        </Reveal>
        <Reveal delay={80} className="max-w-2xl mx-auto text-gray-300 mb-8 text-sm sm:text-base">
          Speak to our team about how {title.toLowerCase()} can support your business, backed by{' '}
          <Counter end={40} suffix="+" /> years of experience.
        </Reveal>
        <Reveal delay={160}>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 rounded-md font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: 'var(--ncm-teal)' }}
          >
            Contact Us Today
          </Link>
        </Reveal>
      </section>
    </div>
  )
}