'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Anime } from '@/lib/types'

interface BannerCarouselProps {
  animes: Anime[]
}

export default function BannerCarousel({ animes }: BannerCarouselProps) {
  const items = animes.slice(0, 5)
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length)
  }, [items.length])

  useEffect(() => {
    if (isHovered || items.length <= 1) return
    const timer = setInterval(advance, 5000)
    return () => clearInterval(timer)
  }, [advance, isHovered, items.length])

  if (items.length === 0) return null

  const anime = items[current]

  return (
    <div
      className="relative w-full h-[480px] overflow-hidden rounded-xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={anime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Link href={`/anime/${anime.id}`} className="block w-full h-full">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${anime.banner_url || anime.cover_url})`,
              }}
            >
              {/* gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

              {/* text content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {anime.title}
                </h2>
                {anime.description && (
                  <p className="text-sm text-white/80 max-w-2xl line-clamp-2 drop-shadow">
                    {anime.description}
                  </p>
                )}
                {anime.episode_count != null && (
                  <p className="text-xs text-white/60 mt-2">
                    共 {anime.episode_count} 集
                  </p>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-6 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === current
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`切换到第 ${index + 1} 张`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
