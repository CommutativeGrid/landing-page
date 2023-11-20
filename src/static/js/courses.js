/**
 * test if two arrows overlap
 * @param {*} arrow1 
 * @param {*} arrow2 
 * @returns 
 */
function arrowsOverlap(arrow1, arrow2) {
    // Exclude M arrows from overlap detection
    if (arrow1.type === "M" || arrow2.type === "M"){
        //return true only if the two arrows are identical
        return arrow1.from.x === arrow2.from.x && arrow1.from.y === arrow2.from.y && arrow1.to.x === arrow2.to.x && arrow1.to.y === arrow2.to.y;
    }

    // Check for horizontal overlap
    if (arrow1.from.y === arrow2.from.y && arrow1.to.y === arrow2.to.y) {
        return (arrow1.from.x <= arrow2.to.x && arrow1.to.x >= arrow2.from.x) ||
               (arrow2.from.x <= arrow1.to.x && arrow2.to.x >= arrow1.from.x);
    }
    return false;
}


const overlapOffset = 0.05;  // Adjust as needed

function adjustArrowPositions(instructions) {
    //! x and y coordinates here are based on the usual mathematical convention, i.e. (0,0) is at the bottom left corner
    //! which is not the same as the SVG convention, i.e. (0,0) is at the top left corner   

    const overlaps = ((instructions)=>{
        let overlaps = [];
        for (let i = 0; i < instructions.length; i++) {
            for (let j = i + 1; j < instructions.length; j++) {
                if (arrowsOverlap(instructions[i], instructions[j])) {
                    overlaps.push([i, j]);
                }
            }
        }
        return overlaps;
    })(instructions);

    for (let [i, j] of overlaps) {
        if (instructions[i].type != 'M'){
            // if not type M (connecting two layers), only shift the y coordinate
            // Adjust for overlaps
            instructions[i].from.y_shifted = instructions[i].from.y - overlapOffset;
            instructions[i].to.y_shifted = instructions[i].to.y - overlapOffset;
            instructions[j].from.y_shifted = instructions[j].from.y + overlapOffset;
            instructions[j].to.y_shifted = instructions[j].to.y + overlapOffset;
        } else if (instructions[i].type === 'M'&& instructions[i].from.x === instructions[i].to.x) {
            // if type M and vertical shift the x coordinate only 
            instructions[i].from.x_shifted = instructions[i].from.x - overlapOffset;
            instructions[i].to.x_shifted = instructions[i].to.x - overlapOffset;
            instructions[j].to.x_shifted = instructions[j].to.x + overlapOffset;
            instructions[j].from.x_shifted = instructions[j].from.x + overlapOffset;
        } else {
            // if type M and slanted shift both x and y coordinates
            instructions[i].from.y_shifted = instructions[i].from.y - 0.707*overlapOffset;
            instructions[i].to.y_shifted = instructions[i].to.y - 0.707*overlapOffset;
            instructions[i].from.x_shifted = instructions[i].from.x + 0.707*overlapOffset;
            instructions[i].to.x_shifted = instructions[i].to.x + 0.707*overlapOffset;
            instructions[j].from.y_shifted = instructions[j].from.y + 0.707*overlapOffset;
            instructions[j].to.y_shifted = instructions[j].to.y + 0.707*overlapOffset;
            instructions[j].to.x_shifted = instructions[j].to.x - 0.707*overlapOffset;
            instructions[j].from.x_shifted = instructions[j].from.x - 0.707*overlapOffset;
        }

    }
    //for instructions that are not overlapping, set y_shifted to y
    instructions.forEach(instruction => {
        if (!instruction.to.hasOwnProperty("y_shifted")) {
            instruction.from.y_shifted = instruction.from.y;
            instruction.to.y_shifted = instruction.to.y;
        }
        if (!instruction.to.hasOwnProperty("x_shifted")) {
            instruction.from.x_shifted = instruction.from.x;
            instruction.to.x_shifted = instruction.to.x;
        }
    });
    return instructions;
}

function verticesPassingBy(instruction){
    let vertices = [];
    if (instruction.type === "N" || instruction.type === "L") {
        for (let x = instruction.from.x; x <= instruction.to.x; x++) {
            vertices.push({x, y: instruction.from.y});
        }
    } else if (instruction.type === "M") {
        for (let x = instruction.from.x; x <= instruction.to.x; x++) {
            vertices.push({x, y: instruction.from.y});
            vertices.push({x, y: instruction.to.y});
        }
    }
    return vertices;
}



