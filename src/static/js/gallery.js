// Fetch the data from the JSON file

import plotData from '../data/plot_data.json';
import { visualizeLattice } from './courses.js';

function renderGalleryItems() {
    const galleryContainer = document.getElementById("gallery-container");
    // clear the gallery container in case it already has items
    galleryContainer.innerHTML = "";
    plotData.paths.forEach(data => {
        const galleryItem = document.createElement('div');
        galleryItem.className = `gallery-item ${data.type} ${data.remark}`;
        // galleryItem.style.width = '420px';
        // galleryItem.style.height = '220px';
        const svg = visualizeLattice(data.path, data.ss);
        galleryItem.innerHTML = svg.outerHTML;
        galleryContainer.appendChild(galleryItem);
    });
}

function setGalleryColumns() {
    const galleryContainer = document.getElementById("gallery-container");
    const parentWidth = galleryContainer.parentElement.offsetWidth;

    const galleryItemWidth = 440; // width of each gallery item
    const gap = 16; // assuming gap-4 translates to 16 pixels
    const numColumns = Math.floor((parentWidth) / (galleryItemWidth + gap));

    galleryContainer.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
}

window.onload = setGalleryColumns;
window.onresize = setGalleryColumns;






// Call this function to render the SVGs in the gallery container
renderGalleryItems();
export { renderGalleryItems };
