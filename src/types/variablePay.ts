export type VariablePayType = 'bonus' | 'pplr' | 'comissao' | 'premio' | 'total';

export const VARIABLE_PAY_LABELS: Record<VariablePayType, string> = {
  bonus: 'Bônus',
  pplr: 'PPLR (PLR/PPR)',
  comissao: 'Comissão',
  premio: 'Prêmio',
  total: 'Total Variável',
};

export const VARIABLE_PAY_TYPES: VariablePayType[] = ['bonus', 'pplr', 'comissao', 'premio', 'total'];

export interface PercentileStats {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  media: number;
}

export interface Job {
  cargo_id: string;
  nome: string;
  familia: string;
  nivel: string;
  area: string;
  localidade: string;
}

export interface JobVariablePayData {
  cargo_id: string;
  tipo_variavel: VariablePayType;
  empresa: PercentileStats;
  mercado: PercentileStats;
  n_amostra: number;
  n_colaboradores: number;
  fonte: string;
  data_base: string;
}

export interface Filters {
  ano: number;
  area: string;
  familia: string;
  nivel: string;
  localidade: string;
  viewMode: 'anual' | 'mensal';
  userRole: 'hr' | 'manager';
}

export interface AggregatedComparison {
  tipo: VariablePayType;
  empresa: PercentileStats;
  mercado: PercentileStats;
}

export type PositionStatus = 'acima' | 'abaixo' | 'alinhado';

export const STAT_KEYS: (keyof PercentileStats)[] = ['p25', 'p50', 'p75', 'p90', 'media'];

export const STAT_LABELS: Record<keyof PercentileStats, string> = {
  p25: 'P25',
  p50: 'P50',
  p75: 'P75',
  p90: 'P90',
  media: 'Média',
};
