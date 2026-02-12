import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filters, VariablePayType, VARIABLE_PAY_LABELS, STAT_KEYS, STAT_LABELS } from '@/types/variablePay';
import { getAggregatedComparisons, applyViewMode, calcDeltaPct, calcIndice, getPositionStatus, formatBRL, formatPct, exportToCSV, generateInsights } from '@/lib/variablePayUtils';
import { TrendingUp, TrendingDown, Minus, Download, FileText, ArrowRight, DollarSign, Target, BarChart3, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { IndicatorTooltip } from './IndicatorTooltip';

interface MacroViewProps {
  filters: Filters;
  onSelectType: (type: VariablePayType) => void;
}

const typeIcons: Record<VariablePayType, typeof DollarSign> = {
  bonus: DollarSign,
  pplr: Target,
  comissao: BarChart3,
  premio: Award,
  total: Sparkles,
};

const typeDescriptions: Record<VariablePayType, string> = {
  bonus: 'Pagamento por performance individual e corporativa',
  pplr: 'Participação nos lucros e resultados',
  comissao: 'Remuneração proporcional a vendas e metas',
  premio: 'Reconhecimento por entregas excepcionais',
  total: 'Consolidação de todas as variáveis',
};

const statTooltipKeys: Record<string, string> = {
  p25: 'p25', p50: 'p50', p75: 'p75', p90: 'p90', media: 'media',
};

function StatusIndicator({ status }: { status: 'acima' | 'abaixo' | 'alinhado' }) {
  if (status === 'acima') return <TrendingUp className="h-4 w-4" />;
  if (status === 'abaixo') return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

function PositionBar({ empresa, mercado }: { empresa: number; mercado: number }) {
  const indice = mercado > 0 ? empresa / mercado : 1;
  const pct = Math.min(Math.max((indice - 0.7) / 0.6, 0), 1) * 100;

  return (
    <IndicatorTooltip tooltipKey="barPosicao">
      <span className="block w-full">
        <span className="relative block w-full h-1.5 bg-grayscale-20 rounded-full overflow-hidden">
          <span
            className={`absolute top-0 h-full rounded-full transition-all duration-500 ${
              indice > 1.05 ? 'bg-positive' : indice < 0.95 ? 'bg-negative' : 'bg-warning'
            }`}
            style={{ width: `${pct}%` }}
          />
        </span>
      </span>
    </IndicatorTooltip>
  );
}

export function MacroView({ filters, onSelectType }: MacroViewProps) {
  const comparisons = useMemo(() => getAggregatedComparisons(filters), [filters]);

  const totalComp = comparisons.find(c => c.tipo === 'total');
  const typeComps = comparisons.filter(c => c.tipo !== 'total');

  const handleExport = () => {
    const headers = ['Tipo', 'Estatística', 'Empresa', 'Mercado', 'Δ%', 'Índice'];
    const rows: string[][] = [];
    for (const c of comparisons) {
      const emp = applyViewMode(c.empresa, filters.viewMode);
      const mkt = applyViewMode(c.mercado, filters.viewMode);
      for (const key of STAT_KEYS) {
        rows.push([
          VARIABLE_PAY_LABELS[c.tipo], STAT_LABELS[key],
          String(emp[key]), String(mkt[key]),
          `${calcDeltaPct(emp[key], mkt[key]).toFixed(1)}%`,
          (emp[key] / mkt[key]).toFixed(2),
        ]);
      }
    }
    exportToCSV(headers, rows, `remuneracao-variavel-macro-${filters.ano}.csv`);
    toast.success('Exportação realizada');
  };

  const handleSummary = () => {
    const text = generateInsights(comparisons, filters);
    navigator.clipboard.writeText(text);
    toast.success('Resumo copiado para a área de transferência');
  };

  const isManager = filters.userRole === 'manager';

  if (!totalComp) return null;

  const totalEmp = applyViewMode(totalComp.empresa, filters.viewMode);
  const totalMkt = applyViewMode(totalComp.mercado, filters.viewMode);
  const totalDeltaPct = calcDeltaPct(totalEmp.p50, totalMkt.p50);
  const totalIndice = calcIndice(totalEmp.p50, totalMkt.p50);
  const totalStatus = getPositionStatus(totalEmp.p50, totalMkt.p50);

  return (
    <div className="space-y-xbig">
      {/* Actions row */}
      <div className="flex items-center justify-end gap-xs">
        <Button variant="outline" size="sm" className="gap-1.5 text-label" onClick={handleSummary}>
          <FileText className="h-4 w-4" /> Gerar Resumo
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-label" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* ===== HERO: Total Consolidado ===== */}
      <Card
        className="rounded-huge overflow-hidden cursor-pointer group transition-all hover:shadow-dp04 shadow-dp02 border-0"
        onClick={() => onSelectType('total')}
      >
        {/* Header band */}
        <div className="bg-primary px-xmd py-xmd">
          <div className="flex flex-col lg:flex-row lg:items-center gap-xmd">
            {/* Left */}
            <div className="flex-1 space-y-default-space">
              <div className="flex items-center gap-sm-space">
                <div className="h-12 w-12 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <Badge className="bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 text-small tracking-wider uppercase mb-1">
                    Visão Consolidada
                  </Badge>
                  <h2 className="text-h2-bold text-primary-foreground">Total Remuneração Variável</h2>
                </div>
              </div>

              <p className="text-small text-primary-foreground/60">Soma de Bônus + PPLR + Comissão + Prêmio</p>

              {/* Big numbers */}
              <div className="flex items-end gap-xmd flex-wrap">
                <div>
                  <IndicatorTooltip tooltipKey="p50Empresa" showIcon>
                    <p className="text-small text-primary-foreground/50 uppercase tracking-widest mb-xxs">P50 Empresa</p>
                  </IndicatorTooltip>
                  <p className="text-[32px] font-bold tabular-nums tracking-tight text-primary-foreground font-heading">
                    {isManager ? '••••' : formatBRL(totalEmp.p50)}
                  </p>
                </div>
                <div className="pb-1">
                  <IndicatorTooltip tooltipKey="p50Mercado" showIcon>
                    <p className="text-small text-primary-foreground/50 uppercase tracking-widest mb-xxs">P50 Mercado</p>
                  </IndicatorTooltip>
                  <p className="text-h2-bold tabular-nums text-primary-foreground/70">
                    {isManager ? '••••' : formatBRL(totalMkt.p50)}
                  </p>
                </div>
              </div>

              {/* Position bar */}
              <div className="max-w-sm">
                <div className="flex items-center justify-between text-small text-primary-foreground/40 mb-xxs uppercase tracking-wider">
                  <span>Abaixo</span>
                  <span>Mercado</span>
                  <span>Acima</span>
                </div>
                <PositionBar empresa={totalEmp.p50} mercado={totalMkt.p50} />
              </div>
            </div>

            {/* Right: KPI cards */}
            <div className="grid grid-cols-2 gap-sm-space lg:w-[300px]">
              <div className="rounded-lg bg-primary-foreground/10 p-default-space text-center">
                <IndicatorTooltip tooltipKey="deltaPct" showIcon>
                  <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">Δ%</p>
                </IndicatorTooltip>
                <p className={`text-h2-bold tabular-nums ${
                  totalDeltaPct > 5 ? 'text-positive-foreground' : totalDeltaPct < -5 ? 'text-primary-foreground' : 'text-primary-foreground'
                }`}>
                  {formatPct(totalDeltaPct)}
                </p>
              </div>
              <div className="rounded-lg bg-primary-foreground/10 p-default-space text-center">
                <IndicatorTooltip tooltipKey="indice" showIcon>
                  <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">Índice</p>
                </IndicatorTooltip>
                <p className="text-h2-bold tabular-nums text-primary-foreground">{totalIndice.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-primary-foreground/10 p-default-space text-center">
                <IndicatorTooltip tooltipKey="posicao" showIcon>
                  <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">Posição</p>
                </IndicatorTooltip>
                <div className={`flex items-center justify-center gap-xxs text-label-bold ${
                  totalStatus === 'acima' ? 'text-primary-foreground' : totalStatus === 'abaixo' ? 'text-primary-foreground' : 'text-primary-foreground'
                }`}>
                  <StatusIndicator status={totalStatus} />
                  {totalStatus === 'acima' ? 'Acima' : totalStatus === 'abaixo' ? 'Abaixo' : 'Alinhado'}
                </div>
              </div>
              <div className="rounded-lg bg-primary-foreground/10 p-default-space text-center">
                <IndicatorTooltip tooltipKey="mediaEmpresa" showIcon>
                  <p className="text-small text-primary-foreground/50 uppercase tracking-wider mb-xxs">Média Emp.</p>
                </IndicatorTooltip>
                <p className="text-label-bold tabular-nums text-primary-foreground">
                  {isManager ? '••••' : formatBRL(totalEmp.media)}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-default-space flex items-center justify-end text-label text-primary-foreground/70 font-medium group-hover:text-primary-foreground transition-colors">
            Ver detalhamento completo <ArrowRight className="h-4 w-4 ml-xxs transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Percentiles row */}
        <CardContent className="bg-card px-xmd py-md-space">
          <div className="grid grid-cols-5 gap-default-space">
            {STAT_KEYS.map(key => {
              const emp = totalEmp[key];
              const mkt = totalMkt[key];
              const pct = calcDeltaPct(emp, mkt);
              const color = pct > 5 ? 'text-positive' : pct < -5 ? 'text-negative' : 'text-warning';
              return (
                <div key={key} className="text-center">
                  <IndicatorTooltip tooltipKey={statTooltipKeys[key]} showIcon>
                    <p className="text-small text-muted-foreground uppercase tracking-wider">{STAT_LABELS[key]}</p>
                  </IndicatorTooltip>
                  {!isManager && (
                    <p className="text-label-bold tabular-nums mt-xxs">{formatBRL(emp)}</p>
                  )}
                  {!isManager && (
                    <p className="text-small text-muted-foreground tabular-nums">vs {formatBRL(mkt)}</p>
                  )}
                  <p className={`text-small-bold tabular-nums ${color}`}>{formatPct(pct)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ===== Individual Variable Type Cards ===== */}
      <div>
        <h3 className="text-h3-caps text-muted-foreground mb-default-space">
          Por Componente de Remuneração
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-xmd">
          {typeComps.map(comp => {
            const emp = applyViewMode(comp.empresa, filters.viewMode);
            const mkt = applyViewMode(comp.mercado, filters.viewMode);
            const pct = calcDeltaPct(emp.p50, mkt.p50);
            const indice = calcIndice(emp.p50, mkt.p50);
            const status = getPositionStatus(emp.p50, mkt.p50);
            const Icon = typeIcons[comp.tipo];

            return (
              <Card
                key={comp.tipo}
                className="rounded-huge overflow-hidden cursor-pointer group transition-all hover:shadow-dp04 shadow-dp02 border-0"
                onClick={() => onSelectType(comp.tipo)}
              >
                {/* Header band */}
                <div className="bg-primary px-md-space py-md-space relative overflow-hidden">
                  <div className="flex items-center gap-sm-space">
                    <div className="h-10 w-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="text-label-bold text-primary-foreground">{VARIABLE_PAY_LABELS[comp.tipo]}</h4>
                      <p className="text-small text-primary-foreground/50 mt-xxs">{typeDescriptions[comp.tipo]}</p>
                    </div>
                  </div>

                  {/* Position bar on banner */}
                  <div className="mt-default-space">
                    <PositionBar empresa={emp.p50} mercado={mkt.p50} />
                  </div>
                </div>

                {/* Card body */}
                <CardContent className="bg-card px-md-space py-default-space space-y-sm-space">
                  {/* Main metric */}
                  {!isManager && (
                    <div>
                      <IndicatorTooltip tooltipKey="p50">
                        <p className="text-h2-bold tabular-nums text-foreground">{formatBRL(emp.p50)}</p>
                      </IndicatorTooltip>
                      <p className="text-small text-muted-foreground tabular-nums">vs {formatBRL(mkt.p50)} mercado</p>
                    </div>
                  )}

                  {/* Bottom metrics */}
                  <div className="flex items-center justify-between pt-sm-space border-t border-border">
                    <div>
                      <IndicatorTooltip tooltipKey="deltaPct">
                        <p className="text-small text-muted-foreground uppercase tracking-wider">Δ%</p>
                      </IndicatorTooltip>
                      <p className={`text-label-bold tabular-nums ${
                        pct > 5 ? 'text-positive' : pct < -5 ? 'text-negative' : 'text-warning'
                      }`}>{formatPct(pct)}</p>
                    </div>
                    <div className="text-center">
                      <IndicatorTooltip tooltipKey="indice">
                        <p className="text-small text-muted-foreground uppercase tracking-wider">Índice</p>
                      </IndicatorTooltip>
                      <p className="text-label-bold tabular-nums text-foreground">{indice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <IndicatorTooltip tooltipKey="posicao">
                        <div className={`flex items-center gap-xxs text-small-bold ${
                          status === 'acima' ? 'text-positive' : status === 'abaixo' ? 'text-negative' : 'text-warning'
                        }`}>
                          <StatusIndicator status={status} />
                          {status === 'acima' ? 'Acima' : status === 'abaixo' ? 'Abaixo' : 'Alinhado'}
                        </div>
                      </IndicatorTooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
