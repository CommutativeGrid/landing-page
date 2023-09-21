import { initializeTable } from "./table.js";
import { renderGalleryItems } from "./gallery.js";

const toggle=()=>{
    document.getElementById("toggleButton").addEventListener("click", function() {
        const tableContainer = document.getElementById("table-container");
        const galleryContainer = document.getElementById("gallery-container");
        const toggleInput = document.querySelector("#toggleButton input[type='checkbox']");
        if (toggleInput.checked) {
            // If checked, show gallery and hide table
            // renderGalleryItems();
            tableContainer.classList.add("is-hidden");
            galleryContainer.classList.remove("is-hidden");
        } else {
            // If unchecked, show table and hide gallery
            initializeTable();
            tableContainer.classList.remove("is-hidden");
            galleryContainer.classList.add("is-hidden");
        }
    });
}

toggle();


