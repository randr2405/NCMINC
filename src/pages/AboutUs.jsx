import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, Children, useLayoutEffect } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import { motion, AnimatePresence } from 'motion/react'

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
}

const tunnelVertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const tunnelFragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uFlowDir;
uniform float uPulseSpeed;
uniform float uPulseLength;
uniform float uPulseBlend;
uniform float uPulseWidth;
uniform float uCableCount;
uniform float uThickness;
uniform float uRimWidth;
uniform float uWaviness;
uniform float uSway;
uniform float uSize;
uniform vec2 uCenter;
uniform vec2 uMouseOffset;
uniform float uGlow;
uniform float uFadeNear;
uniform float uFadeFar;
uniform float uBrightness;
uniform float uColorVariance;
uniform float uOpacity;
uniform vec3 uCableColor;
uniform vec3 uPulseColor;
uniform vec3 uTunnelColor;
uniform float uTunnelOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uLightMode;
out vec4 fragColor;

void mainImage(out vec4 o, in vec2 fragCoord) {
  float size = uSize * 2.0;
  float flowDir = uFlowDir;
  float speedBase = uSpeed * 4.0 * flowDir;
  float waviness = uWaviness * 0.15;
  float rotationOsc = uSway * 0.5;
  float baseThick = uThickness * 0.35 + 0.05;
  float borderWeight = uRimWidth * 0.15 + 0.01;
  float cablesCount = floor(uCableCount);

  vec2 res = iResolution.xy;
  vec2 uv = (fragCoord - 0.5 * res) / min(res.y, res.x);
  uv -= (uCenter + uMouseOffset);
  uv /= (size + 0.0001);

  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float depth = -log(r + 0.0001);

  float swing = sin(iTime * (uSpeed * 0.5 + 0.1)) * rotationOsc;
  float waveOffset = sin(depth * 1.2 + iTime * speedBase * 0.25) * waviness;

  float angleNormalized = (angle / 6.2831853) + 0.5;
  float finalAngle = fract(angleNormalized + waveOffset + swing);

  float cableID = floor(finalAngle * cablesCount);
  float gvX = (fract(finalAngle * cablesCount) - 0.5);

  float rand = fract(sin(cableID * 12.9898) * 43758.5453);
  float randSpeed = (0.4 + rand * 0.6) * speedBase * uPulseSpeed;
  float cableThick = baseThick * (0.6 + rand * 0.4);

  vec3 cableCol = uCableColor;
  cableCol *= 1.0 + (rand - 0.5) * 0.4 * uColorVariance;
  cableCol = mix(cableCol, uPulseColor, rand * 0.25 * uColorVariance);

  float scroll = depth + (iTime * randSpeed);
  float pulseFact = fract(scroll);

  float distToCore = abs(gvX);
  float wireMask = smoothstep(cableThick, cableThick - 0.05, distToCore);
  float rimGlow = smoothstep(borderWeight, 0.0, abs(distToCore - cableThick));

  float pulseThick = cableThick * uPulseWidth;
  float pulseMask = smoothstep(pulseThick, pulseThick - 0.05 * uPulseWidth, distToCore);

  float pulseDist = abs(pulseFact - 0.5);
  float pulseTotal = uPulseLength;
  float pulseCore = pulseTotal * (1.0 - uPulseBlend);
  float pulseLo = min(pulseCore, pulseTotal - max(fwidth(scroll), 1e-4));
  float dataPulse = 1.0 - smoothstep(pulseLo, pulseTotal, pulseDist);

  float aBody = wireMask * uTunnelOpacity;
  float aRim = rimGlow;
  float aPulse = clamp(dataPulse * pulseMask, 0.0, 1.0);

  vec3 fiberCol = uTunnelColor * aBody
    + cableCol * aRim * 1.3 * uGlow
    + uPulseColor * dataPulse * 3.0 * pulseMask;

  float distFade = smoothstep(0.0, uFadeNear, r) * smoothstep(uFadeFar, uFadeFar - 0.9, r);
  float inten = clamp(aBody + aRim + aPulse, 0.0, 1.0) * distFade;

  vec3 finalCol = fiberCol * uBrightness;
  float alpha = clamp(inten, 0.0, 1.0) * uOpacity;
  vec3 outRgb = finalCol * alpha;

  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha = clamp(alpha + gv, 0.0, 1.0);
  }

  o = vec4(outRgb, alpha);
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  if (uLightMode > 0.5) {
    float peak = max(o.r, max(o.g, o.b));
    vec3 chroma = pow(clamp(o.rgb / max(peak, 0.0001), 0.0, 1.0), vec3(1.16));
    fragColor = vec4(mix(vec3(1.0), chroma, o.a * 0.95), 1.0);
  } else {
    fragColor = o;
  }
}
`

const tunnelCtxMap = new WeakMap()

function LightTunnel({
  cableColor = '#14b8a6',
  pulseColor = '#5eead4',
  tunnelColor = '#0f766e',
  tunnelOpacity = 0,
  speed = 0.1,
  flowDirection = 'outward',
  pulseSpeed = 2,
  pulseLength = 0.28,
  pulseBlend = 1,
  pulseWidth = 1,
  cableCount = 20,
  thickness = 0.35,
  rimWidth = 0.15,
  waviness = 0.3,
  sway = 0.5,
  size = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  glow = 1.0,
  fadeNear = 0.5,
  fadeFar = 2,
  brightness = 1.0,
  colorVariance = true,
  grain = true,
  grainIntensity = 0.05,
  opacity = 1.0,
  mouseInteraction = true,
  mouseStrength = 0.1,
  lightMode = false,
  className = '',
}) {
  const containerRef = useRef(null)
  const mouseEnabledRef = useRef(mouseInteraction)
  const mouseStrengthRef = useRef(mouseStrength)

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
      vertex: tunnelVertex,
      fragment: tunnelFragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.1 },
        uFlowDir: { value: -1.0 },
        uPulseSpeed: { value: 2.0 },
        uPulseLength: { value: 0.28 },
        uPulseBlend: { value: 1.0 },
        uPulseWidth: { value: 1.0 },
        uCableCount: { value: 20 },
        uThickness: { value: 0.35 },
        uRimWidth: { value: 0.15 },
        uWaviness: { value: 0.3 },
        uSway: { value: 0.5 },
        uSize: { value: 1.0 },
        uCenter: { value: new Float32Array([0, 0]) },
        uMouseOffset: { value: new Float32Array([0, 0]) },
        uGlow: { value: 1.0 },
        uFadeNear: { value: 0.5 },
        uFadeFar: { value: 2.0 },
        uBrightness: { value: 1.0 },
        uColorVariance: { value: 1.0 },
        uOpacity: { value: 1.0 },
        uCableColor: { value: new Float32Array([0.078, 0.722, 0.651]) },
        uPulseColor: { value: new Float32Array([0.369, 0.914, 0.831]) },
        uTunnelColor: { value: new Float32Array([0.059, 0.463, 0.435]) },
        uTunnelOpacity: { value: 0.0 },
        uGrain: { value: 1.0 },
        uGrainIntensity: { value: 0.05 },
        uLightMode: { value: 0.0 },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    tunnelCtxMap.set(container, { renderer, program, mesh })

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

    let currentMouse = [0.5, 0.5]
    let targetMouse = [0.5, 0.5]

    const handleMouseMove = e => {
      const rect = canvas.getBoundingClientRect()
      targetMouse = [(e.clientX - rect.left) / rect.width, 1.0 - (e.clientY - rect.top) / rect.height]
    }
    const handleMouseLeave = () => {
      targetMouse = [0.5, 0.5]
    }
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    let raf = 0
    let isVisible = true
    let isPageVisible = !document.hidden
    const t0 = performance.now()

    const loop = t => {
      program.uniforms.iTime.value = (t - t0) * 0.001

      if (mouseEnabledRef.current) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0])
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1])
      } else {
        currentMouse[0] += 0.05 * (0.5 - currentMouse[0])
        currentMouse[1] += 0.05 * (0.5 - currentMouse[1])
      }
      const off = program.uniforms.uMouseOffset.value
      off[0] = (currentMouse[0] - 0.5) * mouseStrengthRef.current
      off[1] = (currentMouse[1] - 0.5) * mouseStrengthRef.current

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
      tunnelCtxMap.delete(container)
      try {
        container.removeChild(canvas)
      } catch {}
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  useEffect(() => {
    mouseEnabledRef.current = mouseInteraction
    mouseStrengthRef.current = mouseStrength

    const container = containerRef.current
    if (!container) return
    const ctx = tunnelCtxMap.get(container)
    if (!ctx) return
    const { program } = ctx
    const u = program.uniforms

    u.uSpeed.value = speed
    u.uFlowDir.value = flowDirection === 'outward' ? -1.0 : 1.0
    u.uPulseSpeed.value = pulseSpeed
    u.uPulseLength.value = pulseLength
    u.uPulseBlend.value = pulseBlend
    u.uPulseWidth.value = pulseWidth
    u.uCableCount.value = cableCount
    u.uThickness.value = thickness
    u.uRimWidth.value = rimWidth
    u.uWaviness.value = waviness
    u.uSway.value = sway
    u.uSize.value = size
    const center = u.uCenter.value
    center[0] = centerX
    center[1] = centerY
    u.uGlow.value = glow
    u.uFadeNear.value = fadeNear
    u.uFadeFar.value = fadeFar
    u.uBrightness.value = brightness
    u.uColorVariance.value = colorVariance ? 1.0 : 0.0
    u.uGrain.value = grain ? 1.0 : 0.0
    u.uGrainIntensity.value = grainIntensity
    u.uOpacity.value = opacity
    u.uLightMode.value = lightMode ? 1.0 : 0.0
    const cable = hexToRgb(cableColor)
    const cableU = u.uCableColor.value
    cableU[0] = cable[0]
    cableU[1] = cable[1]
    cableU[2] = cable[2]
    const pulse = hexToRgb(pulseColor)
    const pulseU = u.uPulseColor.value
    pulseU[0] = pulse[0]
    pulseU[1] = pulse[1]
    pulseU[2] = pulse[2]
    const tunnel = hexToRgb(tunnelColor)
    const tunnelU = u.uTunnelColor.value
    tunnelU[0] = tunnel[0]
    tunnelU[1] = tunnel[1]
    tunnelU[2] = tunnel[2]
    u.uTunnelOpacity.value = tunnelOpacity
  }, [
    cableColor,
    pulseColor,
    tunnelColor,
    tunnelOpacity,
    speed,
    flowDirection,
    pulseSpeed,
    pulseLength,
    pulseBlend,
    pulseWidth,
    cableCount,
    thickness,
    rimWidth,
    waviness,
    sway,
    size,
    centerX,
    centerY,
    glow,
    fadeNear,
    fadeFar,
    brightness,
    colorVariance,
    grain,
    grainIntensity,
    opacity,
    mouseInteraction,
    mouseStrength,
    lightMode,
  ])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    />
  )
}

function SpotlightCard({ children, className = '', spotlightColor = 'rgba(20, 184, 166, 0.28)' }) {
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
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  )
}

const stepVariants = {
  enter: dir => ({
    x: dir >= 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: dir => ({
    x: dir >= 0 ? '50%' : '-50%',
    opacity: 0,
  }),
}

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

function StepConnector({ isComplete }) {
  const lineVariants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: '#0f766e' },
  }

  return (
    <div className="step-connector">
      <motion.div
        className="step-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete'

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step)
  }

  return (
    <motion.div
      onClick={handleClick}
      className="step-indicator"
      style={disableStepIndicators ? { pointerEvents: 'none', opacity: 0.5 } : {}}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#e6f2f0', color: '#0f766e' },
          active: { scale: 1, backgroundColor: '#0f766e', color: '#fff' },
          complete: { scale: 1, backgroundColor: '#0f766e', color: '#fff' },
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner"
      >
        {status === 'complete' ? (
          <CheckIcon className="check-icon" />
        ) : status === 'active' ? (
          <div className="active-dot" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  )
}

function SlideTransition({ children, direction, onHeightReady }) {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight)
  }, [children, onHeightReady])

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  )
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
  const [parentHeight, setParentHeight] = useState(0)

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Step({ children }) {
  return <div className="step-default">{children}</div>
}

function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [direction, setDirection] = useState(0)
  const stepsArray = Children.toArray(children)
  const totalSteps = stepsArray.length
  const isCompleted = currentStep > totalSteps
  const isLastStep = currentStep === totalSteps

  const updateStep = newStep => {
    setCurrentStep(newStep)
    if (newStep > totalSteps) {
      onFinalStepCompleted()
    } else {
      onStepChange(newStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      updateStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1)
      updateStep(currentStep + 1)
    }
  }

  const handleComplete = () => {
    setDirection(1)
    updateStep(totalSteps + 1)
  }

  return (
    <div className="outer-container" {...rest}>
      <div
        className={`step-circle-container ${stepCircleContainerClassName}`}
        style={{ border: '1px solid #e6f2f0', backgroundColor: '#fff' }}
      >
        <div className={`step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1
            const isNotLastStep = index < totalSteps - 1
            return (
              <div key={stepNumber} style={{ display: 'contents' }}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: clicked => {
                      setDirection(clicked > currentStep ? 1 : -1)
                      updateStep(clicked)
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={clicked => {
                      setDirection(clicked > currentStep ? 1 : -1)
                      updateStep(clicked)
                    }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </div>
            )
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`step-content-default ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`footer-container ${footerClassName}`}>
            <div className={`footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
              {currentStep !== 1 && (
                <button
                  onClick={handleBack}
                  className={`back-button ${currentStep === 1 ? 'inactive' : ''}`}
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button onClick={isLastStep ? handleComplete : handleNext} className="next-button" {...nextButtonProps}>
                {isLastStep ? 'Complete' : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function useReveal(threshold = 0.1) {
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

function Reveal({ as: Tag = 'div', delay = 0, className = '', style = {}, children, scale = false }) {
  const [ref, visible] = useReveal()
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
        transform: visible ? 'none' : `translateY(24px) scale(${scale ? 0.96 : 1})`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}

export default function AboutUs() {
  const [heroIn, setHeroIn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 60)
    return () => clearTimeout(t)
  }, [])

  const values = [
    { title: 'Integrity', text: 'We conduct ourselves with honesty, transparency and professional independence. We believe trust is earned through consistent actions and accountability.' },
    { title: 'Professional Excellence', text: 'We are committed to maintaining high professional standards and delivering technically sound, reliable and commercially relevant advice.' },
    { title: 'Client Focus', text: "Every client is different. We take the time to understand our clients' businesses, objectives and challenges so that our services are relevant to their individual circumstances." },
    { title: 'Innovation', text: 'The accounting and business environment is constantly changing. We embrace technology, new ideas and improved processes to deliver more efficient and effective solutions.' },
    { title: 'Accountability', text: 'We take responsibility for the quality of our work, our advice and our commitments to clients.' },
    { title: 'Partnership', text: 'We aim to build long-term relationships rather than transactional engagements. Our role is to work alongside our clients as trusted professional advisers.' },
    { title: 'Excellence in Service', text: 'Professional expertise means little without exceptional service. We strive to be responsive, accessible and proactive in everything we do.' },
  ]

  const whyNCM = [
    { title: '40+ Years of Heritage', text: 'Our four decades of experience provide a strong foundation of professional knowledge and institutional experience.' },
    { title: 'Chartered Accounting & Audit Expertise', text: 'Our professional offering brings together accounting, auditing, taxation, advisory and related services.' },
    { title: 'One Integrated Practice', text: 'Clients can access a broad range of professional and business support services through one trusted professional firm.' },
    { title: 'Practical Advice', text: 'We focus on providing advice that can be understood, implemented and used to support better business decisions.' },
    { title: 'Modern Technology', text: 'We are embracing digital systems and technology to improve efficiency, reporting, communication and service delivery.' },
    { title: 'Personalised Service', text: 'We believe professional services should remain personal. Our clients are more than numbers on a system.' },
    { title: 'Long-Term Relationships', text: 'Our objective is to develop relationships that extend beyond individual engagements and become long-term professional partnerships.' },
    { title: 'Business-Focused Thinking', text: 'We look beyond compliance to understand the commercial realities affecting our clients and their businesses.' },
  ]

  const leadership = [
    'Professional accountability',
    'Technical excellence',
    'Ethical leadership',
    'Client-focused decision-making',
    'Continuous improvement',
    'Innovation and technology',
    'Strong governance',
    'Long-term value creation',
  ]

  return (
    <div className="text-black overflow-x-hidden">
      <style>{`
        .card-spotlight {
          position: relative;
          overflow: hidden;
          --mouse-x: 50%;
          --mouse-y: 50%;
          --spotlight-color: rgba(20, 184, 166, 0.28);
        }
        .card-spotlight::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 75%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .card-spotlight:hover::before,
        .card-spotlight:focus-within::before {
          opacity: 1;
        }
        .outer-container {
          display: flex;
          min-height: 100%;
          flex: 1 1 0%;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .step-circle-container {
          margin-left: auto;
          margin-right: auto;
          width: 100%;
          max-width: 32rem;
          border-radius: 1.5rem;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03);
        }
        .step-indicator-row {
          display: flex;
          width: 100%;
          align-items: center;
          padding: 2rem;
        }
        .step-content-default {
          position: relative;
          overflow: hidden;
        }
        .step-default {
          padding-left: 2rem;
          padding-right: 2rem;
        }
        .footer-container {
          padding-left: 2rem;
          padding-right: 2rem;
          padding-bottom: 2rem;
        }
        .footer-nav {
          margin-top: 2rem;
          display: flex;
        }
        .footer-nav.spread { justify-content: space-between; }
        .footer-nav.end { justify-content: flex-end; }
        .back-button {
          transition: all 350ms;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          color: #a3a3a3;
          cursor: pointer;
        }
        .back-button:hover { color: #0f766e; }
        .back-button.inactive { pointer-events: none; opacity: 0.5; color: #a3a3a3; }
        .next-button {
          transition: all 350ms;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          background-color: #0f766e;
          color: #fff;
          font-weight: 500;
          letter-spacing: -0.025em;
          padding: 0.5rem 1.1rem;
          cursor: pointer;
        }
        .next-button:hover { background-color: #0d5c55; }
        .step-indicator { position: relative; cursor: pointer; outline: none; }
        .step-indicator-inner {
          display: flex;
          height: 2rem;
          width: 2rem;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          font-weight: 600;
        }
        .active-dot { height: 0.75rem; width: 0.75rem; border-radius: 9999px; background-color: #fff; }
        .step-number { font-size: 0.875rem; }
        .step-connector {
          position: relative;
          margin-left: 0.5rem;
          margin-right: 0.5rem;
          height: 0.125rem;
          flex: 1;
          overflow: hidden;
          border-radius: 0.25rem;
          background-color: #e6f2f0;
        }
        .step-connector-inner { position: absolute; left: 0; top: 0; height: 100%; }
        .check-icon { height: 1rem; width: 1rem; color: #fff; }
      `}</style>

      <section className="relative bg-black text-white px-6 sm:px-8 py-20 sm:py-24 text-center overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <LightTunnel
            cableColor="#14b8a6"
            pulseColor="#5eead4"
            tunnelColor="#0f766e"
            tunnelOpacity={0}
            speed={0.025}
            flowDirection="outward"
            pulseSpeed={0.6}
            pulseLength={0.28}
            pulseBlend={1}
            pulseWidth={1}
            cableCount={16}
            thickness={0.3}
            rimWidth={0.12}
            waviness={0.2}
            sway={0.3}
            size={0.9}
            centerX={0}
            centerY={0}
            glow={0.6}
            fadeNear={0.85}
            fadeFar={1.6}
            brightness={0.65}
            colorVariance
            grain
            grainIntensity={0.05}
            opacity={0.45}
            mouseInteraction
            mouseStrength={0.06}
          />
        </div>
        <div className="relative">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transition-all duration-700 ease-out"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateY(16px)' }}
          >
            About NCM Inc
          </h1>
          <p
            className="text-lg md:text-xl text-gray-300 transition-all duration-700 ease-out"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateY(16px)', transitionDelay: '120ms' }}
          >
            A Legacy of Excellence. A Future of Innovation.
          </p>
          <p
            className="max-w-2xl mx-auto mt-6 text-gray-300 transition-all duration-700 ease-out"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateY(16px)', transitionDelay: '220ms' }}
          >
            For more than 40 years, NCM Inc Chartered Accountants (SA) &amp; Registered Auditors
            has been serving the South African business community with professionalism,
            integrity and a commitment to excellence.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--ncm-teal)' }}>
          Our Story
        </Reveal>
        <Reveal delay={60} as="h3" className="text-lg sm:text-xl font-semibold mb-6">
          Four Decades of Professional Excellence
        </Reveal>
        <Reveal delay={100} className="mb-4 text-gray-700">
          NCM Inc's story is one of resilience, opportunity, professional excellence and
          continuous evolution. Established more than four decades ago, NCM Inc was among
          South Africa's pioneering Chartered Accounting practices, developing a reputation
          for professional service, technical expertise and trusted client relationships.
        </Reveal>
        <Reveal delay={160} className="mb-4 text-gray-700">
          Over the years, NCM Inc has supported businesses, entrepreneurs, families and
          communities through changing economic conditions, evolving legislation and an
          increasingly complex regulatory environment.
        </Reveal>
        <Reveal delay={220} className="mb-8 text-gray-700">
          Today, NCM Inc has entered a new chapter under new management, preserving the
          professional values and reputation developed over more than 40 years while
          introducing modern systems, technology, expanded service offerings and a renewed
          focus on client experience.
        </Reveal>
        <Reveal delay={280}>
          <blockquote className="border-l-4 pl-6 italic text-gray-800" style={{ borderColor: 'var(--ncm-teal)' }}>
            Our heritage gives us experience.<br />
            Our people give us expertise.<br />
            Our technology gives us agility.<br />
            Our clients give us purpose.
          </blockquote>
        </Reveal>
      </section>

      <section className="px-6 sm:px-8 py-16" style={{ backgroundColor: '#f0f7f6' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: 'var(--ncm-teal)' }}>
            Our Values
          </Reveal>
          <Reveal delay={60} className="text-center text-gray-600 mb-10">
            What Guides Everything We Do
          </Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 3) * 90} scale className="h-full">
                <SpotlightCard
                  className="h-full bg-white p-6 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  spotlightColor="rgba(20, 184, 166, 0.22)"
                >
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ncm-black)' }}>{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.text}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--ncm-teal)' }}>
          Our Leadership
        </Reveal>
        <Reveal delay={60} as="h3" className="text-lg sm:text-xl font-semibold mb-6">
          Experienced Professionals. Forward-Thinking Leadership.
        </Reveal>
        <Reveal delay={100} className="mb-6 text-gray-700">
          NCM Inc is led by a team committed to combining professional expertise, commercial
          understanding and modern thinking. Under the firm's new management, NCM Inc is
          focused on creating a professional practice that is responsive to the changing
          needs of businesses and individuals.
        </Reveal>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
          {leadership.map((item, i) => (
            <Reveal key={item} delay={140 + (i % 4) * 60} className="flex items-center gap-2 text-gray-700">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--ncm-teal)' }}
              />
              {item}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 sm:px-8 py-16 text-white" style={{ backgroundColor: '#08201d' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: '#5eead4' }}>
            Why NCM
          </Reveal>
          <Reveal delay={60} className="text-center mb-10" style={{ color: '#cdeae6' }}>
            More Than Compliance. A Professional Partner.
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {whyNCM.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 100} scale className="h-full">
                <SpotlightCard
                  className="h-full p-5 rounded-lg transition-all duration-300 hover:-translate-y-1"
                  spotlightColor="rgba(94, 234, 212, 0.16)"
                >
                  <h3 className="font-semibold mb-2" style={{ color: '#5eead4' }}>{w.title}</h3>
                  <p className="text-sm" style={{ color: '#d4e8e5' }}>{w.text}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto text-center">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-10" style={{ color: 'var(--ncm-teal)' }}>
          Our Approach
        </Reveal>
        <Reveal scale>
          <Stepper
            initialStep={1}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            <Step>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--ncm-black)' }}>Understand</h3>
              <p className="text-gray-600 text-sm">
                We take the time to understand our clients, their businesses, their financial
                position and their objectives.
              </p>
            </Step>
            <Step>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--ncm-black)' }}>Advise</h3>
              <p className="text-gray-600 text-sm">
                We provide professional advice based on technical expertise, commercial
                understanding and the specific circumstances of each client.
              </p>
            </Step>
            <Step>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--ncm-black)' }}>Support</h3>
              <p className="text-gray-600 text-sm">
                We remain alongside our clients as their businesses evolve, providing ongoing
                professional support as new opportunities and challenges arise.
              </p>
            </Step>
          </Stepper>
        </Reveal>
      </section>

      <section className="px-6 sm:px-8 py-16 max-w-4xl mx-auto text-center">
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--ncm-teal)' }}>
          Building the Future
        </Reveal>
        <Reveal delay={60} as="h3" className="text-lg sm:text-xl font-semibold mb-6">
          Our Legacy Is Our Foundation. Our Future Is Our Opportunity.
        </Reveal>
        <Reveal delay={100} className="mb-4 text-gray-700">
          NCM Inc is proud of its history. More than four decades of professional service
          have created a foundation of experience, relationships and knowledge that we
          intend to carry forward.
        </Reveal>
        <Reveal delay={160} className="mb-4 text-gray-700">
          But we also recognise that the professional services environment is changing
          rapidly. Technology, regulation, globalisation and changing client expectations
          are reshaping the way businesses operate. NCM Inc is responding to that change.
        </Reveal>
        <Reveal delay={220} className="mb-4 text-gray-700">
          We are investing in people, technology, systems and service capabilities to
          create a professional practice that is modern, responsive and future-focused.
        </Reveal>
        <Reveal delay={280} className="font-semibold text-gray-800">
          Our ambition is not simply to continue the NCM Inc story. It is to build its next chapter.
        </Reveal>
      </section>

      <section className="px-6 sm:px-8 py-16 text-center text-white" style={{ backgroundColor: 'var(--ncm-teal)' }}>
        <Reveal as="h2" className="text-2xl sm:text-3xl font-bold mb-2">
          Our Promise
        </Reveal>
        <Reveal delay={60} className="text-lg mb-6">
          Trusted Advice. Smart Solutions. Stronger Businesses.
        </Reveal>
        <Reveal delay={120} className="max-w-2xl mx-auto mb-2">
          Whether you are an established corporation, growing business, entrepreneur, family,
          trust or individual, we are committed to providing professional solutions tailored
          to your needs.
        </Reveal>
        <Reveal delay={180}>
          <Link
            to="/contact"
            className="inline-block mt-8 px-6 py-3 rounded-md font-semibold bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            style={{ color: 'var(--ncm-teal)' }}
          >
            Get in Touch
          </Link>
        </Reveal>
        <Reveal delay={240} className="font-semibold mt-8">
          NCM Inc Chartered Accountants (SA) &amp; Registered Auditors
        </Reveal>
        <Reveal delay={280} className="text-sm text-gray-100">
          A Legacy of Excellence. A Future of Innovation.
        </Reveal>
      </section>
    </div>
  )
}