import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filters, VariablePayType, VARIABLE_PAY_LABELS, STAT_KEYS, STAT_LABELS } from '@/types/variablePay';
import { getAggregatedComparisons, applyViewMode, calcDeltaPct, calcIndice, getPositionStatus, formatBRL, formatPct, exportToCSV, generateInsights } from '@/lib/variablePayUtils';
import { TrendingUp, TrendingDown, Minus, Download, FileText, ArrowRight, DollarSign, Target, BarChart3, Award } from 'lucide-react';
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
  total: DollarSign,
};

const typeGradients: Record<VariablePayType, string> = {
  bonus: 'from-blue-500/10 to-indigo-500/10 hover:from-blue-500/15 hover:to-indigo-500/15',
  pplr: 'from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15',
  comissao: 'from-amber-500/10 to-orange-500/10 hover:from-amber-500/15 hover:to-orange-500/15',
  premio: 'from-purple-500/10 to-pink-500/10 hover:from-purple-500/15 hover:to-pink-500/15',
  total: '',
};

const typeAccentBorder: Record<VariablePayType, string> = {
  bonus: 'border-l-blue-500',
  pplr: 'border-l-emerald-500',
  comissao: 'border-l-amber-500',
  premio: 'border-l-purple-500',
  total: '',
};

const statTooltipKeys: Record<string, string> = {
  p25: 'p25',
  p50: 'p50',
  p75: 'p75',
  p90: 'p90',
  media: 'media',
};

