# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BMC Viewer is a React-based web application for displaying Business Model Canvas (BMC) data from Markdown files. It focuses on Japanese companies from the TOPIX Core30 index, providing a visual interface to explore business models.

## Key Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build  
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Lint code
npm run lint  # Not configured - use default ESLint commands if needed
```

## Architecture

### Data Structure
- **Company Data**: Static JSON file (`public/companies.json`) containing TOPIX Core30 company information
- **BMC Data**: Individual Markdown files in `public/companies/` directory (e.g., `7203.md` for Toyota)
- **Frontmatter**: Markdown files can include YAML frontmatter for metadata

### Core Components
- **App.jsx**: Main application with routing and state management
- **SearchComponent**: Company search with filtering by name, code, industry
- **BMCCanvas**: Renders the Business Model Canvas in a fixed-width scrollable layout
- **CompanyCard**: Individual company display cards with industry-specific styling

### Data Flow
1. App loads `companies.json` on startup
2. User searches/selects company → navigate to `/company/:code`
3. App fetches corresponding `.md` file from `public/companies/`
4. Markdown is parsed into BMC sections and rendered in canvas format

### BMC Section Mapping
The app expects these exact section headers in Markdown files:
- Key Partners, Key Activities, Key Resources
- Value Propositions (highlighted in yellow)
- Customer Relationships, Channels, Customer Segments
- Cost Structure (highlighted in red), Revenue Streams (highlighted in green)

### Styling System
- **Tailwind CSS**: Primary styling framework
- **Industry Colors**: Predefined color schemes for different business sectors
- **Responsive Design**: Mobile-first with pinch-zoom support for BMC canvas
- **Fixed Layout**: BMC uses 1400px fixed width with horizontal scrolling

### Build Configuration
- **Vite**: Build tool with React plugin
- **GitHub Pages**: Deployment target with base path `/bmc-viewer/`
- **ESLint**: Code linting with React hooks and refresh plugins