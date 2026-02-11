import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filters, VariablePayType, VARIABLE_PAY_LABELS, Job } from '@/types/variablePay';
import { filterJobs, getDataForJobs, applyViewMode, calcDeltaPct, calcIndice, formatBRL, formatPct, formatIndice, exportToCSV, getPositionStatus } from '@/lib/variablePayUtils';
import { jobs } from '@/data/variablePayMockData';
import { ComparisonChart } from './ComparisonChart';
import { JobTable } from './JobTable';
import { JobDetailDrawer } from './JobDetailDrawer';
import { ArrowLeft, Download, AlertTriangle, DollarSign, Target, BarChart3, Award, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { IndicatorTooltip } from './IndicatorTooltip';

interface DetailViewProps {
  type: VariablePayType;
  filters: Filters;
  onBack: () => void;
}

const typeIcons: Record<VariablePayType, typeof DollarSign> = {
  bonus: DollarSign,
  pplr: Target,
  comissao: BarChart3,
  premio: Award,
  total: Sparkles,
};

const typeGradientStyles: Record<VariablePayType, string> = {
  bonus: 'from-[hsl(270,60%,42%)] via-[hsl(260,70%,50%)] to-[hsl(240,65%,55%)]',
  pplr: 'from-[hsl(280,55%,40%)] via-[hsl(270,65%,48%)] to-[hsl(250,60%,52%)]',
  comissao: 'from-[hsl(260,50%,38%)] via-[hsl(250,60%,46%)] to-[hsl(230,55%,50%)]',
  premio: 'from-[hsl(290,55%,42%)] via-[hsl(280,65%,50%)] to-[hsl(260,60%,55%)]',
  total: 'from-[hsl(250,25%,12%)] via-[hsl(260,40%,18%)] to-[hsl(270,50%,25%)]',
};

function aggregateFromList(list: { p25: number; p50: number; p75: number; p90: number; media: number }[]) {
  if (!list.length) return { p25: 0, p50: 0, p75: 0, p90: 0, media: 0 };
  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  return {
    p25: avg(list.map(s => s.p25)),
    p50: avg(list.map(s => s.p50)),
    p75: avg(list.map(s => s.p75)),
    p90: avg(list.map(s => s.p90)),
    media: avg(list.map(s => s.media)),
  };
}

export function DetailView({ type, filters, onBack }: DetailViewProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => filterJobs(filters), [filters]);
  const jobIds = useMemo(() => filteredJobs.map(j => j.cargo_id), [filteredJobs]);
  const data = useMemo(() => getDataForJobs(jobIds, type), [jobIds, type]);

  const aggEmpresa = useMemo(() => applyViewMode(aggregateFromList(data.map(d => d.empresa)), filters.viewMode), [data, filters.viewMode]);
  const aggMercado = useMemo(() => applyViewMode(aggregateFromList(data.map(d => d.mercado)), filters.viewMode), [data, filters.viewMode]);

  const deltaPct = calcDeltaPct(aggEmpresa.p50, aggMercado.p50);
  const indice = calcIndice(aggEmpresa.p50, aggMercado.p50);
  const status = getPositionStatus(aggEmpresa.p50, aggMercado.p50);
  const isManager = filters.userRole === 'manager';

  const selectedJob = selectedJobId ? jobs.find(j => j.cargo_id === selectedJobId) || null : null;
  const selectedData = selectedJobId ? data.find(d => d.cargo_id === selectedJobId) || null : null;

  const handleExport = () => {
    const headers = ['Cargo', 'Família', 'Nível', 'P50 Empresa', 'P50 Mercado', 'Índice P50', 'Δ% P50'];
    const rows = data.map(d => {
      const job = jobs.find(j => j.cargo_id === d.cargo_id);
      const emp = applyViewMode(d.empresa, filters.viewMode);
      const mkt = applyViewMode(d.mercado, filters.viewMode);
      return [
        job?.nome || '', job?.familia || '', job?.nivel || '',
        String(emp.p50), String(mkt.p50),
        calcIndice(emp.p50, mkt.p50).toFixed(2),
        `${calcDeltaPct(emp.p50, mkt.p50).toFixed(1)}%`,
      ];
    });
    exportToCSV(headers, rows, `remuneracao-variavel-${type}-detalhe-${filters.ano}.csv`);
    toast.success('Exportação realizada');
  };

  const Icon = typeIcons[type];

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">Dados insuficientes para este filtro</h3>
            <p className="text-sm text-muted-foreground">Tente relaxar os filtros aplicados para obter resultados.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className={`rounded-2xl bg-gradient-to-r ${typeGradientStyles[type]} px-8 py-8 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-12 w-28 h-28 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-1.5 text-white/70 hover:text-white hover:bg-white/10" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{VARIABLE_PAY_LABELS[type]}</h2>
                <p className="text-sm text-white/50">Análise detalhada por cargo</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleExport}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <IndicatorTooltip tooltipKey="p50Empresa" showIcon>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">P50 Empresa</p>
              </IndicatorTooltip>
              <p className="text-xl font-bold tabular-nums text-white">{isManager ? '••••' : formatBRL(aggEmpresa.p50)}</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <IndicatorTooltip tooltipKey="p50Mercado" showIcon>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">P50 Mercado</p>
              </IndicatorTooltip>
              <p className="text-xl font-bold tabular-nums text-white/80">{isManager ? '••••' : formatBRL(aggMercado.p50)}</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <IndicatorTooltip tooltipKey="deltaPct" showIcon>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Δ%</p>
              </IndicatorTooltip>
              <p className={`text-xl font-bold tabular-nums ${
                deltaPct > 5 ? 'text-emerald-400' : deltaPct < -5 ? 'text-rose-400' : 'text-amber-400'
              }`}>{formatPct(deltaPct)}</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <IndicatorTooltip tooltipKey="indice" showIcon>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Índice</p>
              </IndicatorTooltip>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold tabular-nums text-white">{formatIndice(indice)}</p>
                <span className={`flex items-center text-xs ${
                  status === 'acima' ? 'text-emerald-400' : status === 'abaixo' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {status === 'acima' ? <TrendingUp className="h-3.5 w-3.5" /> : status === 'abaixo' ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-4">Comparativo por Estatística — Empresa × Mercado</h3>
          <ComparisonChart empresa={aggEmpresa} mercado={aggMercado} hideValues={isManager} />
        </CardContent>
      </Card>

      {/* Table */}
      <div>
        <h3 className="text-sm font-medium mb-3">Detalhamento por Cargo</h3>
        <JobTable jobs={filteredJobs} data={data} filters={filters} onSelectJob={setSelectedJobId} />
      </div>

      {/* Drawer */}
      <JobDetailDrawer
        open={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
        job={selectedJob}
        data={selectedData}
        filters={filters}
      />
    </div>
  );
}
