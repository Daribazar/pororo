"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { ChevronDown } from "lucide-react"

// Window light positions (approximate building window locations)
const windowLights = [
  { x: 38, y: 72 }, { x: 42, y: 72 }, { x: 46, y: 72 }, { x: 50, y: 72 },
  { x: 54, y: 72 }, { x: 58, y: 72 }, { x: 62, y: 72 },
  { x: 40, y: 78 }, { x: 48, y: 78 }, { x: 52, y: 78 }, { x: 56, y: 78 }, { x: 60, y: 78 },
  { x: 44, y: 84 }, { x: 50, y: 84 }, { x: 56, y: 84 },
]

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; dur: number; delay: number }[]>([])
  const [streaks, setStreaks] = useState<{ id: number; x: number; y: number; dur: number; delay: number }[]>([])
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isInLowerSection, setIsInLowerSection] = useState(false)
  const [domeHovered, setDomeHovered] = useState(false)
  const [burstParticles, setBurstParticles] = useState<{ id: number; angle: number; distance: number }[]>([])
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [statsInView, setStatsInView] = useState(false)
  const [statValues, setStatValues] = useState({ students: 0, teachers: 0, committees: 0, passed: 0 })

  // Mouse parallax springs
  const springConfig = { stiffness: 80, damping: 20, mass: 1 }
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  // Parallax transforms for different layers
  const bgX = useTransform(smoothMouseX, [-1, 1], [-12, 12])
  const bgY = useTransform(smoothMouseY, [-1, 1], [-8, 8])
  const domeX = useTransform(smoothMouseX, [-1, 1], [-25, 25])
  const domeY = useTransform(smoothMouseY, [-1, 1], [-18, 18])
  const starsX = useTransform(smoothMouseX, [-1, 1], [8, -8])
  const starsY = useTransform(smoothMouseY, [-1, 1], [5, -5])
  const svgX = useTransform(smoothMouseX, [-1, 1], [-18, 18])
  const svgY = useTransform(smoothMouseY, [-1, 1], [-12, 12])
  const emblemX = useTransform(smoothMouseX, [-1, 1], [-6, 6])
  const emblemY = useTransform(smoothMouseY, [-1, 1], [-4, 4])

  // Headline magnetic effect
  const headlineX = useTransform(smoothMouseX, [-1, 1], [-8, 8])
  const headlineY = useTransform(smoothMouseY, [-1, 1], [-5, 5])

  // Check for mobile
  useEffect(() => {
    setIsMobile("ontouchstart" in window)
  }, [])

  // Generate stars and streaks
  useEffect(() => {
    const newStars = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      dur: 2 + Math.random() * 3,
      delay: Math.random() * 6,
    }))
    setStars(newStars)

    const newStreaks = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      dur: 6 + Math.random() * 4,
      delay: Math.random() * 10,
    }))
    setStreaks(newStreaks)
  }, [])

  // Stats count-up animation
  useEffect(() => {
    if (!statsInView) return

    const targets = { students: 847, teachers: 35, committees: 9, passed: 92 }
    const duration = 2000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic

      setStatValues({
        students: Math.floor(eased * targets.students),
        teachers: Math.floor(eased * targets.teachers),
        committees: Math.floor(eased * targets.committees),
        passed: Math.floor(eased * targets.passed),
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [statsInView])

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile) return

      const rect = heroRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      mouseX.set(x)
      mouseY.set(y)

      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })

      // Check if in lower 60% of hero
      const relativeY = (e.clientY - rect.top) / rect.height
      setIsInLowerSection(relativeY > 0.4)
    },
    [isMobile, mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsInLowerSection(false)
  }, [mouseX, mouseY])

  // Dome hover handlers
  const handleDomeEnter = () => {
    setDomeHovered(true)
    // Spawn burst particles
    const particles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: i * 45,
      distance: 60 + Math.random() * 40,
    }))
    setBurstParticles(particles)
    setTimeout(() => setBurstParticles([]), 1000)
  }

  const handleDomeLeave = () => {
    setDomeHovered(false)
  }

  // Button ripple effect
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    setRipples((prev) => [...prev, ripple])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 600)
  }

  const stats = [
    { value: statValues.students, label: "Нийт оюутан" },
    { value: statValues.teachers, label: "Багш нар" },
    { value: statValues.committees, label: "Комисс" },
    { value: statValues.passed, label: "Тэнцсэн %", suffix: "%" },
  ]

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: "url(/over.jpg)",
          x: bgX,
          y: bgY,
          scale: 1.05,
        }}
      />

      {/* Overlay Layers */}
      <div className="pointer-events-none absolute inset-0 bg-black/50" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center bottom, rgba(10,40,120,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,5,20,0.85) 100%)",
        }}
      />

      {/* Stars Layer with Parallax */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 will-change-transform"
        style={{ x: starsX, y: starsY }}
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="star absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              "--dur": `${star.dur}s`,
              "--delay": `${star.delay}s`,
            } as React.CSSProperties}
          />
        ))}
        {streaks.map((streak) => (
          <div
            key={streak.id}
            className="streak absolute h-px w-24"
            style={{
              left: `${streak.x}%`,
              top: `${streak.y}%`,
              background: "linear-gradient(90deg, transparent, rgba(180,210,255,0.8), transparent)",
              "--dur": `${streak.dur}s`,
              "--delay": `${streak.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </motion.div>

      {/* Scan Line */}
      <div
        className="pointer-events-none absolute left-0 right-0 h-px bg-blue-300/25"
        style={{ animation: "scan-line 5s linear infinite" }}
      />

      {/* Cursor Glow */}
      {!isMobile && cursorPos.x > 0 && (
        <div
          className="pointer-events-none absolute z-50"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(80,160,255,0.12) 0%, rgba(80,160,255,0.04) 40%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Building Spotlight (when in lower section) */}
      {isInLowerSection && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(circle 200px at ${cursorPos.x}px ${cursorPos.y}px, rgba(255,220,100,0.12), transparent)`,
          }}
        />
      )}

      {/* Window Lights */}
      {windowLights.map((light, i) => {
        const dx = cursorPos.x - (light.x / 100) * (heroRef.current?.offsetWidth || 1)
        const dy = cursorPos.y - (light.y / 100) * (heroRef.current?.offsetHeight || 1)
        const distance = Math.sqrt(dx * dx + dy * dy)
        const isNear = distance < 80

        return (
          <div
            key={i}
            className="pointer-events-none absolute z-10 rounded-full bg-amber-300/60 transition-all duration-300"
            style={{
              left: `${light.x}%`,
              top: `${light.y}%`,
              width: 4,
              height: 4,
              opacity: isNear ? 1 : 0.2,
              boxShadow: isNear ? "0 0 8px rgba(255,200,80,0.8)" : "none",
            }}
          />
        )
      })}

      {/* Dome Glow Area with Parallax */}
      <motion.div
        className="pointer-events-none absolute z-[1] will-change-transform"
        style={{
          top: "8%",
          left: "50%",
          x: domeX,
          y: domeY,
          translateX: "-50%",
        }}
        onMouseEnter={handleDomeEnter}
        onMouseLeave={handleDomeLeave}
      >
        {/* Interactive hover area */}
        <div
          className="pointer-events-auto absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          onMouseEnter={handleDomeEnter}
          onMouseLeave={handleDomeLeave}
        />

        {/* Main Dome Glow */}
        <motion.div
          className="h-[180px] w-[280px]"
          style={{
            background: "radial-gradient(ellipse, rgba(80,160,255,0.35) 0%, transparent 70%)",
          }}
          animate={{
            scale: domeHovered ? 2.5 : 1,
            opacity: domeHovered ? 0.9 : 0.25,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Rotating Rays */}
        <div
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(rgba(100,180,255,0.06) 0deg, transparent 30deg, rgba(100,180,255,0.06) 60deg, transparent 90deg, rgba(100,180,255,0.06) 120deg, transparent 150deg, rgba(100,180,255,0.06) 180deg, transparent 210deg, rgba(100,180,255,0.06) 240deg, transparent 270deg, rgba(100,180,255,0.06) 300deg, transparent 330deg)",
            animation: "ray-rotate 20s linear infinite",
          }}
        />

        {/* Floating Orb */}
        <div
          className="absolute left-1/2 top-1/2 h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(120,200,255,0.7), rgba(60,120,255,0.2))",
            animation: "orb-float 3s ease-in-out infinite",
          }}
        />

        {/* Burst Particles */}
        {burstParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-blue-300"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
              y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </motion.div>

      {/* SVG Connector Lines with Parallax */}
      <motion.svg
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full will-change-transform"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        style={{ x: svgX, y: svgY }}
      >
        {/* Lines from dome center to edges */}
        {[
          { x: 0, y: 0 },
          { x: 1200, y: 0 },
          { x: 0, y: 700 },
          { x: 1200, y: 700 },
          { x: 600, y: 0 },
          { x: 600, y: 700 },
        ].map((end, i) => (
          <line
            key={i}
            x1={600}
            y1={155}
            x2={end.x}
            y2={end.y}
            stroke="rgba(100,180,255,0.12)"
            strokeWidth={0.8}
          />
        ))}

        {/* Animated dots at endpoints */}
        {[
          { x: 0, y: 0 },
          { x: 1200, y: 0 },
          { x: 0, y: 700 },
          { x: 1200, y: 700 },
          { x: 600, y: 0 },
          { x: 600, y: 700 },
        ].map((pos, i) => (
          <motion.circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={4}
            fill="rgba(100,200,255,0.6)"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
          />
        ))}

        {/* Dome ellipse */}
        <motion.ellipse
          cx={600}
          cy={155}
          rx={55}
          ry={30}
          animate={{
            fill: ["rgba(100,200,255,0.1)", "rgba(100,200,255,0.5)", "rgba(100,200,255,0.1)"],
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      </motion.svg>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-32 pt-20">
        {/* Emblem with Parallax */}
        <motion.div
          className="relative z-10 mb-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ x: emblemX, y: emblemY }}
        >
          {/* Pulse Rings */}
          {[0, 0.9, 1.8].map((delay, i) => (
            <div
              key={i}
              className="absolute h-24 w-24 rounded-full"
              style={{
                border: "2px solid rgba(100,180,255,0.5)",
                animation: `pulse-ring ${domeHovered ? "1.2s" : "2.8s"} ease-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}

          {/* Center Circle */}
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: "rgba(5,20,60,0.9)",
              border: "2px solid rgba(100,180,255,0.8)",
              animation: "glow-emblem 3s ease-in-out infinite",
            }}
            animate={{
              boxShadow: domeHovered
                ? "0 0 100px rgba(80,160,255,1)"
                : "0 0 25px rgba(80,160,255,0.4), 0 0 60px rgba(80,160,255,0.15)",
            }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-medium tracking-widest text-blue-300">МУИС</span>
          </motion.div>
        </motion.div>

        {/* Headline with Magnetic Effect */}
        <motion.h1
          className="mb-6 text-center text-5xl font-medium leading-[1.15] tracking-tight text-white md:text-7xl"
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ x: headlineX, y: headlineY }}
        >
          <span className="text-balance">Дипломын Ажлын</span>
          <br />
          <span className="shimmer-text text-balance">Хамгаалалтын Систем</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mb-12 text-center text-base font-light tracking-widest text-blue-200/80 md:text-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65 }}
        >
          Монгол Улсын Их Сургууль · 2026 оны хаврын улирал
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.95 }}
        >
          <motion.button
            className="liquid-glass relative overflow-hidden rounded-full bg-blue-600/60 px-8 py-3.5 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onMouseDown={handleButtonClick}
          >
            Статистик харах
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute rounded-full bg-white/30"
                style={{ left: ripple.x, top: ripple.y }}
                initial={{ scale: 0, opacity: 0.4, width: 10, height: 10, x: -5, y: -5 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            ))}
          </motion.button>

        </motion.div>
      </div>

      {/* Floating Badge */}
      <motion.div
        className="liquid-glass absolute right-8 top-8 z-20 rounded-2xl bg-blue-950/60 px-5 py-3"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        style={{ animation: "float-badge 3s ease-in-out infinite" }}
      >
        <div className="text-xs tracking-widest text-blue-300">ХАКАТОН 2026</div>
        <div className="text-[10px] text-white/60">Дипломын хамгаалалт</div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        <ChevronDown className="h-6 w-6 text-white/50" />
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="liquid-glass absolute bottom-0 left-0 right-0 z-20 border-t border-blue-400/20 bg-black/50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onViewportEnter={() => setStatsInView(true)}
      >
        <div className="mx-auto grid max-w-4xl grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="relative cursor-default px-6 py-4 text-center transition-all duration-300"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(100,180,255,0.08)",
              }}
            >
              <motion.div
                className="text-2xl font-semibold text-blue-300 transition-colors duration-300 md:text-3xl"
                whileHover={{ color: "#ffffff" }}
              >
                {stat.value}
                {stat.suffix}
              </motion.div>
              <div className="text-xs text-white/60 md:text-sm">{stat.label}</div>
              <motion.div
                className="absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-blue-400"
                initial={{ width: 0 }}
                whileHover={{ width: "80%" }}
                transition={{ duration: 0.25 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
