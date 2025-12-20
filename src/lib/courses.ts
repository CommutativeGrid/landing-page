import * as d3 from 'd3'

interface Instruction {
  type: string
  from: { x: number; y: number; x_shifted?: number; y_shifted?: number }
  to: { x: number; y: number; x_shifted?: number; y_shifted?: number }
}

function arrowsOverlap(arrow1: Instruction, arrow2: Instruction): boolean {
  if (arrow1.type === 'M' || arrow2.type === 'M') {
    return (
      arrow1.from.x === arrow2.from.x &&
      arrow1.from.y === arrow2.from.y &&
      arrow1.to.x === arrow2.to.x &&
      arrow1.to.y === arrow2.to.y
    )
  }

  if (arrow1.from.y === arrow2.from.y && arrow1.to.y === arrow2.to.y) {
    return (
      (arrow1.from.x <= arrow2.to.x && arrow1.to.x >= arrow2.from.x) ||
      (arrow2.from.x <= arrow1.to.x && arrow2.to.x >= arrow1.from.x)
    )
  }
  return false
}

const overlapOffset = 0.05

function adjustArrowPositions(instructions: Instruction[]): Instruction[] {
  const overlaps: [number, number][] = []
  for (let i = 0; i < instructions.length; i++) {
    for (let j = i + 1; j < instructions.length; j++) {
      if (arrowsOverlap(instructions[i], instructions[j])) {
        overlaps.push([i, j])
      }
    }
  }

  for (const [i, j] of overlaps) {
    if (instructions[i].type !== 'M') {
      instructions[i].from.y_shifted = instructions[i].from.y - overlapOffset
      instructions[i].to.y_shifted = instructions[i].to.y - overlapOffset
      instructions[j].from.y_shifted = instructions[j].from.y + overlapOffset
      instructions[j].to.y_shifted = instructions[j].to.y + overlapOffset
    } else if (instructions[i].type === 'M' && instructions[i].from.x === instructions[i].to.x) {
      instructions[i].from.x_shifted = instructions[i].from.x - overlapOffset
      instructions[i].to.x_shifted = instructions[i].to.x - overlapOffset
      instructions[j].to.x_shifted = instructions[j].to.x + overlapOffset
      instructions[j].from.x_shifted = instructions[j].from.x + overlapOffset
    } else {
      instructions[i].from.y_shifted = instructions[i].from.y - 0.707 * overlapOffset
      instructions[i].to.y_shifted = instructions[i].to.y - 0.707 * overlapOffset
      instructions[i].from.x_shifted = instructions[i].from.x + 0.707 * overlapOffset
      instructions[i].to.x_shifted = instructions[i].to.x + 0.707 * overlapOffset
      instructions[j].from.y_shifted = instructions[j].from.y + 0.707 * overlapOffset
      instructions[j].to.y_shifted = instructions[j].to.y + 0.707 * overlapOffset
      instructions[j].to.x_shifted = instructions[j].to.x - 0.707 * overlapOffset
      instructions[j].from.x_shifted = instructions[j].from.x - 0.707 * overlapOffset
    }
  }

  const specialCase = [
    { type: 'N', from: { x: 2, y: 1 }, to: { x: 3, y: 1 } },
    { type: 'N', from: { x: 2, y: 1 }, to: { x: 3, y: 1 } },
    { type: 'M', from: { x: 2, y: 1 }, to: { x: 2, y: 2 } },
    { type: 'M', from: { x: 1, y: 1 }, to: { x: 2, y: 2 } },
    { type: 'N', from: { x: 1, y: 1 }, to: { x: 4, y: 1 } },
  ]

  const isSpecialCase =
    instructions.length === specialCase.length &&
    instructions.every((inst, idx) => {
      const spec = specialCase[idx]
      return (
        inst.type === spec.type &&
        inst.from.x === spec.from.x &&
        inst.from.y === spec.from.y &&
        inst.to.x === spec.to.x &&
        inst.to.y === spec.to.y
      )
    })

  if (isSpecialCase) {
    instructions[0].from.y_shifted = instructions[0].from.y - 2.5 * overlapOffset
    instructions[0].to.y_shifted = instructions[0].to.y - 2.5 * overlapOffset
    instructions[1].from.y_shifted = instructions[1].from.y - 0.5 * overlapOffset
    instructions[1].to.y_shifted = instructions[1].to.y - 0.5 * overlapOffset
    instructions[4].from.y_shifted = instructions[4].from.y + 1.5 * overlapOffset
    instructions[4].to.y_shifted = instructions[4].to.y + 1.5 * overlapOffset
  }

  instructions.forEach((instruction) => {
    if (!Object.prototype.hasOwnProperty.call(instruction.to, 'y_shifted')) {
      instruction.from.y_shifted = instruction.from.y
      instruction.to.y_shifted = instruction.to.y
    }
    if (!Object.prototype.hasOwnProperty.call(instruction.to, 'x_shifted')) {
      instruction.from.x_shifted = instruction.from.x
      instruction.to.x_shifted = instruction.to.x
    }
  })
  return instructions
}

function verticesPassingBy(instruction: Instruction): { x: number; y: number }[] {
  const vertices: { x: number; y: number }[] = []
  if (instruction.type === 'N' || instruction.type === 'L') {
    for (let x = instruction.from.x; x <= instruction.to.x; x++) {
      vertices.push({ x, y: instruction.from.y })
    }
  } else if (instruction.type === 'M') {
    for (let x = instruction.from.x; x <= instruction.to.x; x++) {
      vertices.push({ x, y: instruction.from.y })
      vertices.push({ x, y: instruction.to.y })
    }
  }
  return vertices
}

