import type { ParsedCPDData, CPDCoupling, Filter } from './parse'
import { latexToUnicode, passesFilter } from './parse'
import type { Data, Annotations, Layout } from 'plotly.js'

export const COLORSCALE_OPTIONS = [
  'YlOrRd', 'YlGnBu', 'RdBu', 'Portland', 'Picnic',
  'Jet', 'Hot', 'Greys', 'Greens',
  'Electric', 'Earth', 'Bluered', 'Blackbody'
] as const

export type ColorscaleName = typeof COLORSCALE_OPTIONS[number]

export const COLORSCALE_GRADIENTS: Record<ColorscaleName, string> = {
  'YlOrRd': 'linear-gradient(to right, #800026, #bd0026, #fc4e2a, #feb24c, #fed976, #ffffcc)',
  'YlGnBu': 'linear-gradient(to right, #081d58, #253494, #1d91c0, #7fcdbb, #c7e9b4, #ffffd9)',
  'RdBu': 'linear-gradient(to right, #050aac, #6a89f7, #bebebe, #e69a5a, #b20a1c)',
  'Portland': 'linear-gradient(to right, #0c3383, #0a88ba, #f2d338, #f28f38, #d91e1e)',
  'Picnic': 'linear-gradient(to right, #0000ff, #66ccff, #ffffff, #ff99ff, #ff0000)',
  'Jet': 'linear-gradient(to right, #000083, #003caa, #05ffff, #ffff00, #fa0000, #800000)',
  'Hot': 'linear-gradient(to right, #000000, #e60000, #ffd200, #ffffff)',
  'Greys': 'linear-gradient(to right, #000000, #ffffff)',
  'Greens': 'linear-gradient(to right, #00441b, #006d2c, #74c476, #c7e9c0, #f7fcf5)',
  'Electric': 'linear-gradient(to right, #000000, #1e0064, #780064, #a05a00, #e6c800, #fffadc)',
  'Earth': 'linear-gradient(to right, #000082, #00b4b4, #28d228, #e6e632, #784614, #ffffff)',
  'Bluered': 'linear-gradient(to right, #0000ff, #ff0000)',
  'Blackbody': 'linear-gradient(to right, #000000, #e60000, #e6d200, #ffffff, #a0c8ff)'
}

const COLOR_SCHEMES: Record<string, number[][]> = {
  'YlOrRd': [[128,0,38], [189,0,38], [252,78,42], [254,178,76], [255,237,160], [255,255,204]],
  'YlGnBu': [[8,29,88], [37,52,148], [29,145,192], [127,205,187], [199,233,180], [255,255,217]],
  'RdBu': [[5,10,172], [106,137,247], [190,190,190], [220,170,132], [178,10,28]],
  'Portland': [[12,51,131], [10,136,186], [242,211,56], [242,143,56], [217,30,30]],
  'Picnic': [[0,0,255], [102,204,255], [255,255,255], [255,153,255], [255,0,0]],
  'Jet': [[0,0,131], [0,60,170], [5,255,255], [255,255,0], [250,0,0], [128,0,0]],
  'Hot': [[0,0,0], [230,0,0], [255,210,0], [255,255,255]],
  'Greys': [[0,0,0], [255,255,255]],
  'Greens': [[0,68,27], [0,109,44], [116,196,118], [199,233,192], [247,252,245]],
  'Electric': [[0,0,0], [30,0,100], [120,0,100], [160,90,0], [230,200,0], [255,250,220]],
  'Earth': [[0,0,130], [0,180,180], [40,210,40], [230,230,50], [120,70,20], [255,255,255]],
  'Bluered': [[0,0,255], [255,0,0]],
  'Blackbody': [[0,0,0], [230,0,0], [230,210,0], [255,255,255], [160,200,255]]
}

