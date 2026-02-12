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
      <div className="space-y-default-space">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Card className="rounded-huge shadow-dp02 border-0">
          <CardContent className="py-xxbig text-center">
            <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-sm-space" />
            <h3 className="text-h3-bold mb-xxs">Dados insuficientes para este filtro</h3>
            <p className="text-label text-muted-foreground">Tente relaxar os filtros aplicados para obter resultados.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-xmd">
      {/* Hero header */}
      <Card className="rounded-huge overflow-hidden shadow-dp02 border-0">
        <div className="bg-primary px-xmd py-xmd">
          <div className="flex items-center justify-between mb-xmd">
            <div className="flex items-center gap-sm-space">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-h2-bold text-primary-foreground">{VARIABLE_PAY_LABELS[type]}</h2>
                <p className="text-small text-primary-foreground/50">Análise detalhada por cargo</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20" onClick={handleExport}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm-space">
            <div className="rounded-lg bg-primary-foreground/10 p-default-space">
              <IndicatorTooltip tooltipKey="p50Empresa" showIcon>
                <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">P50 Empresa</p>
              </IndicatorTooltip>
              <p className="text-h2-bold tabular-nums text-primary-foreground">{isManager ? '••••' : formatBRL(aggEmpresa.p50)}</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-default-space">
              <IndicatorTooltip tooltipKey="p50Mercado" showIcon>
                <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">P50 Mercado</p>
              </IndicatorTooltip>
              <p className="text-h2-bold tabular-nums text-primary-foreground/80">{isManager ? '••••' : formatBRL(aggMercado.p50)}</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-default-space">
              <IndicatorTooltip tooltipKey="deltaPct" showIcon>
                <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">Δ%</p>
              </IndicatorTooltip>
              <p className={`text-h2-bold tabular-nums ${
                deltaPct > 5 ? 'text-primary-foreground' : deltaPct < -5 ? 'text-primary-foreground' : 'text-primary-foreground'
              }`}>{formatPct(deltaPct)}</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-default-space">
              <IndicatorTooltip tooltipKey="indice" showIcon>
                <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">Índice</p>
              </IndicatorTooltip>
              <div className="flex items-center gap-xs">
                <p className="text-h2-bold tabular-nums text-primary-foreground">{formatIndice(indice)}</p>
                <span className={`flex items-center text-small ${
                  status === 'acima' ? 'text-primary-foreground' : status === 'abaixo' ? 'text-primary-foreground' : 'text-primary-foreground'
                }`}>
                  {status === 'acima' ? <TrendingUp className="h-3.5 w-3.5" /> : status === 'abaixo' ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className="rounded-huge shadow-dp02 border-0">
        <CardContent className="pt-xmd">
          <h3 className="text-h3-caps text-muted-foreground mb-default-space">Comparativo por Estatística — Empresa × Mercado</h3>
          <ComparisonChart empresa={aggEmpresa} mercado={aggMercado} hideValues={isManager} />
        </CardContent>
      </Card>

      {/* Table */}
      <div>
        <h3 className="text-h3-caps text-muted-foreground mb-sm-space">Detalhamento por Cargo</h3>
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
