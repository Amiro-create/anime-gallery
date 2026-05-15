import type { Anime, Scene } from '@/lib/types'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import DiscTimeline from '@/components/DiscTimeline'

// Fallback mock data — used only when Supabase is unreachable or empty
const FALLBACK_SCENES: Record<string, Scene[]> = {
  '1': Array.from({ length: 10 }, (_, i) => ({
    id: `s1-${i + 1}`,
    anime_id: '1',
    episode: i + 1,
    title: ['致两千年后的你','那一天','暗淡无光的绝望中','解散式之夜','初阵','少女眼中的世界','小小的刀刃','听见心跳的声音','左手的去向','回应'][i],
    image_url: `https://picsum.photos/seed/aot-s${i + 1}/300/420`,
    quote: i === 0 ? '那一天，人类回想起了受他们支配的恐惧' : i === 1 ? '献出你的心脏' : i === 4 ? '什么都无法舍弃的人，什么都无法改变' : undefined,
    description: undefined,
    tags: ['热血', '战斗'],
    layers: {},
    likes_count: 80,
    status: 'approved' as const,
    submitted_by: undefined,
    created_at: '2024-06-01',
  })),
  '2': Array.from({ length: 10 }, (_, i) => ({
    id: `s2-${i + 1}`,
    anime_id: '2',
    episode: i + 1,
    title: ['「我爱你」与自动手记人偶','不会再回来了','愿你成为优秀的自动手记人偶','你已不再是工具，而是人如其名的人','写给人间的信','星空下的约定','飘落的樱花瓣','那片海的另一边','最后的信','爱，永远在心中'][i],
    image_url: `https://picsum.photos/seed/violet-s${i + 1}/300/420`,
    quote: i === 0 ? '我想知道「我爱你」的含义' : i === 3 ? '你已不再是工具，而是人如其名的人' : undefined,
    description: undefined,
    tags: ['治愈', '催泪'],
    layers: {},
    likes_count: 90,
    status: 'approved' as const,
    submitted_by: undefined,
    created_at: '2024-06-02',
  })),
  '3': Array.from({ length: 10 }, (_, i) => ({
    id: `s3-${i + 1}`,
    anime_id: '3',
    episode: i + 1,
    title: ['想让对方告白的恋爱头脑战','辉夜大小姐的刁难','白银会长也想被邀请','藤原千花想要被吃掉','石上优想要活下去','学生会想要被庆祝','无法坦率的天才们','烟花之夜的奇迹','心跳加速的学园祭','告白，终将到来'][i],
    image_url: `https://picsum.photos/seed/kaguya-s${i + 1}/300/420`,
    quote: i === 7 ? '月色真美' : undefined,
    description: undefined,
    tags: ['恋爱', '搞笑', '校园'],
    layers: {},
    likes_count: 70,
    status: 'approved' as const,
    submitted_by: undefined,
    created_at: '2024-06-03',
  })),
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data: anime } = await supabase.from('anime').select('*').eq('id', id).single()
  return {
    title: anime ? `${(anime as unknown as Anime).title} - 场景圆盘` : '番剧未找到',
    description: (anime as unknown as Anime)?.description ?? '',
  }
}

export default async function AnimeDiscPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: anime } = await supabase.from('anime').select('*').eq('id', id).single()
  const { data: scenes } = await supabase
    .from('scene')
    .select('*')
    .eq('anime_id', id)
    .eq('status', 'approved')
    .order('episode', { ascending: true })

  const resolvedAnime: Anime | undefined = (anime as unknown as Anime) ?? undefined
  const resolvedScenes: Scene[] = (scenes && scenes.length > 0) ? scenes as unknown as Scene[] : (FALLBACK_SCENES[id] ?? [])

  if (!resolvedAnime && resolvedScenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <p className="text-2xl font-bold text-muted-foreground">番剧未找到</p>
        <a href="/" className="text-sm text-primary hover:underline underline-offset-4">返回首页</a>
      </div>
    )
  }

  // If anime not found in DB but fallback scenes exist, use a minimal anime object
  const displayAnime: Anime = resolvedAnime ?? {
    id,
    title: '番剧',
    cover_url: '',
    primary_color: '#1a1a2e',
    tags: [],
    created_at: '',
  }

  return <DiscTimeline anime={displayAnime} scenes={resolvedScenes} />
}