function getSchemeColor(normalizedValue: number, scheme: string): string {
  const stops = COLOR_SCHEMES[scheme] || COLOR_SCHEMES['YlOrRd']
  const idx = normalizedValue * (stops.length - 1)
  const low = Math.floor(idx)
  const high = Math.min(Math.ceil(idx), stops.length - 1)
  const t = idx - low
  const r = Math.round(stops[low][0] * (1-t) + stops[high][0] * t)
  const g = Math.round(stops[low][1] * (1-t) + stops[high][1] * t)
  const b = Math.round(stops[low][2] * (1-t) + stops[high][2] * t)
  return `rgb(${r}, ${g}, ${b})`
}

export const MARKER_SHAPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'cross', label: 'Cross' },
  { value: 'x', label: 'X' },
  { value: 'triangle-up', label: 'Triangle Up' },
  { value: 'triangle-down', label: 'Triangle Down' },
  { value: 'star', label: 'Star' }
] as const

export interface PlotOptions {
  layout: 'overlapping' | 'complementary'
  upperName: string
  lowerName: string
  lineName: string
  upperColorscale: ColorscaleName
  lowerColorscale: ColorscaleName
  sameColorscale: boolean
  upperFilter: Filter
  lowerFilter: Filter
  lineColorMode: 'single' | 'scale'
  lineSingleColor: string
  lineColorscale: ColorscaleName
  lineFilter: Filter
  upperLifetimeMin: number
  upperLifetimeMax: number
  lowerLifetimeMin: number
  lowerLifetimeMax: number
  pointSize: number
  upperOpacity: number
  lowerOpacity: number
  upperShape: string
  lowerShape: string
  lineOpacity: number
  lineWidth: number
  showGrid: boolean
  showDiagonal: boolean
  showFrame: boolean
  gridStep: number
  plotTitle: string
  labelTop: string
  labelBottom: string
  labelLeft: string
  labelRight: string
}

