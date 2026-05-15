'use client'

import { useEffect, useRef } from 'react'

interface ParticleEffectProps {
  type: 'sakura' | 'rain' | 'starlight'
}

interface Particle {
  x: number
  y: number
  speed: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
  drift: number
}

const PARTICLE_COUNT = 40

export default function ParticleEffect({ type }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticle = (randomY = true): Particle => {
      const base = {
        x: Math.random() * canvas.width,
        y: randomY ? Math.random() * canvas.height : -20,
        rotation: Math.random() * Math.PI * 2,
      }

      switch (type) {
        case 'sakura':
          return {
            ...base,
            speed: 0.4 + Math.random() * 0.8,
            rotationSpeed: (Math.random() - 0.5) * 0.03,
            size: 6 + Math.random() * 8,
            opacity: 0.5 + Math.random() * 0.4,
            drift: (Math.random() - 0.5) * 0.6,
          }
        case 'rain':
          return {
            ...base,
            speed: 4 + Math.random() * 6,
            rotationSpeed: 0,
            size: 1 + Math.random() * 1.5,
            opacity: 0.3 + Math.random() * 0.4,
            drift: 0,
          }
        case 'starlight':
          return {
            ...base,
            speed: 0.15 + Math.random() * 0.3,
            rotationSpeed: 0,
            size: 1 + Math.random() * 2.5,
            opacity: 0.3 + Math.random() * 0.7,
            drift: (Math.random() - 0.5) * 0.3,
          }
      }
    }

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle())
    }

    const drawSakura = (p: Particle) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.opacity

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
      gradient.addColorStop(0, '#fbbfca')
      gradient.addColorStop(0.5, '#f472b6')
      gradient.addColorStop(1, '#ec4899')
      ctx.fillStyle = gradient

      // Draw petal shape
      ctx.beginPath()
      ctx.ellipse(0, -p.size * 0.3, p.size * 0.35, p.size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(p.size * 0.3, p.size * 0.2, p.size * 0.35, p.size * 0.55, Math.PI / 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(-p.size * 0.3, p.size * 0.2, p.size * 0.35, p.size * 0.55, -Math.PI / 3, 0, Math.PI * 2)
      ctx.fill()

      // Center dot
      ctx.fillStyle = '#fce7f3'
      ctx.beginPath()
      ctx.arc(0, 0, p.size * 0.15, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawRain = (p: Particle) => {
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = p.size
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - 1, p.y + 12)
      ctx.stroke()
      ctx.restore()
    }

    const drawStarlight = (p: Particle) => {
      ctx.save()
      ctx.globalAlpha = p.opacity

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
      gradient.addColorStop(0, '#fef08a')
      gradient.addColorStop(0.3, '#fde047')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.fillStyle = '#fef9c3'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.y += p.speed
        p.x += p.drift
        p.rotation += p.rotationSpeed

        if (type === 'starlight') {
          p.opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 + p.x)) * 0.6
        }

        // Reset when out of bounds
        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas.width
          if (type === 'starlight') {
            p.x = Math.random() * canvas.width
          }
        }
        if (p.x > canvas.width + 20) p.x = -20
        if (p.x < -20) p.x = canvas.width + 20

        switch (type) {
          case 'sakura':
            drawSakura(p)
            break
          case 'rain':
            drawRain(p)
            break
          case 'starlight':
            drawStarlight(p)
            break
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    initParticles()
    animate()

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none"
      aria-hidden="true"
    />
  )
}
