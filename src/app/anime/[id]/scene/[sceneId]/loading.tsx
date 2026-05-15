export default function SceneLoading() {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-lg text-muted-foreground animate-pulse">场景加载中...</p>
      </div>
    </div>
  )
}
