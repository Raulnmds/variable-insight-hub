export interface OverviewStats {
  media: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface OverviewCut {
  label: string;
  mercado: OverviewStats;
  empresa: OverviewStats;
}

export interface OverviewCategory {
  id: string;
  title: string;
  cuts: OverviewCut[];
}

function make(base: number, seed: number): OverviewStats {
  const f = 0.9 + (seed % 37) * 0.008;
  return {
    media: Math.round(base * f),
    p25: Math.round(base * f * 0.72),
    p50: Math.round(base * f * 0.95),
    p75: Math.round(base * f * 1.18),
    p90: Math.round(base * f * 1.52),
  };
}

export const overviewCategories: OverviewCategory[] = [
  {
    id: 'salario-base',
    title: 'Salário base',
    cuts: [
      { label: 'Geral', mercado: make(7200, 1), empresa: make(6800, 2) },
      { label: 'Tecnologia', mercado: make(8500, 3), empresa: make(8100, 4) },
      { label: 'Comercial', mercado: make(6900, 5), empresa: make(7300, 6) },
    ],
  },
  {
    id: 'adicionais-fixos',
    title: 'Adicionais fixos',
    cuts: [
      { label: 'Geral', mercado: make(1800, 7), empresa: make(1650, 8) },
      { label: 'Tecnologia', mercado: make(2200, 9), empresa: make(2050, 10) },
      { label: 'Comercial', mercado: make(1500, 11), empresa: make(1700, 12) },
    ],
  },
  {
    id: 'remuneracao-variavel',
    title: 'Remuneração variável',
    cuts: [
      { label: 'Geral', mercado: make(2400, 13), empresa: make(2100, 14) },
      { label: 'Tecnologia', mercado: make(2800, 15), empresa: make(2500, 16) },
      { label: 'Comercial', mercado: make(3200, 17), empresa: make(3600, 18) },
    ],
  },
  {
    id: 'remuneracao-total',
    title: 'Remuneração total',
    cuts: [
      { label: 'Geral', mercado: make(9000, 19), empresa: make(8700, 20) },
      { label: 'Tecnologia', mercado: make(10500, 21), empresa: make(10200, 22) },
      { label: 'Comercial', mercado: make(9200, 23), empresa: make(9800, 24) },
    ],
  },
];
