'use client'

import { useState, useCallback, useRef, useEffect, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Anime } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  UploadIcon,
  XIcon,
  ImageIcon,
  Loader2Icon,
  PlusIcon,
  CheckIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Predefined tags
// ---------------------------------------------------------------------------
const PREDEFINED_TAGS = [
  '热血',
  '战斗',
  '治愈',
  '催泪',
  '恋爱',
  '搞笑',
  '校园',
  '奇幻',
  '冒险',
  '科幻',
  '日常',
  '悬疑',
  '恐怖',
  '音乐',
  '运动',
  '美食',
  '异世界',
  '机战',
  '历史',
  '职场',
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function UploadPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [animeId, setAnimeId] = useState('')
  const [animeList, setAnimeList] = useState<Anime[]>([])
  const [animeLoading, setAnimeLoading] = useState(true)
  const [episode, setEpisode] = useState('')
  const [title, setTitle] = useState('')
  const [quote, setQuote] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  // File state
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  // Submission state
  const [submitting, setSubmitting] = useState(false)

  // -----------------------------------------------------------------------
  // File handlers
  // -----------------------------------------------------------------------
  const handleFileSelect = useCallback((selected: File) => {
    if (!selected.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB')
      return
    }
    setFile(selected)
    const url = URL.createObjectURL(selected)
    setPreview(url)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const dropped = e.dataTransfer.files?.[0]
      if (dropped) handleFileSelect(dropped)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) handleFileSelect(selected)
    },
    [handleFileSelect],
  )

  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
  }, [preview])

  // -----------------------------------------------------------------------
  // Tag handlers
  // -----------------------------------------------------------------------
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }, [])

  const addCustomTag = useCallback(() => {
    const trimmed = customTag.trim()
    if (!trimmed) return
    if (selectedTags.includes(trimmed)) {
      toast.error('标签已存在')
      return
    }
    if (selectedTags.length >= 10) {
      toast.error('最多添加 10 个标签')
      return
    }
    setSelectedTags((prev) => [...prev, trimmed])
    setCustomTag('')
  }, [customTag, selectedTags])

  const removeTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  // -----------------------------------------------------------------------
  // Fetch anime list on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    async function fetchAnime() {
      try {
        const { data } = await supabase
          .from('anime')
          .select('*')
          .order('title', { ascending: true })
        setAnimeList((data as Anime[]) ?? [])
      } catch {
        // Supabase unreachable — show empty list
      } finally {
        setAnimeLoading(false)
      }
    }
    fetchAnime()
  }, [])
  const handleSubmit = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }
    if (!file) {
      toast.error('请上传场景图片')
      return
    }
    if (!animeId) {
      toast.error('请选择番剧')
      return
    }
    if (!title.trim()) {
      toast.error('请输入场景标题')
      return
    }
    if (!episode || Number(episode) < 1) {
      toast.error('请输入有效的集数')
      return
    }

    setSubmitting(true)
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop() ?? 'png'
      const filePath = `scenes/${Date.now()}_${crypto.randomUUID()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('scenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 2. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('scenes').getPublicUrl(filePath)

      // 3. Insert scene record
      const { error: insertError } = await supabase.from('scenes').insert({
        anime_id: animeId.trim(),
        episode: Number(episode),
        title: title.trim(),
        image_url: publicUrl,
        quote: quote.trim() || null,
        description: description.trim() || null,
        tags: selectedTags,
        layers: {},
        likes_count: 0,
        status: 'pending',
        submitted_by: user.id,
      })

      if (insertError) throw insertError

      toast.success('投稿成功！等待审核')
      router.push('/')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '投稿失败，请重试'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // -----------------------------------------------------------------------
  // Auth gate
  // -----------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <ImageIcon className="size-16 text-muted-foreground/40" />
        <p className="text-2xl font-bold text-muted-foreground">
          请先登录后再投稿
        </p>
        <p className="text-sm text-muted-foreground/60">
          登录后即可分享你收藏的动漫场景
        </p>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">投稿场景</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          分享你收藏的动漫场景，提交后将进入审核队列
        </p>
      </div>

      <div className="space-y-8">
        {/* --------------------------------------------------------------- */}
        {/* Drag-and-drop upload zone */}
        {/* --------------------------------------------------------------- */}
        <div>
          <Label className="mb-2 block">场景截图</Label>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="预览"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-3 right-3 size-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
              }`}
            >
              <UploadIcon className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                拖拽图片到此处，或点击选择
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">
                支持 JPG、PNG、WebP，最大 10MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Form fields */}
        {/* --------------------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="animeId">所属番剧</Label>
            <Select
              value={animeId}
              onValueChange={(v) => setAnimeId(v ?? '')}
              disabled={animeLoading}
            >
              <SelectTrigger id="animeId">
                <SelectValue placeholder={animeLoading ? '加载中...' : '选择番剧'} />
              </SelectTrigger>
              <SelectContent>
                {animeList.map((anime) => (
                  <SelectItem key={anime.id} value={anime.id}>
                    {anime.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground/60">
              {animeList.length === 0 && !animeLoading
                ? '暂无可用番剧，请先联系管理员添加'
                : `共 ${animeList.length} 部番剧可选`}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="episode">集数</Label>
            <Input
              id="episode"
              type="number"
              min={1}
              placeholder="例如：7"
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">场景标题</Label>
          <Input
            id="title"
            placeholder="给这个场景起个名字"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quote">经典台词</Label>
          <Input
            id="quote"
            placeholder="这个场景中的经典台词（可选）"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">场景描述</Label>
          <Textarea
            id="description"
            placeholder="描述一下这个场景的故事背景（可选）"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Tags */}
        {/* --------------------------------------------------------------- */}
        <div className="space-y-3">
          <Label>标签</Label>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer gap-1 pr-1"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <XIcon className="size-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Predefined tags */}
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.filter((t) => !selectedTags.includes(t)).map(
              (tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => toggleTag(tag)}
                >
                  <PlusIcon className="size-3" />
                  {tag}
                </Badge>
              ),
            )}
          </div>

          {/* Custom tag input */}
          <div className="flex gap-2">
            <Input
              placeholder="自定义标签"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomTag()
                }
              }}
              className="max-w-[200px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomTag}
              disabled={!customTag.trim()}
            >
              <PlusIcon className="size-4" />
              添加
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60">
            点击预设标签添加，再点已选标签可移除；也可输入自定义标签（最多
            10 个）
          </p>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Submit */}
        {/* --------------------------------------------------------------- */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <CheckIcon className="size-4" />
              提交投稿
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