function visualizeLattice(instructionsStr,ss_vertices) {
    // Extract individual instructions using regex
    const regex = /([LMN])\['(\d+,\d+)'\]/g;
    let match;
    let instructions = [];

    // Set up SVG canvas
    const hSpacing = 120;
    const vSpacing = 105;
    const circleRadius = 10;
    const svgWidth = hSpacing*3+2*circleRadius+40;//420;  // Adjusted width
    const svgHeight = vSpacing+2*circleRadius+20;//240;  // Adjusted height
    const circleStrokeWidth = 4;
    // const offsetX = 0 //(svgWidth - (4 * hSpacing)) / 2;
    const offsetX = -hSpacing+circleRadius+(svgWidth-3*hSpacing-2*circleRadius)/2; // make the diagram centered
    // const offsetY = 
    const offsetY = -vSpacing+circleRadius+(svgHeight-vSpacing-2*circleRadius)/2;//vSpacing+(svgHeight-vSpacing-circleRadius)/2; //(svgHeight - (2 * vSpacing)) / 2;
    // const offsetY = (svgHeight - (2 * vSpacing)) / 2;

    const svg = d3.create("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const colors = [
        "rgb(247,148,29)",  // orange-like
        "rgb(146,39,143)",  // purple-like
        "rgb(0,174,239)",   // blue-like
        "rgb(0,166,81)",    // green-like
        "rgb(237,20,91)"    // red-like
    ];

    function createArrowMarker(id, color) {
        // console.log("Creating marker", id, color);
        svg.append("defs").append("marker")
            .attr("id", id)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5") // arrowhead path
            .attr("opacity", 1)
            .attr("fill", color);
    }
    
    while ((match = regex.exec(instructionsStr)) !== null) {
        const type = match[1];
        const [a, b] = match[2].split(',').map(Number);
        let from = {}, to = {};
        switch (type) {
            case "N": // lower layer
                from = {x: a, y: 1};
                to = {x: b, y: 1};
                break;
            case "L": // upper layer
                from = {x: a, y: 2};
                to = {x: b, y: 2};
                break;
            case "M": // connecting 
                from = {x: a, y: 1};
                to = {x: b, y: 2};
                break;
        }
        instructions.push({type, from, to});
    }
    
    adjustArrowPositions(instructions);
    // Draw points
    const points = [
        {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1},
        {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}
    ];

    const passedByVertices = [];
    instructions.forEach(instruction => {
        verticesPassingBy(instruction).forEach(vertex => {
            if (!passedByVertices.some(v => v.x === vertex.x && v.y === vertex.y)) {
                passedByVertices.push(vertex);
            }
        });
    });

    // parse ss_vertices, of form [[1,2],[3,2]],

    const ss = ss_vertices.map(v => {
        return {x: v[0], y: v[1]};
    });

    //raise error if ss_vertices_parsed is not a subset of passedByVertices
    if (!ss.every(v => passedByVertices.some(p => p.x === v.x && p.y === v.y))) {
        console.log("ss_vertices", ss);
        console.log("passedByVertices", passedByVertices);
        console.log("instructionStr", instructionsStr);
        throw new Error("ss_vertices is not a subset of passedByVertices");
    }

    // get the points passed by but are not in ss_vertices
    const non_ss = passedByVertices.filter(v => !ss.some(p => p.x === v.x && p.y === v.y));
    // console.log("non_ss", non_ss);

    // Draw ss_vertices as solid black disks
    svg.selectAll(".ss-circle")
        .data(ss)
        .enter().append("circle")
        .classed("ss-circle", true) // Add a class to these circles
        .attr("cx", d => d.x * hSpacing + offsetX)
        .attr("cy", d => svgHeight - (d.y * vSpacing + offsetY))  // Corrected cy for circles
        .attr("r", circleRadius)
        .attr("fill", "black");
        
    // Draw non_ss as hollow black disks
    svg.selectAll(".non-ss-circle")
        .data(non_ss)
        .enter().append("circle")
        .classed("non-ss-circle", true) // Add a class to these circles
        .attr("cx", d => d.x * hSpacing + offsetX)
        .attr("cy", d => svgHeight - (d.y * vSpacing + offsetY))  // Corrected cy for circles
        .attr("r", circleRadius-circleStrokeWidth/2)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", circleStrokeWidth);
    
    // Draw the rest points as very dim gray disks
    svg.selectAll(".rest-circle")
        .data(points.filter(p => !passedByVertices.some(v => v.x === p.x && v.y === p.y)))
        .enter().append("circle")
        .classed("rest-circle", true) // Add a class to these circles
        .attr("cx", d => d.x * hSpacing + offsetX)
        .attr("cy", d => svgHeight - (d.y * vSpacing + offsetY))  // Corrected cy for circles
        .attr("r", circleRadius)
        .attr("fill", "rgba(210,210,210,0.382)");

    
    // Initialize the array to store the original arrow points for highlighting
    let originalArrowPoints = [];

    function drawArrow(instruction, index) {
        const type = instruction.type;
        const from = instruction.from; //x:1~4 y:1~2
        const to = instruction.to;   //x:1~4 y:1~2

        // Store the original points for highlighting
        originalArrowPoints.push({
            x: instruction.from.x,
            y: instruction.from.y
        }, {
            x: instruction.to.x,
            y: instruction.to.y
        });
        const offsetDistanceFrom = circleRadius + 5;  // Radius + 5 units for offset from 
        const offsetDistanceTo = circleRadius + 10;  // Radius + 10 units for offset to
        const fromX = from.x_shifted * hSpacing + offsetX;
        const fromY = svgHeight - (from.y_shifted * vSpacing + offsetY);
        const toX = to.x_shifted * hSpacing + offsetX;
        const toY = svgHeight - (to.y_shifted * vSpacing + offsetY);

        // Calculate direction vector
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate normalized direction vector
        const nx = dx / len;
        const ny = dy / len;

        // Calculate adjusted start and end points
        const adjustedFromX = fromX + nx * offsetDistanceFrom;
        const adjustedFromY = fromY + ny * offsetDistanceFrom;
        const adjustedToX = toX - nx * offsetDistanceTo;
        const adjustedToY = toY - ny * offsetDistanceTo;

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
    // points connected by arrows with black color
    // svg.selectAll("circle")
    //     .filter(d => originalArrowPoints.some(p => p.x === d.x && p.y === d.y))
    //     .attr("fill", "black");
    return svg.node();
}


export { visualizeLattice };