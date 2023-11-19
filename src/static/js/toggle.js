import { initializeTable } from "./table.js";
import { renderGalleryItems } from "./gallery.js";

const toggle=()=>{
    document.getElementById("toggleButton").addEventListener("click", function() {
        const tableContainer = document.getElementById("table-container");
        const galleryContainer = document.getElementById("gallery-container");
        const toggleInput = document.querySelector("#toggleButton input[type='checkbox']");
        if (toggleInput.checked) {
            // If checked, show gallery and hide table
            tableContainer.classList.add("is-hidden");
            galleryContainer.classList.remove("is-hidden");
            renderGalleryItems();
            /* The following snippet is to fix a bug in the gallery where the SVGs
             are not rendered properly when the gallery is hidden and then shown
             again. The bug is that the SVGs are not rendered properly when using
             chrome, specficically, each head of the orange arrows is not rendered.
             (using marker-end="url(#arrow-0)")
            */
            document.querySelectorAll('svg').forEach(function(svg) {
                var parent = svg.parentNode;
                var nextSibling = svg.nextSibling;
                //This is used to put the SVG back in exactly the same place it was before. 
                //If you just appended the SVG to the parent, 
                //it would end up at the end of all the parent's children, 
                //which might not be its original position.
                parent.removeChild(svg);
                setTimeout(function() {
                    if (nextSibling) {
                        parent.insertBefore(svg, nextSibling);
                    } else {
                        parent.appendChild(svg);
                    }
                }, 10); // small delay
            });
        } else {
            // If unchecked, show table and hide gallery
            initializeTable();
            tableContainer.classList.remove("is-hidden");
            galleryContainer.classList.add("is-hidden");
        }
    });
}

toggle();


