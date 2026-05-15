'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import type { Scene, Collection } from '@/lib/types'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LogOutIcon,
  PlusIcon,
  Loader2Icon,
  UserIcon,
  ImageIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
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
// Helpers
// ---------------------------------------------------------------------------
function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()

  const [scenes, setScenes] = useState<Scene[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!user) {
      setDataLoading(false)
      return
    }

    async function fetchData() {
      setDataLoading(true)
      const [sceneResult, collectionResult] = await Promise.all([
        supabase
          .from('scene')
          .select('*')
          .eq('submitted_by', user!.id)
          .order('created_at', { ascending: false }),
        supabase.from('collection').select('*').eq('user_id', user!.id),
      ])

      if (sceneResult.data) setScenes(sceneResult.data as Scene[])
      if (collectionResult.data)
        setCollections(collectionResult.data as Collection[])
      setDataLoading(false)
    }

    fetchData()
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  // -----------------------------------------------------------------------
  // Auth loading
  // -----------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Not logged in
  // -----------------------------------------------------------------------
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <UserIcon className="size-16 text-muted-foreground/40" />
        <p className="text-2xl font-bold text-muted-foreground">请先登录</p>
        <p className="text-sm text-muted-foreground/60">
          登录后即可查看个人主页
        </p>
      </div>
    )
  }

  const username =
    (user.user_metadata?.username as string) ?? user.email?.split('@')[0] ?? '用户'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      {/* ----------------------------------------------------------------- */}
      {/* User info header */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-4 pb-8 border-b border-border">
        <Avatar size="lg">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={username} />
          ) : null}
          <AvatarFallback>{getInitials(username)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">
            {username}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <LogOutIcon className="size-4" />
          )}
          退出
        </Button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Collections */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-8 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">我的收藏夹</h2>
          <Button variant="outline" size="sm">
            <PlusIcon className="size-4" />
            新建
          </Button>
        </div>

        {dataLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="size-10 mb-2 opacity-30" />
            <p className="text-sm">还没有收藏夹</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              点击「新建」创建你的第一个收藏夹
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {collections.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-center rounded-xl border border-border bg-muted/40 p-4 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {col.name}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Submissions */}
      {/* ----------------------------------------------------------------- */}
      <section className="py-8">
        <h2 className="text-xl font-bold text-foreground mb-4">我的投稿</h2>

        {dataLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : scenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="size-10 mb-2 opacity-30" />
            <p className="text-sm">还没有投稿</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              去番剧页面分享你喜欢的场景吧
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scenes.map((scene) => {
              const statusConf = STATUS_CONFIG[scene.status]
              return (
                <Link
                  key={scene.id}
                  href={`/anime/${scene.anime_id}/scene/${scene.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                >
                  {/* Thumbnail (16:9) */}
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
                        "{scene.quote}"
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <Badge variant={statusConf.variant} className="shrink-0">
                    {statusConf.label}
                  </Badge>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
