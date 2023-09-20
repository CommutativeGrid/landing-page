// Fetch the data from the JSON file

import plotData from '../data/plot_data.json';
import { visualizeLattice } from './courses.js';

// Now you can use plotData directly
console.log(plotData);

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

function initializeTable(plotData) {
    // Store the selected types for filtering
    let selectedTypes = [];



    var table = new Tabulator("#courses-table", {
        width: "100%",
        data: plotData.paths, 
        layout: "fitDataTable",
        responsiveLayout: "hide",
        columns: [
            {
                title:"Alternating Zigzag Course", 
                formatter: visualizeLatticeFormatter,
                headerSort: false,
                width: 400
            },
            {
                title:"Type",
                field:"type",
                sorter: typeSorter,
                headerFilter: false,
                headerFilterFunc: (data, row) => {
                    if (selectedTypes.length === 0) return true;
                    return selectedTypes.includes(data);
                },
                headerFilterParams: {
                    values: ["A0", "A1", "A2", "A3", "A4", "A5", "A6"], // Adjust accordingly
                    multiselect: true,
                    onChange: function(newSelectedTypes) {
                        selectedTypes = newSelectedTypes;
                        table.setFilter((data, type) => {
                            return selectedTypes.includes(data.type);
                        });
                    }
                },
                width: 80
            },
            {
                title:"Associated Interval",
                field:"interval",
                headerSort: false,
                width: 120
            },
            {
                title:"Remark",
                field:"remark",
                headerSort: true,
                headerFilter: false, //"select",
                headerFilterParams: {
                    values: true
                },
                width: 140
            }
        ]
    });
}

initializeTable(plotData);