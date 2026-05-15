'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGitHub,
} from '@/lib/auth'
import { Loader2Icon } from 'lucide-react'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

interface AuthDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setError('')
    setLoading(false)
  }

  const handleModeToggle = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } =
      mode === 'login'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, username)

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleGitHubLogin = async () => {
    setError('')
    setLoading(true)
    const { error: ghError } = await signInWithGitHub()
    if (ghError) {
      setError(ghError.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? '登录' : '注册'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? '使用邮箱登录你的账户'
              : '创建一个新账户'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="你的用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            {mode === 'login' ? '登录' : '注册'}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">或</span>
          <Separator className="flex-1" />
        </div>

        <Button
          variant="outline"
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full"
        >
          <GitHubIcon className="mr-2 size-4" />
          使用 GitHub 登录
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? '还没有账户？' : '已有账户？'}
          <button
            type="button"
            onClick={handleModeToggle}
            className="ml-1 text-primary hover:underline"
          >
            {mode === 'login' ? '注册' : '登录'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
