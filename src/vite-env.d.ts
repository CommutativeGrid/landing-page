/// <reference types="vite/client" />

declare module '*.css' {
  const content: string
  export default content
}

declare module 'tabulator-tables/dist/css/tabulator.min.css'
