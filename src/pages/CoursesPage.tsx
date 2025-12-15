import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Switch } from '@/components/ui/switch'
import { Home, TableProperties, LayoutGrid } from 'lucide-react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, ISetFilterParams, CellStyle } from 'ag-grid-community'
import { visualizeLattice } from '@/lib/courses'
import plotData from '@/data/plot_data.json'

ModuleRegistry.registerModules([AllCommunityModule])

interface PathData {
  path: string
  ss: number[][]
  type: string
  interval: string
  remark: string
}

const LatticeRenderer = (props: ICellRendererParams<PathData>) => {
  const data = props.data
  if (!data) return null
  const svg = visualizeLattice(data.path, data.ss)
  return <div dangerouslySetInnerHTML={{ __html: svg.outerHTML }} />
}

export default function CoursesPage() {
  const [isGalleryView, setIsGalleryView] = useState(false)

  const typeComparator = useCallback((a: string, b: string) => {
    return parseInt(a.slice(1)) - parseInt(b.slice(1))
  }, [])

  const columnDefs = useMemo<ColDef<PathData>[]>(() => [
    {
      headerName: 'Alternating Zigzag Course',
      cellRenderer: LatticeRenderer,
      sortable: false,
      width: 460,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } as CellStyle
    },
    {
      headerName: 'Type',
      field: 'type',
      comparator: typeComparator,
      width: 140,
      cellStyle: { textAlign: 'center' } as CellStyle,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']
      } as ISetFilterParams
    },
    {
      headerName: 'Remark',
      field: 'remark',
      width: 180,
      cellStyle: { textAlign: 'center' } as CellStyle,
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['source-sink', 'corner-complete', 'new']
      } as ISetFilterParams
    }
  ], [typeComparator])

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true
  }), [])

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
            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
              <AgGridReact<PathData>
                rowData={plotData.paths as PathData[]}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowHeight={120}
                headerHeight={48}
                animateRows={true}
                domLayout="normal"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
