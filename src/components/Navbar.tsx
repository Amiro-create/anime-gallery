import Link from "next/link";

export default function Navbar() {
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
        </nav>
      </div>
    </header>
  );
}
