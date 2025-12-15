import { useState, useEffect, useRef, useCallback } from 'react'
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-dist-min'
import { DATA_SI100, DATA_O50, type CPDDataset } from '../data/cpd-data'
import { parseData, type Filter } from '../lib/cpd/parse'
import {
  createTraces,
  createLayout,
  getExportFilename,
  COLORSCALE_OPTIONS,
  COLORSCALE_GRADIENTS,
  MARKER_SHAPES,
  type PlotOptions,
  type ColorscaleName
} from '../lib/cpd/plot'

const datasets: Record<string, CPDDataset> = {
  SI100: DATA_SI100,
  O50: DATA_O50
}

export default function CPDViewerPage() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(true)

  const [dataset, setDataset] = useState<string>('SI100')
  const [layoutMode, setLayoutMode] = useState<'overlapping' | 'complementary'>('overlapping')

  const [showGrid, setShowGrid] = useState(true)
  const [showDiagonal, setShowDiagonal] = useState(true)
  const [showFrame, setShowFrame] = useState(true)
  const [gridStep, setGridStep] = useState(10)

  const [plotTitle, setPlotTitle] = useState('')
  const [labelTop, setLabelTop] = useState('')
  const [labelBottom, setLabelBottom] = useState('Birth')
  const [labelLeft, setLabelLeft] = useState('Death')
  const [labelRight, setLabelRight] = useState('')

  const [sameColorscale, setSameColorscale] = useState(true)
  const [sharedColorscale, setSharedColorscale] = useState<ColorscaleName>('YlOrRd')
  const [upperColorscale, setUpperColorscale] = useState<ColorscaleName>('YlOrRd')
  const [lowerColorscale, setLowerColorscale] = useState<ColorscaleName>('YlGnBu')

  const [upperName, setUpperName] = useState('$D_2$')
  const [lowerName, setLowerName] = useState('$D_1$')
  const [lineName, setLineName] = useState('Connections')

  const [pointSize, setPointSize] = useState(8)
  const [upperOpacity, setUpperOpacity] = useState(0.8)
  const [lowerOpacity, setLowerOpacity] = useState(0.8)
  const [upperShape, setUpperShape] = useState('circle')
  const [lowerShape, setLowerShape] = useState('circle')

  const [upperFilterMin, setUpperFilterMin] = useState<string>('')
  const [upperFilterMax, setUpperFilterMax] = useState<string>('')
  const [lowerFilterMin, setLowerFilterMin] = useState<string>('')
  const [lowerFilterMax, setLowerFilterMax] = useState<string>('')
  const [upperLifetimeMin, setUpperLifetimeMin] = useState(0)
  const [lowerLifetimeMin, setLowerLifetimeMin] = useState(0)

  const [lineColorMode, setLineColorMode] = useState<'single' | 'scale'>('single')
  const [lineSingleColor, setLineSingleColor] = useState('#888888')
  const [lineColorscale, setLineColorscale] = useState<ColorscaleName>('YlOrRd')
  const [lineFilterMin, setLineFilterMin] = useState<string>('')
  const [lineFilterMax, setLineFilterMax] = useState<string>('')
  const [lineOpacity, setLineOpacity] = useState(0.5)
  const [lineWidth, setLineWidth] = useState(1)

  const getFilter = useCallback((minStr: string, maxStr: string): Filter => {
    const min = minStr === '' ? null : parseFloat(minStr)
    const max = maxStr === '' ? null : parseFloat(maxStr)
    return { min, max }
  }, [])

  const currentData = datasets[dataset]
  const parsedData = parseData(currentData)

  const options: PlotOptions = {
    layout: layoutMode,
    upperName,
    lowerName,
    lineName,
    upperColorscale: sameColorscale ? sharedColorscale : upperColorscale,
    lowerColorscale: sameColorscale ? sharedColorscale : lowerColorscale,
    sameColorscale,
    upperFilter: getFilter(upperFilterMin, upperFilterMax),
    lowerFilter: getFilter(lowerFilterMin, lowerFilterMax),
    lineColorMode,
    lineSingleColor,
    lineColorscale,
    lineFilter: getFilter(lineFilterMin, lineFilterMax),
    upperLifetimeMin,
    lowerLifetimeMin,
    pointSize,
    upperOpacity,
    lowerOpacity,
    upperShape,
    lowerShape,
    lineOpacity,
    lineWidth,
    showGrid,
    showDiagonal,
    showFrame,
    gridStep,
    plotTitle,
    labelTop,
    labelBottom,
    labelLeft,
    labelRight
  }

  const traces = createTraces(parsedData, options)
  const plotLayout = createLayout(currentData.len, options)

  const handleExportSVG = useCallback(() => {
    const filename = getExportFilename(dataset, layoutMode, showGrid, gridStep, showFrame, upperLifetimeMin, lowerLifetimeMin)
    if (plotRef.current) {
      Plotly.downloadImage(plotRef.current, {
        format: 'svg',
        filename,
        height: plotRef.current.offsetHeight || 800,
        width: plotRef.current.offsetWidth || 800
      })
    }
  }, [dataset, layoutMode, showGrid, gridStep, showFrame, upperLifetimeMin, lowerLifetimeMin])

  const handleExportPNG = useCallback(() => {
    const filename = getExportFilename(dataset, layoutMode, showGrid, gridStep, showFrame, upperLifetimeMin, lowerLifetimeMin)
    if (plotRef.current) {
      Plotly.downloadImage(plotRef.current, {
        format: 'png',
        filename,
        height: plotRef.current.offsetHeight || 800,
        width: plotRef.current.offsetWidth || 800
      } as Parameters<typeof Plotly.downloadImage>[1])
    }
  }, [dataset, layoutMode, showGrid, gridStep, showFrame, upperLifetimeMin, lowerLifetimeMin])

  useEffect(() => {
    const handleResize = () => {
      if (plotRef.current) {
        Plotly.Plots.resize(plotRef.current)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              menuOpen ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Connected Persistence Diagram Viewer</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium">Dataset:</label>
          <select
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            className="h-8 px-3 border border-gray-300 rounded text-sm bg-white"
          >
            <option value="SI100">SiO2 - Si 100% removed</option>
            <option value="O50">SiO2 - O 50% removed</option>
          </select>
        </div>
      </header>

      <div className="flex">
        <div
          className={`fixed left-0 top-[57px] w-[340px] h-[calc(100vh-57px)] bg-white border-r border-gray-200 shadow-md z-50 overflow-y-auto transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-5">
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 -mx-5 -mt-5 mb-5 flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Visualization Settings
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-sm"></span>
                Layout Mode
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all bg-white border-gray-200 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="layout"
                    value="overlapping"
                    checked={layoutMode === 'overlapping'}
                    onChange={() => setLayoutMode('overlapping')}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
                    <circle cx="8" cy="16" r="2" fill="currentColor" />
                    <circle cx="16" cy="8" r="2" fill="currentColor" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Overlapping</div>
                    <div className="text-xs text-gray-400">D1 and D2 on same axes</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all bg-white border-gray-200 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="layout"
                    value="complementary"
                    checked={layoutMode === 'complementary'}
                    onChange={() => setLayoutMode('complementary')}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
                    <line x1="3" y1="21" x2="21" y2="3" strokeWidth={2} />
                    <circle cx="8" cy="16" r="2" fill="currentColor" />
                    <circle cx="16" cy="8" r="2" fill="currentColor" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Complementary</div>
                    <div className="text-xs text-gray-400">D1 mirrored below diagonal</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-sm"></span>
                Display Options
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Show Grid</span>
                </label>
                {showGrid && (
                  <div className="flex items-center gap-2 ml-6">
                    <span className="text-xs text-gray-400">Step:</span>
                    {[5, 10, 20].map((step) => (
                      <button
                        key={step}
                        onClick={() => setGridStep(step)}
                        className={`px-2 py-1 text-xs border rounded transition-all ${
                          gridStep === step
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDiagonal}
                    onChange={(e) => setShowDiagonal(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Show Diagonal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFrame}
                    onChange={(e) => setShowFrame(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Show Frame</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-sm"></span>
                Labels
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Title</label>
                  <input
                    type="text"
                    value={plotTitle}
                    onChange={(e) => setPlotTitle(e.target.value)}
                    placeholder="Plot title"
                    className="w-full h-9 px-3 border border-gray-200 rounded text-sm mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Top</label>
                    <input
                      type="text"
                      value={labelTop}
                      onChange={(e) => setLabelTop(e.target.value)}
                      className="w-full h-9 px-3 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Bottom</label>
                    <input
                      type="text"
                      value={labelBottom}
                      onChange={(e) => setLabelBottom(e.target.value)}
                      className="w-full h-9 px-3 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Left</label>
                    <input
                      type="text"
                      value={labelLeft}
                      onChange={(e) => setLabelLeft(e.target.value)}
                      className="w-full h-9 px-3 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Right</label>
                    <input
                      type="text"
                      value={labelRight}
                      onChange={(e) => setLabelRight(e.target.value)}
                      className="w-full h-9 px-3 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-sm"></span>
                Points Configuration
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={sameColorscale}
                    onChange={(e) => setSameColorscale(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Same colorscale for both</span>
                </label>
                {sameColorscale && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Shared Colorscale</label>
                    <select
                      value={sharedColorscale}
                      onChange={(e) => setSharedColorscale(e.target.value as ColorscaleName)}
                      className="w-full h-9 px-3 border border-gray-200 rounded text-sm mt-1"
                    >
                      {COLORSCALE_OPTIONS.map((cs) => (
                        <option key={cs} value={cs}>{cs}</option>
                      ))}
                    </select>
                    <div
                      className="h-3 rounded mt-1"
                      style={{ background: COLORSCALE_GRADIENTS[sharedColorscale] }}
                    />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Point Size</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={pointSize}
                    onChange={(e) => setPointSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-8">{pointSize}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Upper Diagram (D2)</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                    <input
                      type="text"
                      value={upperName}
                      onChange={(e) => setUpperName(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  {!sameColorscale && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Colorscale</label>
                      <select
                        value={upperColorscale}
                        onChange={(e) => setUpperColorscale(e.target.value as ColorscaleName)}
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      >
                        {COLORSCALE_OPTIONS.map((cs) => (
                          <option key={cs} value={cs}>{cs}</option>
                        ))}
                      </select>
                      <div
                        className="h-2 rounded mt-1"
                        style={{ background: COLORSCALE_GRADIENTS[upperColorscale] }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Shape</label>
                    <select
                      value={upperShape}
                      onChange={(e) => setUpperShape(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    >
                      {MARKER_SHAPES.map((shape) => (
                        <option key={shape.value} value={shape.value}>{shape.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Filter Min</label>
                      <input
                        type="number"
                        value={upperFilterMin}
                        onChange={(e) => setUpperFilterMin(e.target.value)}
                        placeholder="Min"
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Filter Max</label>
                      <input
                        type="number"
                        value={upperFilterMax}
                        onChange={(e) => setUpperFilterMax(e.target.value)}
                        placeholder="Max"
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Opacity</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={upperOpacity}
                        onChange={(e) => setUpperOpacity(parseFloat(e.target.value))}
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Lifetime Min</label>
                      <input
                        type="number"
                        min="0"
                        value={upperLifetimeMin}
                        onChange={(e) => setUpperLifetimeMin(parseFloat(e.target.value) || 0)}
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Lower Diagram (D1)</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                    <input
                      type="text"
                      value={lowerName}
                      onChange={(e) => setLowerName(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  {!sameColorscale && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Colorscale</label>
                      <select
                        value={lowerColorscale}
                        onChange={(e) => setLowerColorscale(e.target.value as ColorscaleName)}
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      >
                        {COLORSCALE_OPTIONS.map((cs) => (
                          <option key={cs} value={cs}>{cs}</option>
                        ))}
                      </select>
                      <div
                        className="h-2 rounded mt-1"
                        style={{ background: COLORSCALE_GRADIENTS[lowerColorscale] }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Shape</label>
                    <select
                      value={lowerShape}
                      onChange={(e) => setLowerShape(e.target.value)}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    >
                      {MARKER_SHAPES.map((shape) => (
                        <option key={shape.value} value={shape.value}>{shape.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Filter Min</label>
                      <input
                        type="number"
                        value={lowerFilterMin}
                        onChange={(e) => setLowerFilterMin(e.target.value)}
                        placeholder="Min"
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Filter Max</label>
                      <input
                        type="number"
                        value={lowerFilterMax}
                        onChange={(e) => setLowerFilterMax(e.target.value)}
                        placeholder="Max"
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Opacity</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={lowerOpacity}
                        onChange={(e) => setLowerOpacity(parseFloat(e.target.value))}
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Lifetime Min</label>
                      <input
                        type="number"
                        min="0"
                        value={lowerLifetimeMin}
                        onChange={(e) => setLowerLifetimeMin(parseFloat(e.target.value) || 0)}
                        className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-sm"></span>
                Connections Configuration
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                  <input
                    type="text"
                    value={lineName}
                    onChange={(e) => setLineName(e.target.value)}
                    className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Color Mode</label>
                  <div className="flex gap-2 mt-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="lineColorMode"
                        value="single"
                        checked={lineColorMode === 'single'}
                        onChange={() => setLineColorMode('single')}
                        className="w-3 h-3"
                      />
                      <span className="text-sm text-gray-600">Single</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="lineColorMode"
                        value="scale"
                        checked={lineColorMode === 'scale'}
                        onChange={() => setLineColorMode('scale')}
                        className="w-3 h-3"
                      />
                      <span className="text-sm text-gray-600">By Weight</span>
                    </label>
                  </div>
                </div>
                {lineColorMode === 'single' ? (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Color</label>
                    <input
                      type="color"
                      value={lineSingleColor}
                      onChange={(e) => setLineSingleColor(e.target.value)}
                      className="w-full h-8 mt-1 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Colorscale</label>
                    <select
                      value={lineColorscale}
                      onChange={(e) => setLineColorscale(e.target.value as ColorscaleName)}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    >
                      {COLORSCALE_OPTIONS.map((cs) => (
                        <option key={cs} value={cs}>{cs}</option>
                      ))}
                    </select>
                    <div
                      className="h-2 rounded mt-1"
                      style={{ background: COLORSCALE_GRADIENTS[lineColorscale] }}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Filter Min</label>
                    <input
                      type="number"
                      value={lineFilterMin}
                      onChange={(e) => setLineFilterMin(e.target.value)}
                      placeholder="Min"
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Filter Max</label>
                    <input
                      type="number"
                      value={lineFilterMax}
                      onChange={(e) => setLineFilterMax(e.target.value)}
                      placeholder="Max"
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={lineOpacity}
                      onChange={(e) => setLineOpacity(parseFloat(e.target.value))}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Width</label>
                    <input
                      type="number"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-sm"></span>
                Export
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportSVG}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export SVG
                </button>
                <button
                  onClick={handleExportPNG}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Export PNG
                </button>
              </div>
            </div>
          </div>
        </div>

        <main
          className={`flex-1 p-5 transition-all duration-300 ${menuOpen ? 'ml-[340px]' : 'ml-0'}`}
        >
          <div className="bg-white rounded-lg shadow p-5 h-[calc(100vh-97px)]">
            <div ref={plotRef} className="w-full h-full">
              <Plot
                data={traces}
                layout={plotLayout}
                config={{
                  responsive: true,
                  toImageButtonOptions: {
                    format: 'svg',
                    filename: getExportFilename(dataset, layoutMode, showGrid, gridStep, showFrame, upperLifetimeMin, lowerLifetimeMin),
                    scale: 2
                  }
                }}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler={true}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
