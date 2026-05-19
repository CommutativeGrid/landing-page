import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Github, FileText, ArrowRight, Network, Grid3x3 } from 'lucide-react'

const authors = [
  { name: 'Yasuaki Hiraoka', url: 'https://sites.google.com/site/yasuakihiraoka/' },
  { name: 'Ken Nakashima', url: 'https://researchmap.jp/HFIPy3' },
  { name: 'Ippei Obayashi', url: 'https://i-obayashi.info/' },
  { name: 'Chenguang Xu', url: null },
]

const features = [
  {
    to: '/courses',
    icon: Grid3x3,
    title: 'Alternating Zigzag Courses',
    description:
      'Browse and filter the gallery of alternating zigzag courses for the commutative ladder CL(4), with interactive lattice diagrams.',
    cta: 'Explore courses',
  },
  {
    to: '/cpd-viewer',
    icon: Network,
    title: 'Connected Persistence Diagram Viewer',
    description:
      'Inspect connected persistence diagrams from the SiO₂ dataset used in the paper, with full control over layout, color, and connections.',
    cta: 'Open viewer',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground)) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <span className="section-eyebrow mb-6">
              Topological Data Analysis
            </span>
            <h1 className="publication-title mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Refinement of Interval Approximations for Fully Commutative Quivers
            </h1>
            <div className="publication-authors mb-8 text-lg text-muted-foreground">
              {authors.map((author, index) => (
                <span key={author.name} className="author-block">
                  {author.url ? (
                    <a href={author.url} target="_blank" rel="noopener noreferrer">
                      {author.name}
                    </a>
                  ) : (
                    <span>{author.name}</span>
                  )}
                  {index < authors.length - 1 && ', '}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full">
                <a
                  href="https://link.springer.com/article/10.1007/s13160-025-00739-w"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Read the Paper
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <a
                  href="https://github.com/CommutativeGrids/commutazzio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  View Code
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Abstract */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="section-eyebrow mb-4">Abstract</h2>
          <p className="prose-abstract text-justify text-[1.05rem] leading-relaxed text-foreground/90">
            A fundamental difficulty in multiparameter persistent homology is the absence of a
            complete and discrete invariant. To address this challenge, we propose an enhanced
            framework that not only achieves a holistic understanding of a fully commutative
            quiver's representation via synthesizing interpretations obtained from intervals but
            also can tune the balance between approximation resolution and computational
            complexity. This framework is evaluated on commutative ladders of both finite-type and
            infinite-type. In the former, we discover an efficient method for the indecomposable
            decomposition leveraging solely one-parameter persistent homology. In the latter, we
            introduce a new invariant that reveals partial persistence in the second parameter by
            connecting two standard persistence diagrams using interval approximations. We then
            introduce several models for constructing commutative ladder filtrations, offering new
            insights into random filtrations and demonstrating our toolkit's effectiveness by
            analyzing the topology of materials.
          </p>
        </section>

        {/* Interactive tools */}
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="section-eyebrow mb-2">Interactive Tools</h2>
            <p className="mb-10 text-2xl font-semibold tracking-tight text-foreground">
              Explore the results
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature) => (
                <Link
                  key={feature.to}
                  to={feature.to}
                  className="group relative flex flex-col rounded-xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {feature.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
