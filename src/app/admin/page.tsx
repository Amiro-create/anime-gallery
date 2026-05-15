'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Anime, Scene } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  CheckIcon,
  XIcon,
  Loader2Icon,
  PlusIcon,
  ImageIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  Scene['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  approved: { label: '已通过', variant: 'default' },
  pending: { label: '审核中', variant: 'secondary' },
  rejected: { label: '已驳回', variant: 'destructive' },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const [tab, setTab] = useState('pending')

  // Tab 1: Pending
  const [pendingScenes, setPendingScenes] = useState<Scene[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)

  // Tab 2: All scenes
  const [allScenes, setAllScenes] = useState<Scene[]>([])
  const [allLoading, setAllLoading] = useState(true)

  // Tab 3: Anime management
  const [animes, setAnimes] = useState<Anime[]>([])
  const [animesLoading, setAnimesLoading] = useState(true)

  // Anime form
  const [formTitle, setFormTitle] = useState('')
  const [formCoverUrl, setFormCoverUrl] = useState('')
  const [formBannerUrl, setFormBannerUrl] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formEpisodeCount, setFormEpisodeCount] = useState('')
  const [formTags, setFormTags] = useState('')
  const [adding, setAdding] = useState(false)

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------
  const fetchPending = useCallback(async () => {
    setPendingLoading(true)
    const { data, error } = await supabase
      .from('scene')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('获取待审核场景失败')
    } else {
      setPendingScenes((data as Scene[]) ?? [])
    }
    setPendingLoading(false)
  }, [])

  const fetchAllScenes = useCallback(async () => {
    setAllLoading(true)
    const { data, error } = await supabase
      .from('scene')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('获取场景列表失败')
    } else {
      setAllScenes((data as Scene[]) ?? [])
    }
    setAllLoading(false)
  }, [])

  const fetchAnimes = useCallback(async () => {
    setAnimesLoading(true)
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('获取番剧列表失败')
    } else {
      setAnimes((data as Anime[]) ?? [])
    }
    setAnimesLoading(false)
  }, [])

  useEffect(() => {
    fetchPending()
    fetchAllScenes()
    fetchAnimes()
  }, [fetchPending, fetchAllScenes, fetchAnimes])

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const handleApprove = async (scene: Scene) => {
    // Optimistic removal
    setPendingScenes((prev) => prev.filter((s) => s.id !== scene.id))

    const { error } = await supabase
      .from('scene')
      .update({ status: 'approved' })
      .eq('id', scene.id)

    if (error) {
      toast.error('操作失败')
      setPendingScenes((prev) => [...prev, scene])
    } else {
      toast.success('已通过')
      // Refresh all scenes list in background
      fetchAllScenes()
    }
  }

  const handleReject = async (scene: Scene) => {
    // Optimistic removal
    setPendingScenes((prev) => prev.filter((s) => s.id !== scene.id))

    const { error } = await supabase
      .from('scene')
      .update({ status: 'rejected' })
      .eq('id', scene.id)

    if (error) {
      toast.error('操作失败')
      setPendingScenes((prev) => [...prev, scene])
    } else {
      toast.success('已驳回')
      fetchAllScenes()
    }
  }

  const handleAddAnime = async () => {
    if (!formTitle.trim()) {
      toast.error('请输入番剧标题')
      return
    }
    if (!formCoverUrl.trim()) {
      toast.error('请输入封面图片 URL')
      return
    }
    if (!formEpisodeCount || Number(formEpisodeCount) < 1) {
      toast.error('请输入有效的集数')
      return
    }

    setAdding(true)
    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const { error } = await supabase.from('anime').insert({
      title: formTitle.trim(),
      cover_url: formCoverUrl.trim(),
      banner_url: formBannerUrl.trim() || null,
      description: formDescription.trim() || null,
      episode_count: Number(formEpisodeCount),
      tags,
      primary_color: '#6366f1',
    })

    if (error) {
      toast.error('添加失败: ' + error.message)
    } else {
      toast.success('番剧添加成功')
      setFormTitle('')
      setFormCoverUrl('')
      setFormBannerUrl('')
      setFormDescription('')
      setFormEpisodeCount('')
      setFormTags('')
      fetchAnimes()
    }
    setAdding(false)
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-8">管理后台</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList>
          <TabsTrigger value="pending">
            待审核
            {pendingScenes.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center size-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {pendingScenes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="scenes">所有场景</TabsTrigger>
          <TabsTrigger value="animes">番剧管理</TabsTrigger>
        </TabsList>

        {/* =============================================================== */}
        {/* Tab 1: 待审核 */}
        {/* =============================================================== */}
        <TabsContent value="pending" className="mt-6">
          {pendingLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingScenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CheckIcon className="size-12 mb-3 opacity-30" />
              <p className="text-sm">暂无待审核场景</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 shrink-0 aspect-video rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scene.image_url}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {scene.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      第 {scene.episode} 集
                    </p>
                    {scene.quote && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 truncate italic">
                        &ldquo;{scene.quote}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(scene)}
                    >
                      <CheckIcon className="size-4" />
                      通过
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(scene)}
                    >
                      <XIcon className="size-4" />
                      驳回
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* =============================================================== */}
        {/* Tab 2: 所有场景 */}
        {/* =============================================================== */}
        <TabsContent value="scenes" className="mt-6">
          {allLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : allScenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ImageIcon className="size-12 mb-3 opacity-30" />
              <p className="text-sm">暂无场景</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allScenes.map((scene) => {
                const statusConf = STATUS_CONFIG[scene.status]
                return (
                  <div
                    key={scene.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-32 shrink-0 aspect-video rounded-lg overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scene.image_url}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {scene.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        第 {scene.episode} 集
                      </p>
                    </div>

                    {/* Status badge */}
                    <Badge variant={statusConf.variant} className="shrink-0">
                      {statusConf.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* =============================================================== */}
        {/* Tab 3: 番剧管理 */}
        {/* =============================================================== */}
        <TabsContent value="animes" className="mt-6">
          {/* Add anime form */}
          <div className="rounded-xl border border-border bg-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              添加新番剧
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  placeholder="番剧名称"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cover_url">封面 URL</Label>
                  <Input
                    id="cover_url"
                    placeholder="https://..."
                    value={formCoverUrl}
                    onChange={(e) => setFormCoverUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="banner_url">横幅 URL</Label>
                  <Input
                    id="banner_url"
                    placeholder="https://...（可选）"
                    value={formBannerUrl}
                    onChange={(e) => setFormBannerUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">简介</Label>
                <Textarea
                  id="description"
                  placeholder="番剧简介（可选）"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="episode_count">集数</Label>
                  <Input
                    id="episode_count"
                    type="number"
                    min={1}
                    placeholder="例如：12"
                    value={formEpisodeCount}
                    onChange={(e) => setFormEpisodeCount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tags">标签</Label>
                  <Input
                    id="tags"
                    placeholder="逗号分隔，例如：热血,战斗"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddAnime}
                disabled={adding}
                className="w-full"
              >
                {adding ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    添加中...
                  </>
                ) : (
                  <>
                    <PlusIcon className="size-4" />
                    添加
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Existing animes list */}
          <h2 className="text-lg font-semibold text-foreground mb-4">
            已有番剧
          </h2>

          {animesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : animes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="size-10 mb-2 opacity-30" />
              <p className="text-sm">暂无番剧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {animes.map((anime) => (
                <div
                  key={anime.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
                >
                  {/* Cover thumbnail */}
                  <div className="relative w-16 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={anime.cover_url}
                      alt={anime.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {anime.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {anime.episode_count ?? '?'} 集
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
