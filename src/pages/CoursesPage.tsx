import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Switch } from '@/components/ui/switch'
import { Home, TableProperties, LayoutGrid } from 'lucide-react'
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator.min.css'
import { visualizeLattice } from '@/lib/courses'
import plotData from '@/data/plot_data.json'

interface PathData {
  path: string
  ss: number[][]
  type: string
  interval: string
  remark: string
}

export default function CoursesPage() {
  const [isGalleryView, setIsGalleryView] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const tabulatorRef = useRef<Tabulator | null>(null)

  const initializeTable = useCallback(() => {
    if (!tableRef.current) return

    if (tabulatorRef.current) {
      tabulatorRef.current.destroy()
    }

    const visualizeLatticeFormatter = (cell: CellComponent) => {
      const data = cell.getRow().getData() as PathData
      const svg = visualizeLattice(data.path, data.ss)
      return svg.outerHTML
    }

    const typeSorter = (a: string, b: string) => {
      return parseInt(a.slice(1)) - parseInt(b.slice(1))
    }

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: plotData.paths,
      layout: 'fitDataTable',
      responsiveLayout: 'hide',
      height: 'calc(100vh - 200px)',
      columns: [
        {
          title: 'Alternating Zigzag Course',
          headerHozAlign: 'center',
          formatter: visualizeLatticeFormatter,
          headerSort: false,
          width: 460,
          hozAlign: 'center',
        },
        {
          title: 'Type',
          field: 'type',
          sorter: typeSorter,
          headerHozAlign: 'center',
          width: 140,
          hozAlign: 'center',
          headerFilter: 'list',
          headerFilterParams: {
            values: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
            multiselect: true,
          },
          headerFilterFunc: (headerValue: string[], rowValue: string) => {
            if (headerValue.length === 0) {
              return true
            }
            return headerValue.includes(rowValue)
          },
        },
        {
          title: 'Remark',
          field: 'remark',
          headerHozAlign: 'center',
          headerSort: true,
          width: 180,
          hozAlign: 'center',
          headerFilter: 'list',
          headerFilterParams: {
            values: ['source-sink', 'corner-complete', 'new'],
            multiselect: true,
          },
          headerFilterFunc: (headerValue: string[], rowValue: string) => {
            if (headerValue.length === 0) {
              return true
            }
            return headerValue.includes(rowValue)
          },
        },
      ],
    })
  }, [])

  useEffect(() => {
    if (!isGalleryView) {
      initializeTable()
    }
    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy()
        tabulatorRef.current = null
      }
    }
  }, [isGalleryView, initializeTable])

  const renderGallery = () => {
    return (
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))' }}>
        {(plotData.paths as PathData[]).map((data, index) => {
          const svg = visualizeLattice(data.path, data.ss)
          return (
            <div
              key={index}
              className={`gallery-item ${data.type} ${data.remark}`}
              dangerouslySetInnerHTML={{ __html: svg.outerHTML }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Link
        to="/"
        className="fixed top-4 left-4 p-2 bg-white rounded-lg hover:bg-gray-100 z-50 shadow-md"
      >
        <Home className="h-6 w-6" />
      </Link>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Alternating Zigzag Courses for CL(4)</h1>

          <div className="flex items-center justify-center gap-4 mb-8">
            <TableProperties className="h-6 w-6 text-blue-500" />
            <Switch
              checked={isGalleryView}
              onCheckedChange={setIsGalleryView}
              className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-blue-400"
            />
            <LayoutGrid className="h-6 w-6 text-purple-500" />
          </div>

          {isGalleryView ? (
            renderGallery()
          ) : (
            <div className="overflow-x-auto">
              <div ref={tableRef} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
