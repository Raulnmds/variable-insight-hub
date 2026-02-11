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

const typeGradientStyles: Record<VariablePayType, string> = {
  bonus: 'from-[hsl(270,60%,42%)] via-[hsl(260,70%,50%)] to-[hsl(240,65%,55%)]',
  pplr: 'from-[hsl(280,55%,40%)] via-[hsl(270,65%,48%)] to-[hsl(250,60%,52%)]',
  comissao: 'from-[hsl(260,50%,38%)] via-[hsl(250,60%,46%)] to-[hsl(230,55%,50%)]',
  premio: 'from-[hsl(290,55%,42%)] via-[hsl(280,65%,50%)] to-[hsl(260,60%,55%)]',
  total: 'from-[hsl(250,25%,12%)] via-[hsl(260,40%,18%)] to-[hsl(270,50%,25%)]',
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
        <span className="relative block w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <span
            className={`absolute top-0 h-full rounded-full transition-all duration-500 ${
              indice > 1.05 ? 'bg-emerald-400' : indice < 0.95 ? 'bg-rose-400' : 'bg-amber-400'
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
      <div
        className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-2xl hover:shadow-purple-500/10"
        onClick={() => onSelectType('total')}
      >
        {/* Gradient Banner */}
        <div className={`bg-gradient-to-r ${typeGradientStyles.total} px-8 py-10 relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-2 left-16 w-24 h-24 rounded-full bg-purple-300/10 blur-xl" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Left */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-white/15 text-white border-white/20 text-[10px] tracking-wider uppercase mb-1">
                    Visão Consolidada
                  </Badge>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Total Remuneração Variável</h2>
                </div>
              </div>

              <p className="text-white/60 text-sm">Soma de Bônus + PPLR + Comissão + Prêmio</p>

              {/* Big numbers */}
              <div className="flex items-end gap-8 flex-wrap">
                <div>
                  <IndicatorTooltip tooltipKey="p50Empresa" showIcon>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">P50 Empresa</p>
                  </IndicatorTooltip>
                  <p className="text-4xl font-extrabold tabular-nums tracking-tight text-white">
                    {isManager ? '••••' : formatBRL(totalEmp.p50)}
                  </p>
                </div>
                <div className="pb-1">
                  <IndicatorTooltip tooltipKey="p50Mercado" showIcon>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">P50 Mercado</p>
                  </IndicatorTooltip>
                  <p className="text-2xl font-bold tabular-nums text-white/70">
                    {isManager ? '••••' : formatBRL(totalMkt.p50)}
                  </p>
                </div>
              </div>

              {/* Position bar */}
              <div className="max-w-sm">
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5 uppercase tracking-wider">
                  <span>Abaixo</span>
                  <span>Mercado</span>
                  <span>Acima</span>
                </div>
                <PositionBar empresa={totalEmp.p50} mercado={totalMkt.p50} />
              </div>
            </div>

            {/* Right: KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:w-[300px]">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4 text-center">
                <IndicatorTooltip tooltipKey="deltaPct" showIcon>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Δ%</p>
                </IndicatorTooltip>
                <p className={`text-2xl font-bold tabular-nums ${
                  totalDeltaPct > 5 ? 'text-emerald-400' : totalDeltaPct < -5 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {formatPct(totalDeltaPct)}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4 text-center">
                <IndicatorTooltip tooltipKey="indice" showIcon>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Índice</p>
                </IndicatorTooltip>
                <p className="text-2xl font-bold tabular-nums text-white">{totalIndice.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4 text-center">
                <IndicatorTooltip tooltipKey="posicao" showIcon>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Posição</p>
                </IndicatorTooltip>
                <div className={`flex items-center justify-center gap-1.5 text-sm font-semibold ${
                  totalStatus === 'acima' ? 'text-emerald-400' : totalStatus === 'abaixo' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  <StatusIndicator status={totalStatus} />
                  {totalStatus === 'acima' ? 'Acima' : totalStatus === 'abaixo' ? 'Abaixo' : 'Alinhado'}
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4 text-center">
                <IndicatorTooltip tooltipKey="mediaEmpresa" showIcon>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Média Emp.</p>
                </IndicatorTooltip>
                <p className="text-lg font-bold tabular-nums text-white">
                  {isManager ? '••••' : formatBRL(totalEmp.media)}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative z-10 mt-6 flex items-center justify-end text-sm text-white/70 font-medium group-hover:text-white transition-colors">
            Ver detalhamento completo <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Percentiles row - light bg */}
        <div className="bg-card border border-t-0 rounded-b-2xl px-8 py-5">
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
      </div>

      {/* ===== Individual Variable Type Cards ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Por Componente de Remuneração
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {typeComps.map(comp => {
            const emp = applyViewMode(comp.empresa, filters.viewMode);
            const mkt = applyViewMode(comp.mercado, filters.viewMode);
            const pct = calcDeltaPct(emp.p50, mkt.p50);
            const indice = calcIndice(emp.p50, mkt.p50);
            const status = getPositionStatus(emp.p50, mkt.p50);
            const Icon = typeIcons[comp.tipo];

            return (
              <div
                key={comp.tipo}
                className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
                onClick={() => onSelectType(comp.tipo)}
              >
                {/* Gradient Banner */}
                <div className={`bg-gradient-to-r ${typeGradientStyles[comp.tipo]} px-5 py-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 blur-xl" />
                  </div>
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{VARIABLE_PAY_LABELS[comp.tipo]}</h4>
                      <p className="text-white/50 text-[11px] mt-0.5">{typeDescriptions[comp.tipo]}</p>
                    </div>
                  </div>

                  {/* Position bar on banner */}
                  <div className="relative z-10 mt-4">
                    <PositionBar empresa={emp.p50} mercado={mkt.p50} />
                  </div>
                </div>

                {/* Card body */}
                <div className="bg-card border border-t-0 rounded-b-2xl px-5 py-4 space-y-3">
                  {/* Main metric */}
                  {!isManager && (
                    <div>
                      <IndicatorTooltip tooltipKey="p50">
                        <p className="text-xl font-bold tabular-nums text-foreground">{formatBRL(emp.p50)}</p>
                      </IndicatorTooltip>
                      <p className="text-xs text-muted-foreground tabular-nums">vs {formatBRL(mkt.p50)} mercado</p>
                    </div>
                  )}

                  {/* Bottom metrics */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <IndicatorTooltip tooltipKey="deltaPct">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Δ%</p>
                      </IndicatorTooltip>
                      <p className={`text-sm font-bold tabular-nums ${
                        pct > 5 ? 'text-positive' : pct < -5 ? 'text-negative' : 'text-warning'
                      }`}>{formatPct(pct)}</p>
                    </div>
                    <div className="text-center">
                      <IndicatorTooltip tooltipKey="indice">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Índice</p>
                      </IndicatorTooltip>
                      <p className="text-sm font-bold tabular-nums text-foreground">{indice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <IndicatorTooltip tooltipKey="posicao">
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          status === 'acima' ? 'text-positive' : status === 'abaixo' ? 'text-negative' : 'text-warning'
                        }`}>
                          <StatusIndicator status={status} />
                          {status === 'acima' ? 'Acima' : status === 'abaixo' ? 'Abaixo' : 'Alinhado'}
                        </div>
                      </IndicatorTooltip>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
