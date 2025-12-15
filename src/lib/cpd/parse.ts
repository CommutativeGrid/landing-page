import type { CPDDataset } from '../../data/cpd-data'

export interface CPDPoint {
  x: number
  y: number
  count: number
}

export interface CPDCoupling {
  x1: number
  y1: number
  x2: number
  y2: number
  weight: number
}

export interface ParsedCPDData {
  pdUpper: CPDPoint[]
  pdLower: CPDPoint[]
  couplings: CPDCoupling[]
  len: number
}

export function parseData(data: CPDDataset): ParsedCPDData {
  const upperPointMap = new Map<string, number>()
  const lowerPointMap = new Map<string, number>()
  const couplings: CPDCoupling[] = []

  const addToMap = (map: Map<string, number>, x: number, y: number, value: number) => {
    const key = `${x},${y}`
    map.set(key, (map.get(key) || 0) + value)
  }

  for (const [key, value] of Object.entries(data.dec)) {
    const parts = key.split(',').map(Number)

    if (parts.length === 4 && parts[1] === -1 && value !== 0) {
      const x = parts[2], y = parts[3]
      addToMap(lowerPointMap, x, y, value)
    } else if (parts.length === 4 && value !== 0) {
      const a = parts[0], b = parts[1], c = parts[2], d = parts[3]

      addToMap(lowerPointMap, a, b, Math.abs(value))
      addToMap(upperPointMap, c, d, Math.abs(value))

      if (!(a === c && b === d)) {
        couplings.push({
          x1: a, y1: b,
          x2: c, y2: d,
          weight: value
        })
      }
    }
  }

  const pdUpper: CPDPoint[] = []
  for (const [key, count] of upperPointMap) {
    const [x, y] = key.split(',').map(Number)
    pdUpper.push({ x, y, count })
  }

  const pdLower: CPDPoint[] = []
  for (const [key, count] of lowerPointMap) {
    const [x, y] = key.split(',').map(Number)
    pdLower.push({ x, y, count })
  }

  return { pdUpper, pdLower, couplings, len: data.len }
}

export function latexToUnicode(text: string): string {
  if (!text) return text

  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
    'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
    'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
    'v': 'ᵥ', 'x': 'ₓ'
  }

  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
    'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
    'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
    'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
    'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
    '+': '⁺', '-': '⁻'
  }

  let result = text.replace(/^\$|\$$/g, '')

  result = result.replace(/_\{([^}]+)\}/g, (_, content: string) => {
    return content.split('').map(c => subscripts[c] || c).join('')
  })
  result = result.replace(/_([a-z0-9])/gi, (_, char: string) => {
    return subscripts[char.toLowerCase()] || char
  })

  result = result.replace(/\^\{([^}]+)\}/g, (_, content: string) => {
    return content.split('').map(c => superscripts[c] || c).join('')
  })
  result = result.replace(/\^([a-z0-9+-])/gi, (_, char: string) => {
    return superscripts[char.toLowerCase()] || char
  })

  return result
}

export interface Filter {
  min: number | null
  max: number | null
}

export function passesFilter(count: number, filter: Filter): boolean {
  const { min, max } = filter
  const passesMin = min === null || count >= min
  const passesMax = max === null || count <= max
  return passesMin && passesMax
}
