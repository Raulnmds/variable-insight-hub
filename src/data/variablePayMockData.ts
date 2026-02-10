import { Job, JobVariablePayData, PercentileStats, VariablePayType } from '@/types/variablePay';

function seed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function makeStats(base: number, variance: number, seedStr: string): PercentileStats {
  const s = seed(seedStr);
  const factor = 0.85 + s * 0.3;
  const b = base * factor;
  return {
    p25: Math.round(b * (1 - variance * 0.35)),
    p50: Math.round(b),
    p75: Math.round(b * (1 + variance * 0.35)),
    p90: Math.round(b * (1 + variance * 0.7)),
    media: Math.round(b * (1 + (s - 0.5) * 0.1)),
  };
}

export const jobs: Job[] = [
  { cargo_id: '1', nome: 'Analista Financeiro Jr', familia: 'Finanças', nivel: 'Junior', area: 'Finanças', localidade: 'São Paulo' },
  { cargo_id: '2', nome: 'Analista Financeiro Pl', familia: 'Finanças', nivel: 'Pleno', area: 'Finanças', localidade: 'São Paulo' },
  { cargo_id: '3', nome: 'Analista Financeiro Sr', familia: 'Finanças', nivel: 'Sênior', area: 'Finanças', localidade: 'São Paulo' },
  { cargo_id: '4', nome: 'Coordenador Financeiro', familia: 'Finanças', nivel: 'Coordenador', area: 'Finanças', localidade: 'São Paulo' },
  { cargo_id: '5', nome: 'Gerente Financeiro', familia: 'Finanças', nivel: 'Gerente', area: 'Finanças', localidade: 'São Paulo' },
  { cargo_id: '6', nome: 'Analista Comercial Jr', familia: 'Comercial', nivel: 'Junior', area: 'Comercial', localidade: 'São Paulo' },
  { cargo_id: '7', nome: 'Executivo de Vendas Pl', familia: 'Comercial', nivel: 'Pleno', area: 'Comercial', localidade: 'São Paulo' },
  { cargo_id: '8', nome: 'Executivo de Vendas Sr', familia: 'Comercial', nivel: 'Sênior', area: 'Comercial', localidade: 'Rio de Janeiro' },
  { cargo_id: '9', nome: 'Gerente Comercial', familia: 'Comercial', nivel: 'Gerente', area: 'Comercial', localidade: 'São Paulo' },
  { cargo_id: '10', nome: 'Diretor Comercial', familia: 'Comercial', nivel: 'Diretor', area: 'Comercial', localidade: 'São Paulo' },
  { cargo_id: '11', nome: 'Desenvolvedor Jr', familia: 'Tecnologia', nivel: 'Junior', area: 'Tecnologia', localidade: 'São Paulo' },
  { cargo_id: '12', nome: 'Desenvolvedor Pl', familia: 'Tecnologia', nivel: 'Pleno', area: 'Tecnologia', localidade: 'Remoto' },
  { cargo_id: '13', nome: 'Desenvolvedor Sr', familia: 'Tecnologia', nivel: 'Sênior', area: 'Tecnologia', localidade: 'São Paulo' },
  { cargo_id: '14', nome: 'Tech Lead', familia: 'Tecnologia', nivel: 'Sênior', area: 'Tecnologia', localidade: 'São Paulo' },
  { cargo_id: '15', nome: 'Gerente de TI', familia: 'Tecnologia', nivel: 'Gerente', area: 'Tecnologia', localidade: 'São Paulo' },
  { cargo_id: '16', nome: 'Analista RH Jr', familia: 'Recursos Humanos', nivel: 'Junior', area: 'RH', localidade: 'São Paulo' },
  { cargo_id: '17', nome: 'Analista RH Pl', familia: 'Recursos Humanos', nivel: 'Pleno', area: 'RH', localidade: 'Belo Horizonte' },
  { cargo_id: '18', nome: 'Gerente de RH', familia: 'Recursos Humanos', nivel: 'Gerente', area: 'RH', localidade: 'São Paulo' },
  { cargo_id: '19', nome: 'Analista de Operações Pl', familia: 'Operações', nivel: 'Pleno', area: 'Operações', localidade: 'Rio de Janeiro' },
  { cargo_id: '20', nome: 'Gerente de Operações', familia: 'Operações', nivel: 'Gerente', area: 'Operações', localidade: 'Curitiba' },
];

const levelMultipliers: Record<string, number> = {
  Junior: 1,
  Pleno: 1.8,
  'Sênior': 2.8,
  Coordenador: 3.5,
  Gerente: 5.5,
  Diretor: 10,
};

const typeBaseValues: Record<string, number> = {
  bonus: 5000,
  pplr: 4000,
  comissao: 3500,
  premio: 1500,
};

const fontes = ['Pesquisa XYZ 2025', 'Survey Nacional 2025', 'Benchmark Tech 2025'];

function generateAllData(): JobVariablePayData[] {
  const data: JobVariablePayData[] = [];
  const types: VariablePayType[] = ['bonus', 'pplr', 'comissao', 'premio'];

  for (const job of jobs) {
    const mult = levelMultipliers[job.nivel] || 1;
    for (const type of types) {
      const base = typeBaseValues[type] * mult;
      // Comissão higher for commercial roles
      const areaFactor = type === 'comissao' && job.area === 'Comercial' ? 2.5 : 1;
      const adjustedBase = base * areaFactor;

      data.push({
        cargo_id: job.cargo_id,
        tipo_variavel: type,
        empresa: makeStats(adjustedBase, 0.3, `emp_${job.cargo_id}_${type}`),
        mercado: makeStats(adjustedBase, 0.25, `mkt_${job.cargo_id}_${type}`),
        n_amostra: 15 + Math.floor(seed(`n_${job.cargo_id}_${type}`) * 85),
        n_colaboradores: 2 + Math.floor(seed(`c_${job.cargo_id}_${type}`) * 18),
        fonte: fontes[Math.floor(seed(`f_${job.cargo_id}_${type}`) * fontes.length)],
        data_base: '2025-01',
      });
    }
  }
  return data;
}

export const allJobData: JobVariablePayData[] = generateAllData();

export const filterOptions = {
  anos: [2024, 2025, 2026],
  areas: [...new Set(jobs.map(j => j.area))],
  familias: [...new Set(jobs.map(j => j.familia))],
  niveis: [...new Set(jobs.map(j => j.nivel))],
  localidades: [...new Set(jobs.map(j => j.localidade))],
};
