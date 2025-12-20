/// <reference types="vite/client" />

declare module '*.css' {
  const content: string
  export default content
}

declare module 'tabulator-tables/dist/css/tabulator.min.css'

declare module 'plotly.js-dist-min' {
  import Plotly from 'plotly.js'
  export default Plotly
  export * from 'plotly.js'
}
