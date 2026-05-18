import { useState, useMemo, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { SiteHeader } from '@/components/SiteHeader'
import { TableProperties, LayoutGrid } from 'lucide-react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, CellStyle, IFilterParams, IDoesFilterPassParams } from 'ag-grid-community'
import { visualizeLattice } from '@/lib/courses'
import plotData from '@/data/plot_data.json'

ModuleRegistry.registerModules([AllCommunityModule])

interface CustomSetFilterParams extends IFilterParams {
  values: string[]
}

const CustomSetFilter = forwardRef((props: CustomSetFilterParams, ref) => {
  const { values, filterChangedCallback } = props
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set(values))

  useEffect(() => {
    filterChangedCallback()
  }, [selectedValues, filterChangedCallback])

  useImperativeHandle(ref, () => ({
    doesFilterPass(params: IDoesFilterPassParams) {
      const { node } = params
      const field = props.colDef.field as string
      const value = node.data[field]
      return selectedValues.has(value)
    },
    isFilterActive() {
      return selectedValues.size !== values.length
    },
    getModel() {
      if (selectedValues.size === values.length) return null
      return { values: Array.from(selectedValues) }
    },
    setModel(model: { values: string[] } | null) {
      if (model === null) {
        setSelectedValues(new Set(values))
      } else {
        setSelectedValues(new Set(model.values))
      }
    }
  }))

  const toggleValue = (value: string) => {
    setSelectedValues(prev => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  const selectAll = () => setSelectedValues(new Set(values))
  const selectNone = () => setSelectedValues(new Set())

  const allSelected = selectedValues.size === values.length
  const noneSelected = selectedValues.size === 0

  return (
    <div className="p-2 min-w-[150px]">
      <div className="flex gap-2 mb-2 pb-2 border-b border-gray-200">
        <button
          onClick={selectAll}
          disabled={allSelected}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Select All
        </button>
        <button
          onClick={selectNone}
          disabled={noneSelected}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Select None
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {values.map(value => (
          <label key={value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
            <input
              type="checkbox"
              checked={selectedValues.has(value)}
              onChange={() => toggleValue(value)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">{value}</span>
          </label>
        ))}
      </div>
    </div>
  )
})

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
  const allTypes = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']
  const allRemarks = ['source-sink', 'corner-complete', 'new']

  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(allTypes))
  const [activeRemarks, setActiveRemarks] = useState<Set<string>>(new Set(allRemarks))

  const toggleType = (type: string) => {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const toggleRemark = (remark: string) => {
    setActiveRemarks(prev => {
      const next = new Set(prev)
      if (next.has(remark)) {
        next.delete(remark)
      } else {
        next.add(remark)
      }
      return next
    })
  }

  const resetAllFilters = () => {
    setActiveTypes(new Set(allTypes))
    setActiveRemarks(new Set(allRemarks))
  }

  const hasFiltersChanged = activeTypes.size !== allTypes.length || activeRemarks.size !== allRemarks.length

  const filteredPaths = useMemo(() => {
    return (plotData.paths as PathData[]).filter(data => {
      const typeMatch = activeTypes.has(data.type)
      const remarkMatch = activeRemarks.has(data.remark)
      return typeMatch && remarkMatch
    })
  }, [activeTypes, activeRemarks])

  const typeComparator = useCallback((a: string, b: string) => {
    return parseInt(a.slice(1)) - parseInt(b.slice(1))
  }, [])

  const columnDefs = useMemo<ColDef<PathData>[]>(() => [
    {
      headerName: 'Alternating Zigzag Course',
      cellRenderer: LatticeRenderer,
      sortable: false,
      width: 250,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } as CellStyle
    },
    {
      headerName: 'Type',
      field: 'type',
      comparator: typeComparator,
      filter: CustomSetFilter,
      filterParams: {
        values: allTypes
      },
      width: 100,
      cellStyle: { textAlign: 'center' } as CellStyle
    },
    {
      headerName: 'Remark',
      field: 'remark',
      filter: CustomSetFilter,
      filterParams: {
        values: allRemarks
      },
      width: 140,
      cellStyle: { textAlign: 'center' } as CellStyle
    }
  ], [typeComparator, allTypes, allRemarks])

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true
  }), [])

  const getTypeChipStyle = (type: string, isSelected: boolean) => {
    const colors: Record<string, { selected: string; dimmed: string }> = {
      'A1': { selected: 'bg-blue-100 text-blue-800', dimmed: 'bg-muted text-muted-foreground/40' },
      'A2': { selected: 'bg-green-100 text-green-800', dimmed: 'bg-muted text-muted-foreground/40' },
      'A3': { selected: 'bg-yellow-100 text-yellow-800', dimmed: 'bg-muted text-muted-foreground/40' },
      'A4': { selected: 'bg-orange-100 text-orange-800', dimmed: 'bg-muted text-muted-foreground/40' },
      'A5': { selected: 'bg-red-100 text-red-800', dimmed: 'bg-muted text-muted-foreground/40' },
      'A6': { selected: 'bg-purple-100 text-purple-800', dimmed: 'bg-muted text-muted-foreground/40' }
    }
    const colorSet = colors[type] || { selected: 'bg-gray-100 text-gray-800', dimmed: 'bg-muted text-muted-foreground/40' }
    return isSelected ? colorSet.selected : colorSet.dimmed
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'A1': 'bg-blue-100 text-blue-800',
      'A2': 'bg-green-100 text-green-800',
      'A3': 'bg-yellow-100 text-yellow-800',
      'A4': 'bg-orange-100 text-orange-800',
      'A5': 'bg-red-100 text-red-800',
      'A6': 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getRemarkChipStyle = (remark: string, isSelected: boolean) => {
    const colors: Record<string, { selected: string; dimmed: string }> = {
      'source-sink': { selected: 'bg-cyan-100 text-cyan-800', dimmed: 'bg-muted text-muted-foreground/40' },
      'corner-complete': { selected: 'bg-pink-100 text-pink-800', dimmed: 'bg-muted text-muted-foreground/40' },
      'new': { selected: 'bg-emerald-100 text-emerald-800', dimmed: 'bg-muted text-muted-foreground/40' }
    }
    const colorSet = colors[remark] || { selected: 'bg-gray-100 text-gray-800', dimmed: 'bg-muted text-muted-foreground/40' }
    return isSelected ? colorSet.selected : colorSet.dimmed
  }

  const getRemarkBadgeColor = (remark: string) => {
    const colors: Record<string, string> = {
      'source-sink': 'bg-cyan-100 text-cyan-800',
      'corner-complete': 'bg-pink-100 text-pink-800',
      'new': 'bg-emerald-100 text-emerald-800'
    }
    return colors[remark] || 'bg-gray-100 text-gray-800'
  }

  const renderFilterChips = () => {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border px-6 py-4 mb-6">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Type Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Type</span>
            <div className="flex gap-1.5">
              {allTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${getTypeChipStyle(type, activeTypes.has(type))}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Remark Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Remark</span>
            <div className="flex gap-1.5">
              {allRemarks.map(remark => (
                <button
                  key={remark}
                  onClick={() => toggleRemark(remark)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${getRemarkChipStyle(remark, activeRemarks.has(remark))}`}
                >
                  {remark}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button and count */}
          {hasFiltersChanged && (
            <>
              <div className="w-px h-6 bg-border" />
              <button
                onClick={resetAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset
              </button>
              <span className="text-xs text-muted-foreground/70">
                {filteredPaths.length}/{(plotData.paths as PathData[]).length}
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderGallery = () => {
    return (
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {filteredPaths.map((data, index) => {
          const svg = visualizeLattice(data.path, data.ss)
          return (
            <div
              key={index}
              className="figure-surface rounded-lg shadow-sm p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(data.type)}`}>
                  {data.type}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRemarkBadgeColor(data.remark)}`}>
                  {data.remark}
                </span>
              </div>
              <div
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: svg.outerHTML }}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="text-center">
            <span className="section-eyebrow mb-3">Commutative Ladder CL(4)</span>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              Alternating Zigzag Courses
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-sm text-muted-foreground">
              Switch between the sortable table and the visual gallery, and filter by type or
              remark.
            </p>

            <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  !isGalleryView ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <TableProperties className="h-4 w-4" />
                Table
              </span>
              <Switch checked={isGalleryView} onCheckedChange={setIsGalleryView} />
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  isGalleryView ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Gallery
              </span>
            </div>
          </div>

          {isGalleryView ? (
            <>
              {renderFilterChips()}
              {renderGallery()}
            </>
          ) : (
            <div className="flex justify-center">
              <div
                className="ag-theme-alpine figure-surface overflow-hidden rounded-xl p-2 shadow-sm"
                style={{ height: 'calc(100vh - 280px)', width: '520px' }}
              >
                <AgGridReact<PathData>
                  rowData={plotData.paths as PathData[]}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  rowHeight={100}
                  headerHeight={48}
                  animateRows={true}
                  domLayout="normal"
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
