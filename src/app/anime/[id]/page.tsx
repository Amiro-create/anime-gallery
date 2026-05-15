import type { Anime, Scene } from '@/lib/types'
import type { Metadata } from 'next'
import DiscTimeline from '@/components/DiscTimeline'

// ---------------------------------------------------------------------------
// Mock scene data — each anime has 10 scenes arranged around the disc
// ---------------------------------------------------------------------------
const MOCK_SCENES: Record<string, Scene[]> = {
  // 进击的巨人
  '1': Array.from({ length: 10 }, (_, i) => ({
    id: `s1-${i + 1}`,
    anime_id: '1',
    episode: i + 1,
    title:
      i === 0
        ? '致两千年后的你'
        : i === 1
          ? '那一天'
          : i === 2
            ? '暗淡无光的绝望中'
            : i === 3
              ? '解散式之夜'
              : i === 4
                ? '初阵'
                : i === 5
                  ? '少女眼中的世界'
                  : i === 6
                    ? '小小的刀刃'
                    : i === 7
                      ? '听见心跳的声音'
                      : i === 8
                        ? '左手的去向'
                        : '回应',
    image_url: `https://picsum.photos/seed/aot-s${i + 1}/300/420`,
    quote:
      i === 0
        ? '那一天，人类回想起了受他们支配的恐惧'
        : i === 1
          ? '献出你的心脏'
          : i === 4
            ? '什么都无法舍弃的人，什么都无法改变'
            : undefined,
    description: undefined,
    tags: ['热血', '战斗'],
    layers: {},
    likes_count: 80 + Math.floor(Math.random() * 200),
    status: 'approved' as const,
    created_at: '2024-06-01',
  })),
  // 紫罗兰永恒花园
  '2': Array.from({ length: 10 }, (_, i) => ({
    id: `s2-${i + 1}`,
    anime_id: '2',
    episode: i + 1,
    title:
      i === 0
        ? '「我爱你」与自动手记人偶'
        : i === 1
          ? '不会再回来了'
          : i === 2
            ? '愿你成为优秀的自动手记人偶'
            : i === 3
              ? '你已不再是工具，而是人如其名的人'
              : i === 4
                ? '写给人间的信'
                : i === 5
                  ? '星空下的约定'
                  : i === 6
                    ? '飘落的樱花瓣'
                    : i === 7
                      ? '那片海的另一边'
                      : i === 8
                        ? '最后的信'
                        : '爱，永远在心中',
    image_url: `https://picsum.photos/seed/violet-s${i + 1}/300/420`,
    quote:
      i === 0
        ? '我想知道「我爱你」的含义'
        : i === 3
          ? '你已不再是工具，而是人如其名的人'
          : undefined,
    description: undefined,
    tags: ['治愈', '催泪'],
    layers: {},
    likes_count: 90 + Math.floor(Math.random() * 200),
    status: 'approved' as const,
    created_at: '2024-06-02',
  })),
  // 辉夜大小姐想让我告白
  '3': Array.from({ length: 10 }, (_, i) => ({
    id: `s3-${i + 1}`,
    anime_id: '3',
    episode: i + 1,
    title:
      i === 0
        ? '想让对方告白的恋爱头脑战'
        : i === 1
          ? '辉夜大小姐的刁难'
          : i === 2
            ? '白银会长也想被邀请'
            : i === 3
              ? '藤原千花想要被吃掉'
              : i === 4
                ? '石上优想要活下去'
                : i === 5
                  ? '学生会想要被庆祝'
                  : i === 6
                    ? '无法坦率的天才们'
                    : i === 7
                      ? '烟花之夜的奇迹'
                      : i === 8
                        ? '心跳加速的学园祭'
                        : '告白，终将到来',
    image_url: `https://picsum.photos/seed/kaguya-s${i + 1}/300/420`,
    quote: i === 7 ? '月色真美' : undefined,
    description: undefined,
    tags: ['恋爱', '搞笑', '校园'],
    layers: {},
    likes_count: 70 + Math.floor(Math.random() * 200),
    status: 'approved' as const,
    created_at: '2024-06-03',
  })),
}

const MOCK_ANIMES: Record<string, Anime> = {
  '1': {
    id: '1',
    title: '进击的巨人',
    cover_url: 'https://picsum.photos/seed/aot/400/600',
    banner_url: 'https://picsum.photos/seed/aot-banner/1200/400',
    primary_color: '#8b1a1a',
    description: '为了自由，献出心脏',
    episode_count: 87,
    tags: ['热血', '战斗'],
    created_at: '2024-01-01',
  },
  '2': {
    id: '2',
    title: '紫罗兰永恒花园',
    cover_url: 'https://picsum.photos/seed/violet/400/600',
    banner_url: 'https://picsum.photos/seed/violet-banner/1200/400',
    primary_color: '#7c3aed',
    description: '我想知道「我爱你」的含义',
    episode_count: 13,
    tags: ['治愈', '催泪'],
    created_at: '2024-01-02',
  },
  '3': {
    id: '3',
    title: '辉夜大小姐想让我告白',
    cover_url: 'https://picsum.photos/seed/kaguya/400/600',
    banner_url: 'https://picsum.photos/seed/kaguya-banner/1200/400',
    primary_color: '#db2777',
    description: '天才们的恋爱头脑战',
    episode_count: 37,
    tags: ['恋爱', '搞笑', '校园'],
    created_at: '2024-01-03',
  },
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const anime = MOCK_ANIMES[id]
  return {
    title: anime ? `${anime.title} - 场景圆盘` : '番剧未找到',
    description: anime?.description ?? '',
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function AnimeDiscPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const anime = MOCK_ANIMES[id]
  const scenes = MOCK_SCENES[id] ?? []

  // TODO: Replace mock data with Supabase fetch when env vars are configured:
  // const { data: anime } = await supabase.from('animes').select('*').eq('id', id).single()
  // const { data: scenes } = await supabase.from('scenes').select('*').eq('anime_id', id).eq('status', 'approved')

  if (!anime) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <p className="text-2xl font-bold text-muted-foreground">
          番剧未找到
        </p>
        <a
          href="/"
          className="text-sm text-primary hover:underline underline-offset-4"
        >
          返回首页
        </a>
      </div>
    )
  }

  return <DiscTimeline anime={anime} scenes={scenes} />
}
