---
name: data-visualization
description: "Create rich data visualizations, charts, diagrams, maps, and interactive explainers using D3.js and SVG rendered as HTML files. Use when the user needs to visualize data, create charts, build dashboards, explain concepts with diagrams, or generate any data-driven graphic. Supports Cartesian plots, distributions, maps, mockups, simulations, and dense categorical grids."
---

# Data Visualization (DSH)

Create rich data visualizations by generating HTML files with embedded D3.js (SVG/Canvas) and verifying them visually.

## Core Rules

- **Theme-aware colors only.** Use CSS custom properties (`--foreground`, `--background`, `--viz-series-1` through `--viz-series-6`). Never hardcode colors.
- **Size SVGs from their actual container.** Use `ResizeObserver` + `viewBox` recalculations.
- **Label directly.** Axes, units, and important values must have visible text labels.
- **Verify at multiple widths.** Test at 360px, 736px, and 1024px.
- **Pair color with shape/text** so meaning never depends on color alone.

## Workflow

1. **Analyze the data** — identify dimensions, types, and relationships.
2. **Select the viz archetype** (see below).
3. **Generate an HTML file** with embedded D3.js and data.
4. **Open in browser** (via PowerShell) or **render to screenshot** for visual QA.
5. **Iterate** until the visual is correct.

## Viz Archetypes

### Cartesian / Statistical Plots
- Use D3 for data-rich scatter, line, bar, area, and statistical plots.
- Load pinned CDN: `https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js`
- Derive domains with `d3.extent(...)`, reserve 64px for y-axis.
- Animate transitions (not initial appearance); honor `prefers-reduced-motion`.

### Maps
- Project GeoJSON/TopoJSON with `d3-geo`. Never hand-draw geographic outlines.
- World countries: `https://esm.sh/@d3-maps/atlas@1.0.0/world/countries/countries-110m`
- US: `https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json/+esm`
- Verify geometry renders before delivering.

### Dense Categorical Grids
- One compact horizontal selected-item summary + grid with one readable identifier per cell + small legend.

### Interactive Explainers
- Compact controls, one dominant visual, at most one single-line selected-state detail.

### Mockups (product surfaces)
- Use `.card`, opaque backgrounds, stacked overlays. Follow host theme via `light-dark()`.

## File Generation Pattern

Generate an HTML file in the workspace:

```powershell
# Example: create and open a visualization
$htmlPath = "D:\Projects\viz-output.html"
# ... (write HTML content to $htmlPath) ...
Start-Process $htmlPath   # Opens in default browser
```

For visual QA via screenshot:

```powershell
# Use Playwright to screenshot the HTML
npx playwright screenshot --wait-for-timeout 2000 "file:///D:/Projects/viz-output.html" D:\Projects\viz-screenshot.png
```

Then read the screenshot in DSH: `read_image("D:\Projects\viz-screenshot.png")`

## Color Tokens

| Token | Use |
|-------|-----|
| `--viz-series-1` through `--viz-series-6` | Chart series, category identity |
| `--foreground` / `--muted-foreground` | Text, axis labels |
| `--border` / `--input` | Structural lines |
| `--background` / `--card` | Surfaces |
| `--primary` / `--accent` | Highlights, selections |

## Layout Utilities

Use semantic HTML with these utility classes (include inline in your HTML):

- `.card` — only card-like surface (don't recreate with custom CSS)
- `.viz-stat`, `.viz-stat-value` — summary cards
- `.viz-grid` — peer metrics (auto-reflows)
- `.viz-row` — wrapping horizontal group
- `.table` / `.table-responsive` — data tables
- `.text-small`, `.text-muted` — secondary text
- `[data-tooltip]` — hover tooltips (JS-initialized)

## Accessibility

- Semantic HTML + keyboard-accessible native controls
- `aria-live="polite"` for dynamic updates
- `.sr-only` for screen-reader summaries on every SVG/canvas
- Keep native tab order; never add `tabindex`
