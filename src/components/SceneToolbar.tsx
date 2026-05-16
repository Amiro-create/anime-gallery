'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Download, MessageCircle } from 'lucide-react'

interface SceneToolbarProps {
  animeId: string
  mode: '2d' | '2.5d'
  onToggleMode: () => void
  onToggleQuote: () => void
  showQuote: boolean
  liked: boolean
  onLike: () => void
}

export default function SceneToolbar({
  animeId,
  mode,
  onToggleMode,
  onToggleQuote,
  showQuote,
  liked,
  onLike,
}: SceneToolbarProps) {
  return (
    <motion.div
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
    >
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-full
                      bg-black/40 backdrop-blur-xl
                      ring-1 ring-white/10
                      shadow-lg shadow-black/30"
      >
        {/* Back button */}
        <Link
          href={`/anime/${animeId}`}
          className="flex items-center justify-center size-9 rounded-full
                     text-white/70 hover:text-white hover:bg-white/10
                     transition-colors"
          aria-label="返回"
        >
          <ArrowLeft className="size-4" />
        </Link>

        {/* Separator */}
        <div className="w-px h-5 bg-white/15 mx-1" />

        {/* Mode toggle — disabled until 2.5D is ready */}

        {/* Quote toggle */}
        <button
          onClick={onToggleQuote}
          className={`flex items-center justify-center size-9 rounded-full
                     transition-colors
                     ${showQuote ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          aria-label={showQuote ? '隐藏台词' : '显示台词'}
        >
          <MessageCircle className="size-4" />
        </button>

        {/* Like button */}
        <button
          onClick={onLike}
          className={`flex items-center justify-center size-9 rounded-full
                     transition-colors
                     ${liked ? 'text-red-400 bg-red-400/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          aria-label={liked ? '取消点赞' : '点赞'}
        >
          <Heart className={`size-4 ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Download button */}
        <button
          className="flex items-center justify-center size-9 rounded-full
                     text-white/70 hover:text-white hover:bg-white/10
                     transition-colors"
          aria-label="下载"
        >
          <Download className="size-4" />
        </button>
      </div>
    </motion.div>
  )
}
