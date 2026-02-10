import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filters, VariablePayType, VARIABLE_PAY_LABELS, Job } from '@/types/variablePay';
import { filterJobs, getDataForJobs, applyViewMode, calcDeltaPct, calcIndice, formatBRL, formatPct, formatIndice, exportToCSV, getPositionStatus } from '@/lib/variablePayUtils';
import { jobs } from '@/data/variablePayMockData';
import { ComparisonChart } from './ComparisonChart';
import { JobTable } from './JobTable';
import { JobDetailDrawer } from './JobDetailDrawer';
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { IndicatorTooltip } from './IndicatorTooltip';

interface DetailViewProps {
  type: VariablePayType;
  filters: Filters;
  onBack: () => void;
}

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

  const miniCards = [
    { label: 'P50 Empresa', tooltipKey: 'p50Empresa', value: isManager ? '••••' : formatBRL(aggEmpresa.p50), color: 'text-chart-company' },
    { label: 'P50 Mercado', tooltipKey: 'p50Mercado', value: isManager ? '••••' : formatBRL(aggMercado.p50), color: 'text-chart-market' },
    { label: 'Δ%', tooltipKey: 'deltaPct', value: formatPct(deltaPct), color: deltaPct > 5 ? 'text-positive' : deltaPct < -5 ? 'text-negative' : 'text-warning' },
    { label: 'Índice', tooltipKey: 'indice', value: formatIndice(indice), color: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{VARIABLE_PAY_LABELS[type]}</h2>
            <p className="text-sm text-muted-foreground">Análise detalhada por cargo</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* Mini-cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {miniCards.map(mc => (
          <Card key={mc.label}>
            <CardContent className="py-4 px-4">
              <IndicatorTooltip tooltipKey={mc.tooltipKey} showIcon>
                <p className="text-xs text-muted-foreground mb-1">{mc.label}</p>
              </IndicatorTooltip>
              <p className={`text-xl font-bold tabular-nums ${mc.color}`}>{mc.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
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
