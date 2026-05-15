'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Tag } from 'lucide-react'
import SceneToolbar from '@/components/SceneToolbar'
import ParticleEffect from '@/components/ParticleEffect'
import ParallaxScene from '@/components/ParallaxScene'

interface ScenePageClientProps {
  animeId: string
  sceneId: string
}

// Mock scene data for demonstration
function getMockSceneData(animeId: string, sceneId: string) {
  const sceneIndex = parseInt(sceneId.replace(`s${animeId}-`, ''), 10) || 1

  const animeTitles: Record<string, string> = {
    '1': '进击的巨人',
    '2': '紫罗兰永恒花园',
    '3': '辉夜大小姐想让我告白',
  }

  const animeColors: Record<string, string> = {
    '1': '#8b1a1a',
    '2': '#7c3aed',
    '3': '#db2777',
  }

  const quotes: Record<string, string> = {
    's1-1': '那一天，人类回想起了受他们支配的恐惧',
    's1-5': '什么都无法舍弃的人，什么都无法改变',
    's2-1': '我想知道「我爱你」的含义',
    's2-4': '你已不再是工具，而是人如其名的人',
    's3-8': '月色真美',
  }

  const tags: Record<string, string[]> = {
    '1': ['热血', '战斗', '史诗'],
    '2': ['治愈', '催泪', '文艺'],
    '3': ['恋爱', '搞笑', '校园'],
  }

  const titles: Record<string, string> = {
    's1-1': '致两千年后的你',
    's1-2': '那一天',
    's1-5': '初阵',
    's2-1': '「我爱你」与自动手记人偶',
    's2-4': '你已不再是工具，而是人如其名的人',
    's3-1': '想让对方告白的恋爱头脑战',
    's3-8': '烟花之夜的奇迹',
  }

  // Use placeholder images that work well as parallax layers
  const seed = sceneId
  const layers = {
    bg: `https://picsum.photos/seed/${seed}-bg/1200/675`,
    mg: `https://picsum.photos/seed/${seed}-mg/1200/675`,
    fg: `https://picsum.photos/seed/${seed}-fg/1200/675`,
  }

  return {
    id: sceneId,
    anime_id: animeId,
    episode: sceneIndex,
    title: titles[sceneId] ?? `场景 ${sceneIndex}`,
    image_url: `https://picsum.photos/seed/${seed}/1920/1080`,
    quote: quotes[sceneId] ?? undefined,
    anime_title: animeTitles[animeId] ?? '未知番剧',
    primary_color: animeColors[animeId] ?? '#6366f1',
    tags: tags[animeId] ?? [],
    layers,
    likes_count: 80 + Math.floor(Math.random() * 200),
    status: 'approved' as const,
    created_at: '2024-06-01',
  }
}

export default function ScenePageClient({ animeId, sceneId }: ScenePageClientProps) {
  const [mode, setMode] = useState<'2d' | '2.5d'>('2d')
  const [showQuote, setShowQuote] = useState(true)
  const [liked, setLiked] = useState(false)

  const scene = getMockSceneData(animeId, sceneId)

  const handleToggleMode = () => {
    setMode((prev) => (prev === '2d' ? '2.5d' : '2d'))
  }

  const handleLike = () => {
    setLiked((prev) => !prev)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* ================================================================ */}
      {/* 2D Mode: Full-viewport image with overlays                        */}
      {/* ================================================================ */}
      <AnimatePresence mode="wait">
        {mode === '2d' && (
          <motion.div
            key="2d"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Scene image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${scene.image_url})` }}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

            {/* Sakura particle effect */}
            <ParticleEffect type="sakura" />

            {/* Quote / caption overlay */}
            <AnimatePresence>
              {showQuote && scene.quote && (
                <motion.div
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  <p
                    className="text-2xl md:text-3xl font-serif italic text-white/90 leading-relaxed
                              drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                  >
                    「{scene.quote}」
                  </p>
                  <div
                    className="mt-3 mx-auto h-0.5 w-16 rounded-full"
                    style={{ backgroundColor: scene.primary_color }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* 2.5D Mode: Three.js parallax scene                               */}
        {/* ================================================================ */}
        {mode === '2.5d' && (
          <motion.div
            key="2.5d"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ParallaxScene layers={scene.layers} />

            {/* Overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

            {/* Starlight particles */}
            <ParticleEffect type="starlight" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* SceneToolbar                                                      */}
      {/* ================================================================ */}
      <SceneToolbar
        animeId={animeId}
        mode={mode}
        onToggleMode={handleToggleMode}
        onToggleQuote={() => setShowQuote((prev) => !prev)}
        showQuote={showQuote}
        liked={liked}
        onLike={handleLike}
      />

      {/* ================================================================ */}
      {/* Bottom-right info card                                           */}
      {/* ================================================================ */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
      >
        <div
          className="bg-black/40 backdrop-blur-xl rounded-2xl px-5 py-4
                     ring-1 ring-white/10 shadow-xl shadow-black/40
                     max-w-[260px]"
        >
          {/* Scene title */}
          <h2 className="text-lg font-bold text-white mb-1 leading-tight">
            {scene.title}
          </h2>

          {/* Episode */}
          <p className="text-xs text-white/50 mb-3">
            {scene.anime_title} · EP{scene.episode}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {scene.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium
                           rounded-full bg-white/[0.08] text-white/60
                           ring-1 ring-white/[0.06]"
              >
                <Tag className="size-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Like count */}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-white/40">
            <Heart className="size-3" />
            <span>{liked ? scene.likes_count + 1 : scene.likes_count} 次点赞</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