export function createTraces(parsedData: ParsedCPDData, options: PlotOptions): Data[] {
  const traces: Data[] = []
  const { pdUpper, pdLower, couplings, len } = parsedData
  const {
    layout, upperName, lowerName, lineName,
    upperColorscale, lowerColorscale, sameColorscale,
    upperFilter, lowerFilter,
    lineColorMode, lineSingleColor, lineColorscale, lineFilter,
    upperLifetimeMin, upperLifetimeMax, lowerLifetimeMin, lowerLifetimeMax,
    pointSize, upperOpacity, lowerOpacity,
    upperShape, lowerShape,
    lineOpacity, lineWidth, showDiagonal
  } = options

  const isComplementary = layout === 'complementary'
  const lineNameDisplay = latexToUnicode(lineName)
  const upperNameDisplay = latexToUnicode(upperName)
  const lowerNameDisplay = latexToUnicode(lowerName)

  if (showDiagonal) {
    traces.push({
      x: [0, len],
      y: [0, len],
      mode: 'lines',
      line: { color: '#333', width: 1.5 },
      hoverinfo: 'skip',
      showlegend: false
    } as Data)
  }

  if (couplings.length > 0) {
    const filteredCouplings = couplings.filter(c => passesFilter(c.weight, lineFilter))

    if (lineColorMode === 'single' && filteredCouplings.length > 0) {
      const hex = lineSingleColor
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const color = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`

      const lineX: (number | null)[] = []
      const lineY: (number | null)[] = []
      const hoverX: number[] = []
      const hoverY: number[] = []
      const hoverText: string[] = []

      for (const c of filteredCouplings) {
        let x1 = c.x1, y1 = c.y1
        const x2 = c.x2, y2 = c.y2
        if (isComplementary) {
          [x1, y1] = [y1, x1]
        }
        lineX.push(x1, x2, null)
        lineY.push(y1, y2, null)

        hoverX.push((x1 + x2) / 2)
        hoverY.push((y1 + y2) / 2)
        hoverText.push(`${lineNameDisplay}<br>${upperNameDisplay}: (${c.x2}, ${c.y2})<br>${lowerNameDisplay}: (${c.x1}, ${c.y1})<br>Multiplicity: ${c.weight}`)
      }

      if (lineX.length > 0) {
        traces.push({
          x: lineX,
          y: lineY,
          mode: 'lines',
          line: { color: color, width: lineWidth },
          hoverinfo: 'skip',
          showlegend: true,
          name: lineNameDisplay
        } as Data)

        traces.push({
          x: hoverX,
          y: hoverY,
          mode: 'markers',
          marker: { size: 1, opacity: 0 },
          text: hoverText,
          hoverinfo: 'text',
          showlegend: false
        } as Data)
      }
    } else if (lineColorMode === 'scale' && filteredCouplings.length > 0) {
      const schemeName = lineColorscale
      const weights = filteredCouplings.map(c => c.weight)
      const minWeight = Math.min(...weights)
      const maxWeight = Math.max(...weights)
      const weightRange = maxWeight - minWeight

      const weightGroups = new Map<number, CPDCoupling[]>()
      for (const c of filteredCouplings) {
        const w = c.weight
        if (!weightGroups.has(w)) {
          weightGroups.set(w, [])
        }
        weightGroups.get(w)!.push(c)
      }

      const hoverX: number[] = []
      const hoverY: number[] = []
      const hoverText: string[] = []

      for (const [weight, group] of weightGroups) {
        const normalizedWeight = weightRange > 0 ? (weight - minWeight) / weightRange : 0.5
        const lineColor = getSchemeColor(normalizedWeight, schemeName)
        const colorWithOpacity = lineColor.replace('rgb', 'rgba').replace(')', `, ${lineOpacity})`)

        const lineX: (number | null)[] = []
        const lineY: (number | null)[] = []

        for (const c of group) {
          let x1 = c.x1, y1 = c.y1
          const x2 = c.x2, y2 = c.y2
          if (isComplementary) {
            [x1, y1] = [y1, x1]
          }
          lineX.push(x1, x2, null)
          lineY.push(y1, y2, null)

          hoverX.push((x1 + x2) / 2)
          hoverY.push((y1 + y2) / 2)
          hoverText.push(`${lineNameDisplay}<br>${upperNameDisplay}: (${c.x2}, ${c.y2})<br>${lowerNameDisplay}: (${c.x1}, ${c.y1})<br>Multiplicity: ${c.weight}`)
        }

        traces.push({
          x: lineX,
          y: lineY,
          mode: 'lines',
          line: { color: colorWithOpacity, width: lineWidth },
          hoverinfo: 'skip',
          showlegend: false
        } as Data)
      }

      traces.push({
        x: hoverX,
        y: hoverY,
        mode: 'markers',
        marker: { size: 1, opacity: 0 },
        text: hoverText,
        hoverinfo: 'text',
        showlegend: true,
        name: lineNameDisplay
      } as Data)
    }
  }

  const filteredUpper = pdUpper.filter(p => {
    const lifetime = p.y - p.x
    const maxCheck = upperLifetimeMax > 0 ? lifetime <= upperLifetimeMax : true
    return passesFilter(p.count, upperFilter) && lifetime >= upperLifetimeMin && maxCheck
  })

  if (filteredUpper.length > 0) {
    const upperX = filteredUpper.map(p => p.x)
    const upperY = filteredUpper.map(p => p.y)
    const upperCounts = filteredUpper.map(p => p.count)
    const minCount = Math.min(...upperCounts)
    const maxCount = Math.max(...upperCounts)

    const upperMarkerConfig: Record<string, unknown> = {
      size: pointSize,
      symbol: upperShape,
      opacity: upperOpacity,
      color: upperCounts,
      colorscale: sameColorscale ? upperColorscale : upperColorscale,
      cmin: minCount,
      cmax: maxCount,
      colorbar: {
        title: upperNameDisplay,
        titleside: 'right',
        thickness: 12,
        len: 0.8,
        x: sameColorscale ? 0.89 : 0.89,
        y: 0.5,
        xanchor: 'left',
        tickfont: { size: 9 }
      }
    }

    traces.push({
      type: 'scatter',
      x: upperX,
      y: upperY,
      mode: 'markers',
      marker: upperMarkerConfig,
      text: filteredUpper.map(p => `${latexToUnicode(upperName)}<br>Birth: ${p.x}<br>Death: ${p.y}<br>Count: ${p.count}`),
      hoverinfo: 'text',
      showlegend: true,
      name: upperNameDisplay
    } as Data)
  }

  const filteredLower = pdLower.filter(p => {
    const lifetime = p.y - p.x
    const maxCheck = lowerLifetimeMax > 0 ? lifetime <= lowerLifetimeMax : true
    return passesFilter(p.count, lowerFilter) && lifetime >= lowerLifetimeMin && maxCheck
  })

  if (filteredLower.length > 0) {
    const lowerX = isComplementary ? filteredLower.map(p => p.y) : filteredLower.map(p => p.x)
    const lowerY = isComplementary ? filteredLower.map(p => p.x) : filteredLower.map(p => p.y)
    const lowerCounts = filteredLower.map(p => p.count)
    const minCount = Math.min(...lowerCounts)
    const maxCount = Math.max(...lowerCounts)

    const lowerMarkerConfig: Record<string, unknown> = {
      size: pointSize,
      symbol: lowerShape,
      opacity: lowerOpacity,
      color: lowerCounts,
      colorscale: sameColorscale ? upperColorscale : lowerColorscale,
      cmin: minCount,
      cmax: maxCount
    }

    if (!sameColorscale) {
      lowerMarkerConfig.colorbar = {
        title: lowerNameDisplay,
        titleside: 'right',
        thickness: 12,
        len: 0.8,
        x: 0.96,
        y: 0.5,
        xanchor: 'left',
        tickfont: { size: 9 }
      }
    }

    traces.push({
      type: 'scatter',
      x: lowerX,
      y: lowerY,
      mode: 'markers',
      marker: lowerMarkerConfig,
      text: filteredLower.map(p => `${latexToUnicode(lowerName)}<br>Birth: ${p.x}<br>Death: ${p.y}<br>Count: ${p.count}`),
      hoverinfo: 'text',
      showlegend: true,
      name: lowerNameDisplay
    } as Data)
  }

  if (lineColorMode === 'scale' && couplings.length > 0) {
    const colorbarFilteredCouplings = couplings.filter(c => passesFilter(c.weight, lineFilter))
    if (colorbarFilteredCouplings.length > 0) {
      const colorbarWeights = colorbarFilteredCouplings.map(c => c.weight)
      const minWeight = Math.min(...colorbarWeights)
      const maxWeight = Math.max(...colorbarWeights)
      const schemeName = lineColorscale

      const connectionsColorbarX = sameColorscale ? 0.89 : 0.96

      traces.push({
        x: [null],
        y: [null],
        mode: 'markers',
        marker: {
          size: 0,
          color: [minWeight, maxWeight],
          colorscale: schemeName,
          cmin: minWeight,
          cmax: maxWeight,
          colorbar: {
            title: lineName,
            titleside: 'right',
            thickness: 12,
            len: 0.8,
            x: connectionsColorbarX,
            y: 0.5,
            xanchor: 'left',
            tickfont: { size: 9 }
          }
        },
        hoverinfo: 'skip',
        showlegend: false
      } as Data)
    }
  }

  return traces
}

export function createLayout(len: number, options: PlotOptions): Partial<Layout> {
  const {
    showGrid, showFrame, gridStep, plotTitle,
    labelTop, labelBottom, labelLeft, labelRight,
    upperLifetimeMin, upperLifetimeMax, lowerLifetimeMin, lowerLifetimeMax, upperName, lowerName
  } = options

  const annotations: Partial<Annotations>[] = []

  if (labelTop) {
    annotations.push({
      text: labelTop,
      x: 0.44,
      y: 1.01,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'center',
      yanchor: 'bottom',
      showarrow: false,
      font: { size: 14 }
    })
  }

  if (labelBottom) {
    annotations.push({
      text: labelBottom,
      x: 0.44,
      y: -0.02,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'center',
      yanchor: 'top',
      showarrow: false,
      font: { size: 14 }
    })
  }

  if (labelLeft) {
    annotations.push({
      text: labelLeft,
      x: 0.11,
      y: 0.5,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'center',
      yanchor: 'middle',
      textangle: '-90' as Annotations['textangle'],
      showarrow: false,
      font: { size: 14 }
    })
  }

  if (labelRight) {
    annotations.push({
      text: labelRight,
      x: 0.77,
      y: 0.5,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'center',
      yanchor: 'middle',
      textangle: '90' as Annotations['textangle'],
      showarrow: false,
      font: { size: 14 }
    })
  }

  const hasLifetimeFilter = upperLifetimeMin > 0 || upperLifetimeMax > 0 || lowerLifetimeMin > 0 || lowerLifetimeMax > 0
  if (hasLifetimeFilter) {
    const formatRange = (min: number, max: number) => {
      if (min > 0 && max > 0) return `${min}≤lifetime≤${max}`
      if (min > 0) return `lifetime≥${min}`
      if (max > 0) return `lifetime≤${max}`
      return ''
    }
    const upperText = formatRange(upperLifetimeMin, upperLifetimeMax)
    const lowerText = formatRange(lowerLifetimeMin, lowerLifetimeMax)
    const lifetimeText = [
      upperText ? `${latexToUnicode(upperName)} ${upperText}` : '',
      lowerText ? `${latexToUnicode(lowerName)} ${lowerText}` : ''
    ].filter(Boolean).join('<br>')

    annotations.push({
      text: lifetimeText,
      x: 0.88,
      y: 0.08,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'center',
      yanchor: 'top',
      showarrow: false,
      font: { size: 10, color: '#666' }
    })
  }

  return {
    title: {
      text: plotTitle,
      font: { size: 18 },
      x: 0.45,
      y: 0.99,
      xanchor: 'center',
      yanchor: 'top'
    },
    xaxis: {
      range: [0, len],
      autorange: false,
      constrain: 'domain',
      showgrid: showGrid,
      gridcolor: '#ccc',
      zeroline: false,
      scaleanchor: 'y',
      scaleratio: 1,
      showticklabels: showGrid,
      ticks: showGrid ? 'outside' : '',
      dtick: gridStep,
      tick0: 0,
      showline: showFrame,
      linecolor: '#333',
      linewidth: 1,
      mirror: showFrame,
      fixedrange: true,
      domain: [0, 0.88]
    },
    yaxis: {
      range: [0, len],
      autorange: false,
      constrain: 'domain',
      showgrid: showGrid,
      gridcolor: '#ccc',
      zeroline: false,
      showticklabels: showGrid,
      ticks: showGrid ? 'outside' : '',
      dtick: gridStep,
      tick0: 0,
      showline: showFrame,
      linecolor: '#333',
      linewidth: 1,
      mirror: showFrame,
      fixedrange: true
    },
    hovermode: 'closest',
    showlegend: true,
    legend: {
      x: 0.63,
      y: 1.02,
      xanchor: 'center',
      yanchor: 'bottom',
      orientation: 'h'
    },
    annotations,
    margin: { l: 60, r: 40, t: 80, b: 50 },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  }
}

export const DATASET_NAMES: Record<string, string> = {
  'SI100': 'SiO2_Si-all-removed',
  'O50': 'SiO2_O-half-removed'
}

export function getExportFilename(
  dataset: string,
  layout: string,
  showGrid: boolean,
  gridStep: number,
  showFrame: boolean,
  upperLifetime: number,
  lowerLifetime: number
): string {
  const layoutName = layout === 'complementary' ? 'mirrored' : 'stacked'
  const datasetName = DATASET_NAMES[dataset] || dataset
  const gridPart = showGrid ? `grid${gridStep}` : 'nogrid'
  const framePart = showFrame ? 'frame' : 'noframe'
  const lifetimePart = (upperLifetime > 0 || lowerLifetime > 0)
    ? `_lifetime-D2ge${upperLifetime}-D1ge${lowerLifetime}`
    : ''

  return `cPD_${datasetName}_${layoutName}_${gridPart}_${framePart}${lifetimePart}`
}
