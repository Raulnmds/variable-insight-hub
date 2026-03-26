import { Job, JobVariablePayData, PercentileStats, VariablePayType, AggregatedComparison, Filters, PositionStatus, STAT_KEYS } from '@/types/variablePay';
import { jobs, allJobData } from '@/data/variablePayMockData';

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function aggregateStats(statsList: PercentileStats[]): PercentileStats {
  if (statsList.length === 0) return { p25: 0, p50: 0, p75: 0, p90: 0, media: 0 };
  return {
    p25: avg(statsList.map(s => s.p25)),
    p50: avg(statsList.map(s => s.p50)),
    p75: avg(statsList.map(s => s.p75)),
    p90: avg(statsList.map(s => s.p90)),
    media: avg(statsList.map(s => s.media)),
  };
}

function sumStats(statsList: PercentileStats[]): PercentileStats {
  if (statsList.length === 0) return { p25: 0, p50: 0, p75: 0, p90: 0, media: 0 };
  return {
    p25: statsList.reduce((a, s) => a + s.p25, 0),
    p50: statsList.reduce((a, s) => a + s.p50, 0),
    p75: statsList.reduce((a, s) => a + s.p75, 0),
    p90: statsList.reduce((a, s) => a + s.p90, 0),
    media: statsList.reduce((a, s) => a + s.media, 0),
  };
}

export function applyViewMode(stats: PercentileStats, mode: 'anual' | 'mensal'): PercentileStats {
  if (mode === 'anual') return stats;
  return {
    p25: Math.round(stats.p25 / 12),
    p50: Math.round(stats.p50 / 12),
    p75: Math.round(stats.p75 / 12),
    p90: Math.round(stats.p90 / 12),
    media: Math.round(stats.media / 12),
  };
}

export function filterJobs(filters: Filters): Job[] {
  return jobs.filter(j => {
    if (filters.area && j.area !== filters.area) return false;
    if (filters.familia && j.familia !== filters.familia) return false;
    if (filters.nivel && j.nivel !== filters.nivel) return false;
    if (filters.localidade && j.localidade !== filters.localidade) return false;
    return true;
  });
}

export function getDataForJobs(jobIds: string[], type: VariablePayType): JobVariablePayData[] {
  if (type === 'total') {
    // Aggregate all types per job
    return jobIds.map(id => {
      const jobData = allJobData.filter(d => d.cargo_id === id);
      return {
        cargo_id: id,
        tipo_variavel: 'total' as VariablePayType,
        empresa: sumStats(jobData.map(d => d.empresa)),
        mercado: sumStats(jobData.map(d => d.mercado)),
        n_amostra: Math.min(...jobData.map(d => d.n_amostra)),
        n_colaboradores: jobData[0]?.n_colaboradores || 0,
        fonte: 'Consolidado',
        data_base: '2025-01',
      };
    });
  }
  return allJobData.filter(d => jobIds.includes(d.cargo_id) && d.tipo_variavel === type);
}

export function getAggregatedComparisons(filters: Filters): AggregatedComparison[] {
  const filteredJobs = filterJobs(filters);
  const jobIds = filteredJobs.map(j => j.cargo_id);
  const types: VariablePayType[] = ['bonus', 'pplr', 'comissao', 'premio', 'total'];

  return types.map(tipo => {
    const data = getDataForJobs(jobIds, tipo);
    return {
      tipo,
      empresa: aggregateStats(data.map(d => d.empresa)),
      mercado: aggregateStats(data.map(d => d.mercado)),
    };
  });
}

export function calcDelta(empresa: number, mercado: number): number {
  return empresa - mercado;
}

export function calcDeltaPct(empresa: number, mercado: number): number {
  if (mercado === 0) return 0;
  return ((empresa - mercado) / mercado) * 100;
}

export function calcIndice(empresa: number, mercado: number): number {
  if (mercado === 0) return 0;
  return empresa / mercado;
}

export function getPositionStatus(empresa: number, mercado: number): PositionStatus {
  const pct = calcDeltaPct(empresa, mercado);
  if (pct > 20) return 'acima';
  if (pct < -20) return 'abaixo';
  return 'alinhado';
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatIndice(value: number): string {
  return value.toFixed(2);
}

export function generateInsights(comparisons: AggregatedComparison[], filters: Filters): string {
  const lines: string[] = [`Resumo Remuneração Variável — ${filters.ano}`];
  if (filters.area) lines[0] += ` | Área: ${filters.area}`;

  for (const c of comparisons) {
    const label = c.tipo === 'total' ? 'Total Variável' : c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1);
    const pct = calcDeltaPct(c.empresa.p50, c.mercado.p50);
    const status = pct > 5 ? 'acima' : pct < -5 ? 'abaixo' : 'alinhado ao';
    lines.push(`• ${label}: P50 está ${Math.abs(pct).toFixed(1)}% ${status} mercado (Empresa: ${formatBRL(c.empresa.p50)} vs Mercado: ${formatBRL(c.mercado.p50)})`);
  }

  // Find highest dispersion
  const dispersions = comparisons.filter(c => c.tipo !== 'total').map(c => ({
    tipo: c.tipo,
    empRange: c.empresa.p75 - c.empresa.p25,
    mktRange: c.mercado.p75 - c.mercado.p25,
  }));
  const maxDisp = dispersions.reduce((a, b) => (a.empRange > b.empRange ? a : b));
  lines.push(`• Maior dispersão interna (P25–P75): ${maxDisp.tipo} (${formatBRL(maxDisp.empRange)})`);

  return lines.join('\n');
}

export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
