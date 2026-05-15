'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AuthDialog } from './AuthDialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { signOut } from '@/lib/auth'
import { LogOutIcon, UserIcon } from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary hover:text-primary/80 transition-colors"
        >
          动漫场景画廊
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            首页
          </Link>
          <Link
            href="/gallery"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            画廊
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            关于
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.username || user.email}
                />
                <AvatarFallback>
                  <UserIcon className="size-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {user.user_metadata.username || user.email?.split('@')[0]}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSignOut}
                title="退出登录"
              >
                <LogOutIcon />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthOpen(true)}
            >
              登录
            </Button>
          )}
        </nav>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}
