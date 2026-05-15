'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Anime } from '@/lib/types'

const TAG_COLORS: Record<string, string> = {
  热血: 'bg-red-500/20 text-red-300 border-red-500/30',
  治愈: 'bg-green-500/20 text-green-300 border-green-500/30',
  催泪: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  恋爱: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  奇幻: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  搞笑: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

const TAG_COLOR_FALLBACK = 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'

function getTagClasses(tag: string): string {
  return TAG_COLORS[tag] ?? TAG_COLOR_FALLBACK
}

interface AnimeCardProps {
  anime: Anime
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const displayTags = anime.tags.slice(0, 3)

  return (
    <Link href={`/anime/${anime.id}`} className="block group/card">
      <motion.div
        className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* 3:4 aspect ratio cover */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <motion.div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${anime.cover_url})` }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* content on top of image */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-1.5">
              {anime.title}
            </h3>

            {/* episode count */}
            {anime.episode_count != null && (
              <p className="text-xs text-white/60 mb-1.5">
                共 {anime.episode_count} 集
              </p>
            )}

            {/* tags */}
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {displayTags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTagClasses(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