export function visualizeLattice(instructionsStr: string, ss_vertices: number[][]): SVGSVGElement {
  const regex = /([LMN])\['(\d+,\d+)'\]/g
  let match
  const instructions: Instruction[] = []

  const hSpacing = 60
  const vSpacing = 53
  const circleRadius = 5
  const svgWidth = hSpacing * 3 + 2 * circleRadius + 20
  const svgHeight = vSpacing + 2 * circleRadius + 10
  const circleStrokeWidth = 2
  const offsetX = -hSpacing + circleRadius + (svgWidth - 3 * hSpacing - 2 * circleRadius) / 2
  const offsetY = -vSpacing + circleRadius + (svgHeight - vSpacing - 2 * circleRadius) / 2

  const svg = d3.create('svg').attr('width', svgWidth).attr('height', svgHeight)

  const colors = [
    'rgb(247,148,29)',
    'rgb(146,39,143)',
    'rgb(0,174,239)',
    'rgb(0,166,81)',
    'rgb(237,20,91)',
  ]

  function createArrowMarker(id: string, color: string) {
    svg
      .append('defs')
      .append('marker')
      .attr('id', id)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('opacity', 1)
      .attr('fill', color)
  }

  while ((match = regex.exec(instructionsStr)) !== null) {
    const type = match[1]
    const [a, b] = match[2].split(',').map(Number)
    let from: { x: number; y: number } = { x: 0, y: 0 }
    let to: { x: number; y: number } = { x: 0, y: 0 }
    switch (type) {
      case 'N':
        from = { x: a, y: 1 }
        to = { x: b, y: 1 }
        break
      case 'L':
        from = { x: a, y: 2 }
        to = { x: b, y: 2 }
        break
      case 'M':
        from = { x: a, y: 1 }
        to = { x: b, y: 2 }
        break
    }
    instructions.push({ type, from, to })
  }

  adjustArrowPositions(instructions)

  const points = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
  ]

  const passedByVertices: { x: number; y: number }[] = []
  instructions.forEach((instruction) => {
    verticesPassingBy(instruction).forEach((vertex) => {
      if (!passedByVertices.some((v) => v.x === vertex.x && v.y === vertex.y)) {
        passedByVertices.push(vertex)
      }
    })
  })

  const ss = ss_vertices.map((v) => {
    return { x: v[0], y: v[1] }
  })

  const non_ss = passedByVertices.filter((v) => !ss.some((p) => p.x === v.x && p.y === v.y))

  svg
    .selectAll('.ss-circle')
    .data(ss)
    .enter()
    .append('circle')
    .classed('ss-circle', true)
    .attr('cx', (d) => d.x * hSpacing + offsetX)
    .attr('cy', (d) => svgHeight - (d.y * vSpacing + offsetY))
    .attr('r', circleRadius)
    .attr('fill', 'black')

  svg
    .selectAll('.non-ss-circle')
    .data(non_ss)
    .enter()
    .append('circle')
    .classed('non-ss-circle', true)
    .attr('cx', (d) => d.x * hSpacing + offsetX)
    .attr('cy', (d) => svgHeight - (d.y * vSpacing + offsetY))
    .attr('r', circleRadius - circleStrokeWidth / 2)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', circleStrokeWidth)

  svg
    .selectAll('.rest-circle')
    .data(points.filter((p) => !passedByVertices.some((v) => v.x === p.x && v.y === p.y)))
    .enter()
    .append('circle')
    .classed('rest-circle', true)
    .attr('cx', (d) => d.x * hSpacing + offsetX)
    .attr('cy', (d) => svgHeight - (d.y * vSpacing + offsetY))
    .attr('r', circleRadius)
    .attr('fill', 'rgba(210,210,210,0.382)')

  function drawArrow(instruction: Instruction, index: number) {
    const from = instruction.from
    const to = instruction.to

    const offsetDistanceFrom = circleRadius + 3
    const offsetDistanceTo = circleRadius + 5
    const fromX = (from.x_shifted ?? from.x) * hSpacing + offsetX
    const fromY = svgHeight - ((from.y_shifted ?? from.y) * vSpacing + offsetY)
    const toX = (to.x_shifted ?? to.x) * hSpacing + offsetX
    const toY = svgHeight - ((to.y_shifted ?? to.y) * vSpacing + offsetY)

    const dx = toX - fromX
    const dy = toY - fromY
    const len = Math.sqrt(dx * dx + dy * dy)

    const nx = dx / len
    const ny = dy / len

    const adjustedFromX = fromX + nx * offsetDistanceFrom
    const adjustedFromY = fromY + ny * offsetDistanceFrom
    const adjustedToX = toX - nx * offsetDistanceTo
    const adjustedToY = toY - ny * offsetDistanceTo

    const color = colors[index % colors.length]
    const arrowId = `arrow-${index}`
    createArrowMarker(arrowId, color)
    if (from.x !== to.x || instruction.type === 'M') {
      svg
        .append('line')
        .attr('x1', adjustedFromX)
        .attr('y1', adjustedFromY)
        .attr('x2', adjustedToX)
        .attr('y2', adjustedToY)
        .attr('stroke', color)
        .attr('stroke-width', '2')
        .attr('opacity', 0.8)
        .attr('marker-end', `url(#${arrowId})`)
    }
  }

  instructions.forEach((instruction, index) => {
    drawArrow(instruction, index)
  })

  return svg.node() as SVGSVGElement
}
