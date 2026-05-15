'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import type { Anime, Scene } from '@/lib/types'

function RingScene({
  scene,
  index,
  total,
  radius,
  rotationSpring,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: {
  scene: Scene
  index: number
  total: number
  radius: number
  rotationSpring: import('framer-motion').MotionValue<number>
  isHovered: boolean
  isSelected: boolean
  onHover: (id: string | null) => void
  onClick: (id: string) => void
}) {
  const counterRotate = useTransform(rotationSpring, (v) => -v)
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius

  return (
    <motion.div
      className="absolute"
      style={{ x, y, rotate: counterRotate, zIndex: isHovered || isSelected ? 50 : 1 }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: isHovered || isSelected ? 1.18 : 1 }}
      transition={{
        opacity: { delay: index * 0.06, duration: 0.35, ease: 'easeOut' },
        scale: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      onMouseEnter={() => onHover(scene.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(scene.id)}
    >
      <div
        className="relative w-[110px] h-[150px] rounded-xl overflow-hidden
                   ring-1 ring-white/10 shadow-xl shadow-black/50
                   cursor-pointer select-none
                   transition-shadow duration-300 group/card"
        style={{
          boxShadow: isHovered || isSelected
            ? `0 0 30px rgba(255,255,255,0.15), 0 8px 30px rgba(0,0,0,0.6)`
            : undefined,
        }}
      >
        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${scene.image_url})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/80 ring-1 ring-white/10">
          EP{scene.episode}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-1 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
          <p className="text-[11px] font-semibold text-white leading-tight line-clamp-2 text-center">{scene.title}</p>
        </div>
        <div className={`absolute inset-0 rounded-xl ring-2 transition-opacity duration-300 pointer-events-none ${isHovered || isSelected ? 'ring-white/40 opacity-100' : 'ring-white/0 opacity-0'}`} />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 rounded-xl ring-2 ring-primary/60" />
        )}
      </div>
    </motion.div>
  )
}

interface DiscTimelineProps {
  anime: Anime
  scenes: Scene[]
}

export default function DiscTimeline({ anime, scenes }: DiscTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  const [radius, setRadius] = useState(220)
  const [hoveredSceneId, setHoveredSceneId] = useState<string | null>(null)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)

  const rotationSpring = useSpring(rotation, { stiffness: 80, damping: 28, mass: 0.5 })

  const selectedScene = selectedSceneId ? scenes.find((s) => s.id === selectedSceneId) : null

  const updateSize = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setRadius(Math.min(rect.width, rect.height) * 0.34)
  }, [])

  useEffect(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [updateSize])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    setRotation((prev) => prev + e.deltaY * 0.35)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleSceneClick = (id: string) => {
    setSelectedSceneId((prev) => (prev === id ? null : id))
  }

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3">
        <p className="text-muted-foreground text-lg">暂无场景数据</p>
        <p className="text-muted-foreground/60 text-sm">该番剧还没有收录场景</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-zinc-950">
      {/* Decorative ring track */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="rounded-full border border-white/[0.04]" style={{ width: radius * 2, height: radius * 2 }} />
      </div>

      {/* Rotating ring + scene cards */}
      <div className="absolute top-1/2 left-1/2">
        <motion.div style={{ rotate: rotationSpring }}>
          {scenes.map((scene, i) => (
            <RingScene
              key={scene.id}
              scene={scene}
              index={i}
              total={scenes.length}
              radius={radius}
              rotationSpring={rotationSpring}
              isHovered={hoveredSceneId === scene.id}
              isSelected={selectedSceneId === scene.id}
              onHover={setHoveredSceneId}
              onClick={handleSceneClick}
            />
          ))}
        </motion.div>
      </div>

      {/* Center card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <motion.div
          className="bg-zinc-900/85 backdrop-blur-xl rounded-2xl px-6 py-5 shadow-2xl ring-1 ring-white/10 text-center max-w-[240px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        >
          <div className="h-1 rounded-full mb-3 mx-8" style={{ backgroundColor: anime.primary_color || '#6366f1' }} />
          <h1 className="text-xl font-bold text-white mb-1.5 leading-tight">{anime.title}</h1>
          {anime.episode_count != null && <p className="text-xs text-white/40 mb-2">全 {anime.episode_count} 集</p>}
          {anime.description && <p className="text-xs text-white/55 mb-3 leading-relaxed max-w-[200px] mx-auto">{anime.description}</p>}
          <div className="flex flex-wrap justify-center gap-1">
            {anime.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.06] text-white/65 ring-1 ring-white/[0.06]">{tag}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Preview panel */}
      <AnimatePresence>
        {selectedScene && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg"
          >
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mx-4 shadow-2xl">
              <img
                src={selectedScene.image_url}
                alt={selectedScene.title}
                className="w-full h-48 object-cover rounded-xl mb-4 ring-1 ring-white/10"
              />
              <h3 className="text-lg font-bold text-white mb-1">{selectedScene.title}</h3>
              <p className="text-sm text-white/50 mb-1">第{selectedScene.episode}集</p>
              {selectedScene.quote && (
                <p className="text-sm italic text-purple-300 border-l-2 border-purple-500 pl-3 mb-4">
                  &ldquo;{selectedScene.quote}&rdquo;
                </p>
              )}
              <div className="flex gap-2">
                <Link href={`/anime/${selectedScene.anime_id}/scene/${selectedScene.id}`} className="flex-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
                  >
                    进入场景
                  </motion.button>
                </Link>
                <button
                  onClick={() => setSelectedSceneId(null)}
                  className="px-5 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-sm text-white/70 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/25 text-xs pointer-events-none select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-bounce">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l2 2" />
        </svg>
        <span>滚动鼠标滚轮旋转圆盘 · 点击场景查看详情</span>
      </motion.div>
    </div>
  )
}
