# Ladder Invariants Project Landing Page

This repository contains the landing page for the Ladder Invariants project, which corresponds to the paper **[Refinement of Interval Approximations for Fully Commutative Quivers](https://link.springer.com/article/10.1007/s13160-025-00739-w)**.

View the live site at [ladder-invariants.netlify.app](https://ladder-invariants.netlify.app/).

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Visualization**:
  - D3.js for lattice/course visualizations
  - Plotly.js for Connected Persistence Diagrams
- **Data Table**: AG Grid (Community Edition)
- **Routing**: React Router
- **Deployment**: Netlify

## Repository Structure

```
src/
├── components/ui/     # shadcn/ui components
├── data/              # Data files (CPD data, plot data)
├── lib/
│   ├── cpd/           # CPD viewer logic (parse, plot)
│   └── courses.ts     # Lattice visualization logic
├── pages/
│   ├── HomePage.tsx
│   ├── CoursesPage.tsx
│   └── CPDViewerPage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## Publishing Changes

1. Commit your changes to the repository
2. Push to GitHub
3. Netlify automatically deploys from the main branch
