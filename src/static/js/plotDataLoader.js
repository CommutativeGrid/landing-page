// Centralized loader for the plot data JSON so Parcel emits the asset and we only fetch once.
const plotDataUrl = new URL('../data/plot_data.json', import.meta.url);

let plotDataPromise;

export function loadPlotData() {
    if (!plotDataPromise) {
        plotDataPromise = fetch(plotDataUrl).then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to load plot_data.json (${res.status})`);
            }
            return res.json();
        });
    }
    return plotDataPromise;
}

