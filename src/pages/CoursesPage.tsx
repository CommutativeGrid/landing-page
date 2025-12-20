import { useState, useMemo, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Switch } from '@/components/ui/switch'
import { Home, TableProperties, LayoutGrid } from 'lucide-react'
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
      minWidth: 460,
      flex: 2,
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
      minWidth: 120,
      flex: 1,
      cellStyle: { textAlign: 'center' } as CellStyle
    },
    {
      headerName: 'Remark',
      field: 'remark',
      filter: CustomSetFilter,
      filterParams: {
        values: allRemarks
      },
      minWidth: 140,
      flex: 1,
      cellStyle: { textAlign: 'center' } as CellStyle
    }
  ], [typeComparator, allTypes, allRemarks])

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true
  }), [])

  const getTypeChipStyle = (type: string, isSelected: boolean) => {
    const colors: Record<string, { selected: string; dimmed: string }> = {
      'A1': { selected: 'bg-blue-100 text-blue-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' },
      'A2': { selected: 'bg-green-100 text-green-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' },
      'A3': { selected: 'bg-yellow-100 text-yellow-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' },
      'A4': { selected: 'bg-orange-100 text-orange-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' },
      'A5': { selected: 'bg-red-100 text-red-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' },
      'A6': { selected: 'bg-purple-100 text-purple-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' }
    }
    const colorSet = colors[type] || { selected: 'bg-gray-100 text-gray-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' }
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
      'source-sink': { selected: 'bg-cyan-100 text-cyan-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' },
      'corner-complete': { selected: 'bg-pink-100 text-pink-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' },
      'new': { selected: 'bg-emerald-100 text-emerald-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' }
    }
    const colorSet = colors[remark] || { selected: 'bg-gray-100 text-gray-800', dimmed: 'bg-gray-50 text-gray-300 opacity-50' }
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Type Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Type</span>
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

          <div className="w-px h-6 bg-gray-200" />

          {/* Remark Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Remark</span>
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
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={resetAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Reset
              </button>
              <span className="text-xs text-gray-400">
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
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))' }}>
        {filteredPaths.map((data, index) => {
          const svg = visualizeLattice(data.path, data.ss)
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
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
            <>
              {renderFilterChips()}
              {renderGallery()}
            </>
          ) : (
            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
              <AgGridReact<PathData>
                rowData={plotData.paths as PathData[]}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowHeight={200}
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
