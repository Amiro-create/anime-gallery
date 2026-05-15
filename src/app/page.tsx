import type { Anime } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import BannerCarousel from '@/components/BannerCarousel'
import AnimeGrid from '@/components/AnimeGrid'

const FALLBACK_ANIMES: Anime[] = [
  {
    id: '1',
    title: '进击的巨人',
    cover_url: 'https://picsum.photos/seed/aot/400/600',
    banner_url: 'https://picsum.photos/seed/aot-banner/1200/400',
    primary_color: '#4a1a1a',
    description: '为了自由，献出心脏',
    episode_count: 87,
    tags: ['热血', '战斗'],
    created_at: '2024-01-01',
  },
  {
    id: '2',
    title: '紫罗兰永恒花园',
    cover_url: 'https://picsum.photos/seed/violet/400/600',
    banner_url: 'https://picsum.photos/seed/violet-banner/1200/400',
    primary_color: '#2a1550',
    description: '我想知道「我爱你」的含义',
    episode_count: 13,
    tags: ['治愈', '催泪'],
    created_at: '2024-01-02',
  },
  {
    id: '3',
    title: '辉夜大小姐想让我告白',
    cover_url: 'https://picsum.photos/seed/kaguya/400/600',
    banner_url: 'https://picsum.photos/seed/kaguya-banner/1200/400',
    primary_color: '#8b1a4a',
    description: '天才们的恋爱头脑战',
    episode_count: 37,
    tags: ['恋爱', '搞笑', '校园'],
    created_at: '2024-01-03',
  },
]

export default async function Home() {
  const { data } = await supabase
    .from('anime')
    .select('*')
    .order('created_at', { ascending: false })

  const animes: Anime[] = (data && data.length > 0) ? data as Anime[] : FALLBACK_ANIMES

  return (
    <div className="w-full">
      <BannerCarousel animes={animes} />
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-foreground mb-6">全部番剧</h2>
        <AnimeGrid animes={animes} />
      </section>
    </div>
  )
}