function PositionBar({ empresa, mercado }: { empresa: number; mercado: number }) {
  const indice = mercado > 0 ? empresa / mercado : 1;
  const pct = Math.min(Math.max((indice - 0.7) / 0.6, 0), 1) * 100;
  const midpoint = ((1.0 - 0.7) / 0.6) * 100;

  return (
    <IndicatorTooltip tooltipKey="barPosicao">
      <span className="block w-full">
        <span className="relative block w-full h-2 bg-muted rounded-full overflow-hidden">
          <span className="absolute top-0 h-full bg-muted-foreground/20 rounded-full" style={{ left: `${midpoint - 1}%`, width: '2%' }} />
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
    <div className="space-y-8">
      {/* Actions row */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSummary}>
          <FileText className="h-4 w-4" /> Gerar Resumo
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* ===== HERO: Total Consolidado ===== */}
      <Card
        className="overflow-hidden cursor-pointer transition-all hover:shadow-xl group border-0 shadow-lg"
        onClick={() => onSelectType('total')}
      >
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Left: Title + main metric */}
              <div className="flex-1 space-y-5">
                <div>
                  <Badge variant="secondary" className="mb-2 text-xs font-medium">Visão Consolidada</Badge>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Total Remuneração Variável</h2>
                  <p className="text-sm text-muted-foreground mt-1">Soma de Bônus + PPLR + Comissão + Prêmio</p>
                </div>

                {/* Big number */}
                <div className="flex items-end gap-6 flex-wrap">
                  <div>
                    <IndicatorTooltip tooltipKey="p50Empresa" showIcon>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">P50 Empresa</p>
                    </IndicatorTooltip>
                    <p className="text-4xl font-extrabold tabular-nums tracking-tight text-foreground">
                      {isManager ? '••••' : formatBRL(totalEmp.p50)}
                    </p>
                  </div>
                  <div className="pb-1">
                    <IndicatorTooltip tooltipKey="p50Mercado" showIcon>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">P50 Mercado</p>
                    </IndicatorTooltip>
                    <p className="text-2xl font-bold tabular-nums text-muted-foreground">
                      {isManager ? '••••' : formatBRL(totalMkt.p50)}
                    </p>
                  </div>
                </div>

                {/* Position bar */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Abaixo</span>
                    <span>Mercado</span>
                    <span>Acima</span>
                  </div>
                  <PositionBar empresa={totalEmp.p50} mercado={totalMkt.p50} />
                </div>
              </div>

              {/* Right: KPI cards */}
              <div className="grid grid-cols-2 gap-4 lg:w-[340px]">
                <div className="rounded-xl bg-card border p-4 text-center">
                  <IndicatorTooltip tooltipKey="deltaPct" showIcon>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Δ%</p>
                  </IndicatorTooltip>
                  <p className={`text-2xl font-bold tabular-nums ${
                    totalDeltaPct > 5 ? 'text-positive' : totalDeltaPct < -5 ? 'text-negative' : 'text-warning'
                  }`}>
                    {formatPct(totalDeltaPct)}
                  </p>
                </div>
                <div className="rounded-xl bg-card border p-4 text-center">
                  <IndicatorTooltip tooltipKey="indice" showIcon>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Índice</p>
                  </IndicatorTooltip>
                  <p className="text-2xl font-bold tabular-nums text-foreground">{totalIndice.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-card border p-4 text-center">
                  <IndicatorTooltip tooltipKey="posicao" showIcon>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Posição</p>
                  </IndicatorTooltip>
                  <Badge variant="outline" className={`text-xs mt-0.5 ${
                    totalStatus === 'acima' ? 'bg-positive/10 text-positive border-positive/20' :
                    totalStatus === 'abaixo' ? 'bg-negative/10 text-negative border-negative/20' :
                    'bg-warning/10 text-warning border-warning/20'
                  }`}>
                    {totalStatus === 'acima' ? '↑ Acima' : totalStatus === 'abaixo' ? '↓ Abaixo' : '→ Alinhado'}
                  </Badge>
                </div>
                <div className="rounded-xl bg-card border p-4 text-center">
                  <IndicatorTooltip tooltipKey="mediaEmpresa" showIcon>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Média Emp.</p>
                  </IndicatorTooltip>
                  <p className="text-lg font-bold tabular-nums text-foreground">
                    {isManager ? '••••' : formatBRL(totalEmp.media)}
                  </p>
                </div>
              </div>
            </div>

            {/* Percentiles row */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="grid grid-cols-5 gap-4">
                {STAT_KEYS.map(key => {
                  const emp = totalEmp[key];
                  const mkt = totalMkt[key];
                  const pct = calcDeltaPct(emp, mkt);
                  const color = pct > 5 ? 'text-positive' : pct < -5 ? 'text-negative' : 'text-warning';
                  return (
                    <div key={key} className="text-center">
                      <IndicatorTooltip tooltipKey={statTooltipKeys[key]} showIcon>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{STAT_LABELS[key]}</p>
                      </IndicatorTooltip>
                      {!isManager && (
                        <p className="text-sm font-semibold tabular-nums mt-1">{formatBRL(emp)}</p>
                      )}
                      {!isManager && (
                        <p className="text-xs text-muted-foreground tabular-nums">vs {formatBRL(mkt)}</p>
                      )}
                      <p className={`text-xs font-medium tabular-nums ${color}`}>{formatPct(pct)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 flex items-center justify-end text-sm text-primary font-medium group-hover:underline">
              Ver detalhamento completo <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        </div>
      </Card>

      {/* ===== Individual Variable Type Cards ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Por Componente de Remuneração</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group border-l-4 ${typeAccentBorder[comp.tipo]} bg-gradient-to-br ${typeGradients[comp.tipo]}`}
                onClick={() => onSelectType(comp.tipo)}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-card border flex items-center justify-center">
                        <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold text-sm">{VARIABLE_PAY_LABELS[comp.tipo]}</h4>
                    </div>
                    <IndicatorTooltip tooltipKey="posicao">
                      <Badge variant="outline" className={`text-[10px] ${
                        status === 'acima' ? 'bg-positive/10 text-positive border-positive/20' :
                        status === 'abaixo' ? 'bg-negative/10 text-negative border-negative/20' :
                        'bg-warning/10 text-warning border-warning/20'
                      }`}>
                        {status === 'acima' ? '↑' : status === 'abaixo' ? '↓' : '→'}
                      </Badge>
                    </IndicatorTooltip>
                  </div>

                  {/* Main metric */}
                  {!isManager && (
                    <div className="mb-3">
                      <IndicatorTooltip tooltipKey="p50">
                        <p className="text-xl font-bold tabular-nums">{formatBRL(emp.p50)}</p>
                      </IndicatorTooltip>
                      <p className="text-xs text-muted-foreground tabular-nums">vs {formatBRL(mkt.p50)} mercado</p>
                    </div>
                  )}

                  {/* Position bar */}
                  <PositionBar empresa={emp.p50} mercado={mkt.p50} />

                  {/* Bottom metrics */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                    <div>
                      <IndicatorTooltip tooltipKey="deltaPct">
                        <p className="text-[10px] text-muted-foreground uppercase">Δ%</p>
                      </IndicatorTooltip>
                      <p className={`text-sm font-bold tabular-nums ${
                        pct > 5 ? 'text-positive' : pct < -5 ? 'text-negative' : 'text-warning'
                      }`}>{formatPct(pct)}</p>
                    </div>
                    <div className="text-right">
                      <IndicatorTooltip tooltipKey="indice">
                        <p className="text-[10px] text-muted-foreground uppercase">Índice</p>
                      </IndicatorTooltip>
                      <p className="text-sm font-bold tabular-nums">{indice.toFixed(2)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
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
