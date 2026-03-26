

## Plan: Stacked Bar Charts for Remuneração Variável

### What changes

The "Remuneração Variável" section on the overview page will use a **new stacked bar chart component** that breaks down variable pay into its 4 sub-components (Bonus, PPLR, Comissao, Premio) per statistical percentile (P25, P50, P75, P90, Media), for both Mercado and Empresa. Other sections (Salario Base, Adicionais Fixos, Remuneracao Total) keep the current grouped bar chart.

### Visual structure per card

```text
┌─────────────────────────────────────────┐
│ Remuneração variável — Geral    [↗]     │
│                                         │
│ Legend: ■ Bônus ■ PPLR ■ Comissão ■ Prêmio │
│                                         │
│  Mercado  Empresa  Mercado  Empresa ... │
│  ┌──┐     ┌──┐                          │
│  │▓▓│     │▓▓│   (stacked bars per      │
│  │██│     │██│    percentile group)      │
│  │░░│     │░░│                           │
│  │▒▒│     │▒▒│                           │
│  └──┘     └──┘                          │
│   P25       P50      P75     P90  Média │
│─────────────────────────────────────────│
│ Mediana Mercado   Delta    Mediana Emp.  │
│ R$ 2.280        +5.2%      R$ 2.398     │
└─────────────────────────────────────────┘
```

### Files to change

1. **`src/data/salaryOverviewMockData.ts`** — Add a new interface `OverviewStackedCut` with per-component stats (bonus/pplr/comissao/premio), each containing `OverviewStats` for mercado and empresa. Add a new export `variablePayStackedCuts` with mock data for Geral/Tecnologia/Comercial.

2. **`src/components/overview/OverviewStackedChartCard.tsx`** (new) — A new chart card component that:
   - Receives `OverviewStackedCut` data
   - Builds chart data with 5 percentile groups, each having Mercado and Empresa pairs, with stacked segments for the 4 variable types
   - Uses `recharts` `StackedBarChart` with 4 stacked `Bar` layers per group (Mercado side / Empresa side)
   - Uses distinct colors per component (e.g., 4 shades from the DS palette)
   - Shows legend with 4 component colors
   - Keeps the median comparison footer with delta %
   - Follows DS: `shadow-dp02`, `rounded-[10px]`, hover `shadow-dp04`, Open Sans ticks

3. **`src/pages/SalaryOverview.tsx`** — For the `remuneracao-variavel` section, render `OverviewStackedChartCard` instead of `OverviewChartCard`, passing the stacked data. Keep click-through to variable dashboard.

### Colors for stacked segments
- Bonus: `#5B9BD5` (primary blue)
- PPLR: `#718A96` (secondary gray-blue)
- Comissão: `#0FA958` (green)
- Prêmio: `#F59E42` (orange)

Each bar pair (Mercado vs Empresa) will be side-by-side within each percentile group, with the 4 components stacked within each bar.

