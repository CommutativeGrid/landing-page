import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Github, FileText } from 'lucide-react'

const authors = [
  { name: 'Yasuaki Hiraoka', url: 'https://sites.google.com/site/yasuakihiraoka/' },
  { name: 'Ken Nakashima', url: 'https://researchmap.jp/HFIPy3' },
  { name: 'Ippei Obayashi', url: 'https://i-obayashi.info/' },
  { name: 'Chenguang Xu', url: null },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold publication-title mb-8">
              Refinement of Interval Approximations for Fully Commutative Quivers
            </h1>
            <div className="text-lg publication-authors mb-8">
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
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="dark" className="rounded-full">
                <a
                  href="https://github.com/CommutativeGrids/commutazzio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Code
                </a>
              </Button>
              <Button asChild variant="dark" className="rounded-full">
                <a
                  href="https://link.springer.com/article/10.1007/s13160-025-00739-w"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Paper
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Abstract</h2>
          <div className="text-justify">
            <p className="text-gray-700 leading-relaxed">
              A fundamental difficulty in multiparameter persistent homology is the absence of a complete and discrete invariant.
              To address this challenge, we propose an enhanced framework 
              that not only achieves a holistic understanding of a fully commutative quiver's representation
              via synthesizing interpretations obtained from intervals
              but also can tune the balance between approximation resolution and computational complexity.
              This framework is evaluated on commutative ladders of both finite-type and infinite-type.
              In the former, we discover an efficient method for the indecomposable decomposition leveraging solely one-parameter persistent homology. 
              In the latter, we introduce a new invariant that reveals partial persistence in the second parameter 
              by connecting two standard persistence diagrams using interval approximations.
              We then introduce several models for constructing commutative ladder filtrations,
              offering new insights into random filtrations and 
              demonstrating our toolkit's effectiveness by analyzing the topology of materials.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Gallery of alternating zigzag courses for CL(4)
          </h2>
          <div className="text-justify">
            <p className="text-gray-700">
              <Link to="/courses" className="text-blue-600 hover:underline">
                See all the courses here.
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Connected Persistence Diagram Viewer</h2>
          <div className="text-justify">
            <p className="text-gray-700 mb-4">
              Explore connected persistence diagrams from the SiO₂ dataset used in the paper.
            </p>
            <Button asChild variant="bulmaPrimary">
              <Link to="/cpd-viewer">Open Viewer</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
