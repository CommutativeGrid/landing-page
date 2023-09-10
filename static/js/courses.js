function arrowsOverlap(arrow1, arrow2) {
    // Exclude M arrows from overlap detection
    if (arrow1.type === "M" || arrow2.type === "M") return false;

    // Check for horizontal overlap
    if (arrow1.from.y === arrow2.from.y && arrow1.to.y === arrow2.to.y) {
        return (arrow1.from.x <= arrow2.to.x && arrow1.to.x >= arrow2.from.x) ||
               (arrow2.from.x <= arrow1.to.x && arrow2.to.x >= arrow1.from.x);
    }
    return false;
}

function detectOverlaps(instructions) {
    let overlaps = [];
    for (let i = 0; i < instructions.length; i++) {
        for (let j = i + 1; j < instructions.length; j++) {
            if (arrowsOverlap(instructions[i], instructions[j])) {
                overlaps.push([i, j]);
            }
        }
    }
    return overlaps;
}

const overlapOffset = 0.05;  // Adjust as needed

function adjustOverlappingArrows(instructions, overlaps) {
    for (let [i, j] of overlaps) {
        // Store the original y values
        instructions[i].originalFromY = instructions[i].from.y;
        instructions[i].originalToY = instructions[i].to.y;
        instructions[j].originalFromY = instructions[j].from.y;
        instructions[j].originalToY = instructions[j].to.y;

        // Adjust for overlaps
        instructions[i].from.y -= overlapOffset;
        instructions[i].to.y -= overlapOffset;
        instructions[j].from.y += overlapOffset;
        instructions[j].to.y += overlapOffset;
    }
}

function visualizeLattice(instructionsStr, element) {
    // Extract individual instructions using regex
    const regex = /([LMN])\["(\d+,\d+)"\]/g;
    let match;
    let instructions = [];

    const colors = [
        "rgb(247,148,29)",  // orange-like
        "rgb(146,39,143)",  // purple-like
        "rgb(0,174,239)",   // blue-like
        "rgb(0,166,81)",    // green-like
        "rgb(237,20,91)"    // red-like
    ];

    function createArrowMarker(id, color) {
        console.log("Creating marker", id, color);
        svg.append("defs").append("marker")
            .attr("id", id)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("opacity", 1)
            .attr("fill", color);
    }
    
    
    while ((match = regex.exec(instructionsStr)) !== null) {
        const type = match[1];
        const [a, b] = match[2].split(',').map(Number);
        let from = {}, to = {};
        switch (type) {
            case "N":
                from = {x: a, y: 1};
                to = {x: b, y: 1};
                break;
            case "L":
                from = {x: a, y: 2};
                to = {x: b, y: 2};
                break;
            case "M":
                from = {x: a, y: 1};
                to = {x: b, y: 2};
                break;
        }
        instructions.push({type, from, to});
    }
    
    let overlaps = detectOverlaps(instructions);
    adjustOverlappingArrows(instructions, overlaps);
    
    // Set up SVG canvas
    const svgWidth = 500;  // Adjusted width
    const svgHeight = 260;  // Adjusted height
    const offsetX = 0 //(svgWidth - (4 * 120)) / 2;
    const offsetY = 0 //(svgHeight - (2 * 105)) / 2;

    const svg = d3.select(element).append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Draw points
    const points = [
        {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1},
        {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}
    ];
    
    
    // Draw all the points as dimmed disks
    svg.selectAll("circle")
        .data(points)
        .enter().append("circle")
        .attr("cx", d => d.x * 120 - 100 + offsetX)
        .attr("cy", d => svgHeight - d.y * 105 + offsetY)  // Corrected cy for circles
        .attr("r", 10)
        .attr("fill", "#ccc");

    // Initialize the array to store the original arrow points for highlighting
    let originalArrowPoints = [];

    function drawArrow(instruction, index) {
        const type = instruction.type;
        const from = instruction.from;
        const to = instruction.to;

        // Store the original points for highlighting
        originalArrowPoints.push({
            x: instruction.from.x,
            y: instruction.originalFromY || instruction.from.y
        }, {
            x: instruction.to.x,
            y: instruction.originalToY || instruction.to.y
        });
        const circleRadius = 10;
        const offsetDistance = circleRadius + 5;  // Radius + 5 units for offset
        const fromX = from.x * 120 - 100 + offsetX;
        const fromY = svgHeight - from.y * 105 + offsetY;
        const toX = to.x * 120 - 100 + offsetX;
        const toY = svgHeight - to.y * 105 + offsetY;

        // Calculate direction vector
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate normalized direction vector
        const nx = dx / len;
        const ny = dy / len;

        // Calculate adjusted start and end points
        const adjustedFromX = fromX + nx * offsetDistance;
        const adjustedFromY = fromY + ny * offsetDistance;
        const adjustedToX = toX - nx * offsetDistance;
        const adjustedToY = toY - ny * offsetDistance;

        const color = colors[index % colors.length];
        const arrowId = `arrow-${index}`;
        createArrowMarker(arrowId, color);
        if (from.x !== to.x || type === "M") {
            svg.append("line")
                .attr("x1", adjustedFromX)
                .attr("y1", adjustedFromY)
                .attr("x2", adjustedToX)
                .attr("y2", adjustedToY)
                .attr("stroke", color)
                .attr("stroke-width", "4")
                .attr("opacity", 0.8)
                .attr("marker-end", `url(#${arrowId})`);
        }
    }

    // Use the forEach function's second argument to get the index of each instruction
    instructions.forEach((instruction, index) => {
        drawArrow(instruction, index);
    });

    // Highlight points connected by arrows with black color
    svg.selectAll("circle")
        .filter(d => originalArrowPoints.some(p => p.x === d.x && p.y === d.y))
        .attr("fill", "black");
}
