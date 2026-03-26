import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filters, VariablePayType, VARIABLE_PAY_LABELS, STAT_KEYS, STAT_LABELS } from '@/types/variablePay';
import { getAggregatedComparisons, applyViewMode, calcDeltaPct, calcIndice, getPositionStatus, formatBRL, formatPct, exportToCSV, generateInsights } from '@/lib/variablePayUtils';
import { TrendingUp, TrendingDown, Minus, Download, FileText, ArrowRight, DollarSign, Target, BarChart3, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { IndicatorTooltip } from './IndicatorTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
              indice > 1.05 ? 'bg-positive' : indice < 0.95 ? 'bg-negative' : 'bg-primary'
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
        className="rounded-xxl overflow-hidden cursor-pointer group transition-all hover:shadow-dp04 shadow-dp02 border border-border"
        onClick={() => onSelectType('total')}
      >
        <CardContent className="p-xmd">
          <div className="flex flex-col lg:flex-row lg:items-start gap-xmd">
            {/* Left */}
            <div className="flex-1 space-y-default-space">
              <div>
                <Badge variant="secondary" className="text-small tracking-wider uppercase mb-1">
                  Visão Consolidada
                </Badge>
                <p className="text-small text-muted-foreground mt-xxs">
                  {[filters.familia || 'Todos os cargos', filters.nivel || 'Todos os níveis', filters.area || 'Todos os segmentos'].join(' - ')}
                </p>
                <h2 className="text-h2-bold text-foreground">Total Remuneração Variável</h2>
              </div>

              <p className="text-small text-muted-foreground">Soma de Bônus + PPLR + Comissão + Prêmio</p>

              {/* Big numbers */}
              <div className="flex items-start gap-xmd flex-wrap">
                <div>
                  <IndicatorTooltip tooltipKey="p50Mercado" showIcon>
                    <p className="text-small text-chart-market uppercase tracking-widest mb-xxs">P50 Mercado</p>
                  </IndicatorTooltip>
                  <p className={`text-[32px] font-bold tabular-nums tracking-tight font-heading ${totalMkt.p50 >= totalEmp.p50 ? 'text-chart-market' : 'text-chart-market/50'}`}>
                    {isManager ? '••••' : formatBRL(totalMkt.p50)}
                  </p>
                </div>
                <div>
                  <IndicatorTooltip tooltipKey="p50Empresa" showIcon>
                    <p className="text-small text-chart-company uppercase tracking-widest mb-xxs">P50 Empresa</p>
                  </IndicatorTooltip>
                  <p className={`text-[32px] font-bold tabular-nums tracking-tight font-heading ${totalEmp.p50 >= totalMkt.p50 ? 'text-chart-company' : 'text-chart-company/50'}`}>
                    {isManager ? '••••' : formatBRL(totalEmp.p50)}
                  </p>
                </div>
              </div>

              {/* Position bar */}
              <div className="max-w-sm">
                <PositionBar empresa={totalEmp.p50} mercado={totalMkt.p50} />
              </div>
            </div>

            {/* Right: KPI cards */}
            <div className="grid grid-cols-3 gap-sm-space lg:w-[340px]">
              <div className="rounded-lg bg-grayscale-5 border border-border p-default-space text-center">
                <IndicatorTooltip tooltipKey="deltaPct" showIcon>
                  <p className="text-small text-muted-foreground uppercase tracking-wider mb-xxs">Δ%</p>
                </IndicatorTooltip>
                <p className={`text-h2-bold tabular-nums ${
                  totalDeltaPct < 0 ? 'text-negative' : 'text-foreground'
                }`}>
                  {formatPct(totalDeltaPct)}
                </p>
              </div>
              <div className="rounded-lg bg-grayscale-5 border border-border p-default-space text-center">
                <IndicatorTooltip tooltipKey="posicao" showIcon>
                  <p className="text-small text-muted-foreground uppercase tracking-wider mb-xxs">Posição</p>
                </IndicatorTooltip>
                <div className={`flex items-center justify-center gap-xxs text-label-bold ${
                  totalStatus === 'abaixo' ? 'text-negative' : 'text-foreground'
                }`}>
                  <StatusIndicator status={totalStatus} />
                  {totalStatus === 'acima' ? 'Acima' : totalStatus === 'abaixo' ? 'Abaixo' : 'Alinhado'}
                </div>
              </div>
              <div className="rounded-lg bg-grayscale-5 border border-border p-default-space text-center">
                <IndicatorTooltip tooltipKey="mediaEmpresa" showIcon>
                  <p className="text-small text-muted-foreground uppercase tracking-wider mb-xxs">Média Emp.</p>
                </IndicatorTooltip>
                <p className="text-label-bold tabular-nums text-chart-company">
                  {isManager ? '••••' : formatBRL(totalEmp.media)}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-default-space flex items-center justify-end text-label text-primary font-medium group-hover:text-primary/80 transition-colors">
            Ver detalhamento completo <ArrowRight className="h-4 w-4 ml-xxs transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>

        {/* Percentiles row */}
        <div className="bg-grayscale-5 border-t border-border px-xmd py-md-space">
          <div className="grid grid-cols-5 gap-default-space">
            {STAT_KEYS.map(key => {
              const emp = totalEmp[key];
              const mkt = totalMkt[key];
              const pct = calcDeltaPct(emp, mkt);
              const color = pct < 0 ? 'text-negative' : 'text-foreground';
              return (
                <div key={key} className="text-center">
                  <IndicatorTooltip tooltipKey={statTooltipKeys[key]} showIcon>
                    <p className="text-small text-muted-foreground uppercase tracking-wider">{STAT_LABELS[key]}</p>
                  </IndicatorTooltip>
                  {!isManager && (
                    <p className="text-label-bold tabular-nums mt-xxs text-chart-market">{formatBRL(mkt)}</p>
                  )}
                  {!isManager && (
                    <p className="text-small text-chart-company tabular-nums">vs {formatBRL(emp)} empresa</p>
                  )}
                  <p className={`text-small-bold tabular-nums ${color}`}>{formatPct(pct)}</p>
                </div>
              );
            })}
          </div>
        </div>
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
                className="rounded-xxl overflow-hidden cursor-pointer group transition-all hover:shadow-dp04 shadow-dp02 border border-border"
                onClick={() => onSelectType(comp.tipo)}
              >
                <CardContent className="p-xmd space-y-default-space">
                  {/* Header */}
                  <div className="flex items-center gap-sm-space">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-label-bold text-foreground">{VARIABLE_PAY_LABELS[comp.tipo]}</h4>
                      <p className="text-small text-muted-foreground">{typeDescriptions[comp.tipo]}</p>
                    </div>
                  </div>

                  {/* Position bar */}
                  <div>
                    <div className="flex items-center justify-between text-small text-muted-foreground mb-xxs uppercase tracking-wider">
                      <span className="text-[10px]">Abaixo</span>
                      <span className="text-[10px]">Acima</span>
                    </div>
                    <PositionBar empresa={emp.p50} mercado={mkt.p50} />
                  </div>

                  {/* Main metric */}
                  {!isManager && (
                    <div>
                      <IndicatorTooltip tooltipKey="p50">
                        <p className="text-h2-bold tabular-nums text-chart-market">{formatBRL(mkt.p50)} <span className="text-small font-normal">mercado</span></p>
                      </IndicatorTooltip>
                      <p className="text-small text-chart-company tabular-nums">vs {formatBRL(emp.p50)} empresa</p>
                    </div>
                  )}

                  {/* Bottom metrics */}
                  <div className="flex items-center justify-between pt-sm-space border-t border-border">
                    <div>
                      <IndicatorTooltip tooltipKey="deltaPct">
                        <p className="text-small text-muted-foreground uppercase tracking-wider">Δ%</p>
                      </IndicatorTooltip>
                      <p className={`text-label-bold tabular-nums ${
                        pct < 0 ? 'text-negative' : 'text-foreground'
                      }`}>{formatPct(pct)}</p>
                    </div>
                    <div className="text-right">
                      <IndicatorTooltip tooltipKey="posicao">
                        <div className={`flex items-center gap-xxs text-small-bold ${
                          status === 'abaixo' ? 'text-negative' : 'text-foreground'
                        }`}>
                          <StatusIndicator status={status} />
                          {status === 'acima' ? 'Acima' : status === 'abaixo' ? 'Abaixo' : 'Alinhado'}
                        </div>
                      </IndicatorTooltip>
                    </div>
                  </div>
                  {/* Mini comparison chart */}
                  <div className="pt-sm-space border-t border-border">
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={STAT_KEYS.map(k => ({ name: STAT_LABELS[k], Empresa: emp[k], Mercado: mkt[k] }))} barGap={2} barCategoryGap="15%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'Open Sans' }} stroke="hsl(210, 10%, 60%)" />
                        <YAxis tick={{ fontSize: 9, fontFamily: 'Open Sans' }} tickFormatter={v => isManager ? '•••' : `${(v / 1000).toFixed(0)}k`} stroke="hsl(210, 10%, 60%)" width={35} />
                        <Tooltip content={({ active, payload, label }: any) => {
                          if (!active || !payload) return null;
                          return (
                            <div className="bg-card border border-border rounded-lg shadow-dp08 p-xs text-small">
                              <p className="text-label-bold mb-xxs">{label}</p>
                              {payload.map((p: any) => (
                                <p key={p.name} style={{ color: p.color }}>
                                  {p.name}: {isManager ? '••••' : formatBRL(p.value)}
                                </p>
                              ))}
                            </div>
                          );
                        }} />
                        <Bar dataKey="Mercado" fill="hsl(210, 56%, 60%)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Empresa" fill="hsl(152, 83%, 36%)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-sm-space mt-xxs">
                      <div className="flex items-center gap-xxs">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(210, 56%, 60%)' }} />
                        <span className="text-[10px] text-muted-foreground">Mercado</span>
                      </div>
                      <div className="flex items-center gap-xxs">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(152, 83%, 36%)' }} />
                        <span className="text-[10px] text-muted-foreground">Empresa</span>
                      </div>
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
