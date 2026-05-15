import type { Anime } from '@/lib/types'
import AnimeCard from './AnimeCard'

interface AnimeGridProps {
  animes: Anime[]
}

export default function AnimeGrid({ animes }: AnimeGridProps) {
  if (animes.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">暂无番剧数据</p>
        <p className="text-sm mt-1">请稍后再来查看</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  )
}
