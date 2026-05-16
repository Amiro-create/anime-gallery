import { supabase } from '@/lib/supabase'
import ScenePageClient from './client'

export interface SceneDisplayData {
  id: string
  anime_id: string
  episode: number
  title: string
  image_url: string
  quote?: string
  description?: string
  anime_title: string
  primary_color: string
  tags: string[]
  layers: { fg?: string; mg?: string; bg: string }
  likes_count: number
  status: string
  created_at: string
}

function ensureLayers(
  image_url: string,
  raw: unknown,
): { fg?: string; mg?: string; bg: string } {
  const parsed = (raw ?? {}) as { fg?: string; mg?: string; bg?: string }
  return {
    fg: parsed.fg,
    mg: parsed.mg,
    bg: parsed.bg ?? image_url,
  }
}

function getMockSceneData(animeId: string, sceneId: string): SceneDisplayData {
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

  const seed = sceneId

  return {
    id: sceneId,
    anime_id: animeId,
    episode: sceneIndex,
    title: titles[sceneId] ?? `场景 ${sceneIndex}`,
    image_url: `https://picsum.photos/seed/${seed}/1920/1080`,
    quote: quotes[sceneId] ?? undefined,
    description: undefined,
    anime_title: animeTitles[animeId] ?? '未知番剧',
    primary_color: animeColors[animeId] ?? '#6366f1',
    tags: tags[animeId] ?? [],
    layers: {
      fg: `https://picsum.photos/seed/${seed}-fg/1200/675`,
      mg: `https://picsum.photos/seed/${seed}-mg/1200/675`,
      bg: `https://picsum.photos/seed/${seed}-bg/1200/675`,
    },
    likes_count: 80 + Math.floor(Math.random() * 200),
    status: 'approved',
    created_at: '2024-06-01',
  }
}

export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: string; sceneId: string }>
}) {
  const { id, sceneId } = await params

  let scene: SceneDisplayData | null = null

  const { data: sceneRow } = await supabase
    .from('scene')
    .select('*, anime:anime_id(title, primary_color)')
    .eq('id', sceneId)
    .single()

  if (sceneRow) {
    const animeRef = sceneRow.anime as { title?: string; primary_color?: string } | null
    scene = {
      id: sceneRow.id,
      anime_id: sceneRow.anime_id,
      episode: sceneRow.episode,
      title: sceneRow.title,
      image_url: sceneRow.image_url,
      quote: sceneRow.quote ?? undefined,
      description: sceneRow.description ?? undefined,
      anime_title: animeRef?.title ?? '未知番剧',
      primary_color: animeRef?.primary_color ?? '#6366f1',
      tags: sceneRow.tags ?? [],
      layers: ensureLayers(sceneRow.image_url, sceneRow.layers),
      likes_count: sceneRow.likes_count ?? 0,
      status: sceneRow.status,
      created_at: sceneRow.created_at,
    }
  }

  if (!scene) {
    scene = getMockSceneData(id, sceneId)
  }

  return <ScenePageClient animeId={id} sceneId={sceneId} scene={scene} />
}
