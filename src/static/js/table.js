// Fetch the data from the JSON file

import plotData from '../data/plot_data.json';
import { visualizeLattice } from './courses.js';


// Now you can use plotData directly

// fetch('../data/plot_data.json')
//     .then(response => response.json())
//     .then(data => {
//         // Initialize the table with the fetched data
//         initializeTable(data.paths);
//     })
//     .catch(error => {
//         console.error("There was an error fetching the JSON data:", error);
//     });

function visualizeLatticeFormatter(cell, formatterParams, onRendered) {
    let data = cell.getRow().getData();
    let svg = visualizeLattice(data.path, data.ss);
    return svg.outerHTML; // or another way to represent the SVG
}

function typeSorter(a, b) {
    return parseInt(a.slice(1)) - parseInt(b.slice(1));
}

function initializeTable() {
    var table = new Tabulator("#table", {
        width: "100%",
        data: plotData.paths, 
        layout: "fitDataTable",
        responsiveLayout: "hide",
        // set to screen height, use js to get screen height
        height: "calc(100vh-20px)",
        columns: [
            {
                title:"Alternating Zigzag Course", 
                headerHozAlign:"center",
                formatter: visualizeLatticeFormatter,
                headerSort: false,
                width: 460,
                hozAlign:"center"
            },
            {
                title:"Type",
                field:"type",
                sorter: typeSorter,
                headerHozAlign:"center",
                width: 140,
                hozAlign:"center",
                headerFilter: "list",
                headerFilterParams: {
                    values: ["A1", "A2", "A3", "A4", "A5", "A6"],  // Possible values for the "Type" column
                    multiselect: true,                            // Enable multi-selection
                },
                headerFilterFunc: function(headerValue, rowValue, rowData, filterParams){
                    if (headerValue.length === 0) {
                        return true;
                    }
                    return headerValue.includes(rowValue);
                }
            },
            // {
            //     title:"Interval",
            //     field:"interval",
            //     headerHozAlign:"center",
            //     headerSort: false,
            //     width: 140,
            //     hozAlign:"center",
            // },
            {
                title:"Remark",
                field:"remark",
                headerHozAlign:"center",
                headerSort: true,
                width: 180,
                hozAlign:"center",
                headerFilter: "list",
                headerFilterParams: {
                    values: ["source-sink", "corner-complete", "new"],  // Possible values for the "Type" column
                    multiselect: true,                            // Enable multi-selection
                },
                headerFilterFunc: function(headerValue, rowValue, rowData, filterParams){
                    if (headerValue.length === 0) {
                        return true;
                    }
                    return headerValue.includes(rowValue);
                }
            }
        ]
    });
    return table;
}

initializeTable();

export { initializeTable };