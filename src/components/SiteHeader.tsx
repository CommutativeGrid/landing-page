import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Github, FileText } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/courses', label: 'Courses' },
  { to: '/cpd-viewer', label: 'CPD Viewer' },
]

export function SiteHeader({ leading }: { leading?: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      {leading}
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/CommutativeGrids/commutazzio"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            <Github className="h-4 w-4" />
            Code
          </a>
          <a
            href="https://link.springer.com/article/10.1007/s13160-025-00739-w"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            <FileText className="h-4 w-4" />
            Paper
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
