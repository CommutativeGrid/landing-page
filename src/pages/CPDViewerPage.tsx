import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import CPD_DATA, { CPDDataset } from '@/data/cpd-data'

declare global {
  interface Window {
    Plotly: {
      newPlot: (
        element: HTMLElement,
        data: PlotlyData[],
        layout: PlotlyLayout,
        config?: PlotlyConfig
      ) => void
      react: (
        element: HTMLElement,
        data: PlotlyData[],
        layout: PlotlyLayout,
        config?: PlotlyConfig
      ) => void
    }
  }
}

interface PlotlyData {
  x: number[]
  y: number[]
  mode: string
  type: string
  marker?: {
    size: number | number[]
    color: string
    opacity?: number
  }
  line?: {
    color: string
    width: number
  }
  name?: string
  hoverinfo?: string
  text?: string[]
}

interface PlotlyLayout {
  title?: string
  xaxis?: {
    title?: string
    range?: [number, number]
    showgrid?: boolean
    zeroline?: boolean
  }
  yaxis?: {
    title?: string
    range?: [number, number]
    showgrid?: boolean
    zeroline?: boolean
  }
  showlegend?: boolean
  hovermode?: string
  shapes?: PlotlyShape[]
  width?: number
  height?: number
  margin?: {
    l?: number
    r?: number
    t?: number
    b?: number
  }
}

interface PlotlyShape {
  type: string
  x0: number
  y0: number
  x1: number
  y1: number
  line: {
    color: string
    width: number
    dash?: string
  }
}

interface PlotlyConfig {
  responsive?: boolean
  displayModeBar?: boolean
}

interface ParsedPoint {
  birth: number
  death: number
  count: number
  isConnected: boolean
  fromBirth?: number
  fromDeath?: number
}

function parseDataset(dataset: CPDDataset): ParsedPoint[] {
  const points: ParsedPoint[] = []
  const len = dataset.len

  for (const [key, count] of Object.entries(dataset.dec)) {
    if (count === 0) continue

    const parts = key.split(',').map(Number)

    if (parts[0] === len && parts[1] === -1) {
      points.push({
        birth: parts[2],
        death: parts[3],
        count: Math.abs(count),
        isConnected: false,
      })
    } else {
      points.push({
        birth: parts[2],
        death: parts[3],
        count: Math.abs(count),
        isConnected: true,
        fromBirth: parts[0],
        fromDeath: parts[1],
      })
    }
  }

  return points
}

function CPDViewerPage() {
  const [selectedDataset, setSelectedDataset] = useState<'SI100' | 'O50'>('SI100')
  const [showConnections, setShowConnections] = useState(true)
  const plotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plotRef.current || !window.Plotly) return

    const dataset = CPD_DATA[selectedDataset]
    const points = parseDataset(dataset)

    const singlePoints = points.filter((p) => !p.isConnected)
    const connectedPoints = points.filter((p) => p.isConnected)

    const traces: PlotlyData[] = []

    traces.push({
      x: singlePoints.map((p) => p.birth),
      y: singlePoints.map((p) => p.death),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: singlePoints.map((p) => Math.min(5 + p.count * 2, 20)),
        color: '#3b82f6',
        opacity: 0.7,
      },
      name: 'Persistence Points',
      text: singlePoints.map(
        (p) => `Birth: ${p.birth}, Death: ${p.death}, Count: ${p.count}`
      ),
      hoverinfo: 'text',
    })

    if (showConnections && connectedPoints.length > 0) {
      traces.push({
        x: connectedPoints.map((p) => p.birth),
        y: connectedPoints.map((p) => p.death),
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: connectedPoints.map((p) => Math.min(4 + p.count * 1.5, 15)),
          color: '#ef4444',
          opacity: 0.6,
        },
        name: 'Connected Points',
        text: connectedPoints.map(
          (p) =>
            `Birth: ${p.birth}, Death: ${p.death}, Count: ${p.count}, From: (${p.fromBirth}, ${p.fromDeath})`
        ),
        hoverinfo: 'text',
      })
    }

    const maxVal = dataset.len + 5
    const layout: PlotlyLayout = {
      title: `Connected Persistence Diagram - ${selectedDataset === 'SI100' ? 'Si 100% Deleted' : 'O 50% Deleted'}`,
      xaxis: {
        title: 'Birth',
        range: [0, maxVal],
        showgrid: true,
        zeroline: true,
      },
      yaxis: {
        title: 'Death',
        range: [0, maxVal],
        showgrid: true,
        zeroline: true,
      },
      showlegend: true,
      hovermode: 'closest',
      shapes: [
        {
          type: 'line',
          x0: 0,
          y0: 0,
          x1: maxVal,
          y1: maxVal,
          line: {
            color: '#9ca3af',
            width: 1,
            dash: 'dash',
          },
        },
      ],
      width: 700,
      height: 600,
      margin: {
        l: 60,
        r: 30,
        t: 50,
        b: 60,
      },
    }

    const config: PlotlyConfig = {
      responsive: true,
      displayModeBar: true,
    }

    window.Plotly.newPlot(plotRef.current, traces, layout, config)
  }, [selectedDataset, showConnections])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Connected Persistence Diagram Viewer
            </h1>
          </div>
          <Link to="/courses">
            <Button variant="outline" size="sm">
              View Courses
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dataset
                  </label>
                  <select
                    value={selectedDataset}
                    onChange={(e) =>
                      setSelectedDataset(e.target.value as 'SI100' | 'O50')
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SI100">SiO2 - Si 100% Deleted</option>
                    <option value="O50">SiO2 - O 50% Deleted</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showConnections"
                    checked={showConnections}
                    onChange={(e) => setShowConnections(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="showConnections"
                    className="text-sm text-gray-700"
                  >
                    Show Connected Points
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  This viewer displays Connected Persistence Diagrams (CPDs) for
                  SiO2 molecular structures. The diagrams show topological
                  features that persist across different scales.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Blue points:</strong> Standard persistence points
                  (birth, death)
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Red points:</strong> Connected persistence points with
                  relationships to other features
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Point size indicates the count/multiplicity of that feature.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div
                  ref={plotRef}
                  className="w-full flex items-center justify-center"
                  style={{ minHeight: '600px' }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            Data source:{' '}
            <a
              href="https://ar5iv.labs.arxiv.org/html/2310.03649"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Connected Persistence Diagrams for SiO2 Analysis
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default CPDViewerPage
