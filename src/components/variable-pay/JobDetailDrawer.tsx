import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Job, JobVariablePayData, Filters, STAT_KEYS, STAT_LABELS } from '@/types/variablePay';
import { applyViewMode, formatBRL, formatPct, calcDelta, calcDeltaPct, calcIndice, getPositionStatus } from '@/lib/variablePayUtils';
import { ComparisonChart } from './ComparisonChart';
import { IndicatorTooltip } from './IndicatorTooltip';

interface JobDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  data: JobVariablePayData | null;
  filters: Filters;
}

const statTooltipKeys: Record<string, string> = {
  p25: 'p25', p50: 'p50', p75: 'p75', p90: 'p90', media: 'media',
};

export function JobDetailDrawer({ open, onClose, job, data, filters }: JobDetailDrawerProps) {
  if (!job || !data) return null;

  const emp = applyViewMode(data.empresa, filters.viewMode);
  const mkt = applyViewMode(data.mercado, filters.viewMode);
  const isManager = filters.userRole === 'manager';
  const status = getPositionStatus(emp.p50, mkt.p50);

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card">
        <SheetHeader className="pb-xmd border-b border-border">
          <SheetTitle className="text-h3-caps text-foreground">{job.nome}</SheetTitle>
          <div className="flex flex-wrap gap-xs mt-xs">
            <Badge variant="secondary" className="text-small">{job.familia}</Badge>
            <Badge variant="secondary" className="text-small">{job.nivel}</Badge>
            <Badge variant="secondary" className="text-small">{job.area}</Badge>
            <Badge variant="secondary" className="text-small">{job.localidade}</Badge>
          </div>
        </SheetHeader>

        <div className="mt-xmd space-y-xmd">
          {/* Position indicator */}
          <div className="flex items-center gap-sm-space">
            <IndicatorTooltip tooltipKey="posicao">
              <Badge variant="outline" className={`text-label py-xs px-sm-space ${
                status === 'acima' ? 'bg-positive/10 text-positive border-positive/20' :
                status === 'abaixo' ? 'bg-negative/10 text-negative border-negative/20' :
                'bg-warning/10 text-warning border-warning/20'
              }`}>
                {status === 'acima' ? '↑ Acima do mercado' : status === 'abaixo' ? '↓ Abaixo do mercado' : '→ Alinhado ao mercado'}
              </Badge>
            </IndicatorTooltip>
            <IndicatorTooltip tooltipKey="indice">
              <span className="text-label text-muted-foreground">
                Índice: <span className="font-mono text-label-bold">{calcIndice(emp.p50, mkt.p50).toFixed(2)}</span>
              </span>
            </IndicatorTooltip>
          </div>

          {/* Chart */}
          <div>
            <h4 className="text-h3-caps text-muted-foreground mb-sm-space">Comparativo Empresa × Mercado</h4>
            <ComparisonChart empresa={emp} mercado={mkt} hideValues={isManager} />
          </div>

          <Separator />

          {/* Stats table */}
          <div>
            <h4 className="text-h3-caps text-muted-foreground mb-sm-space">Estatísticas Detalhadas</h4>
            <div className="bg-card rounded-lg shadow-dp02 overflow-hidden">
              <table className="w-full text-label">
                <thead>
                  <tr className="bg-grayscale-5 border-b border-border">
                    <th className="text-left py-sm-space px-default-space text-label-bold-caps text-muted-foreground">Stat</th>
                    {!isManager && <th className="text-right py-sm-space px-default-space text-label-bold-caps text-muted-foreground">Empresa</th>}
                    {!isManager && <th className="text-right py-sm-space px-default-space text-label-bold-caps text-muted-foreground">Mercado</th>}
                    {!isManager && (
                      <th className="text-right py-sm-space px-default-space text-label-bold-caps text-muted-foreground">
                        <IndicatorTooltip tooltipKey="delta">Δ</IndicatorTooltip>
                      </th>
                    )}
                    <th className="text-right py-sm-space px-default-space text-label-bold-caps text-muted-foreground">
                      <IndicatorTooltip tooltipKey="deltaPct">Δ%</IndicatorTooltip>
                    </th>
                    <th className="text-right py-sm-space px-default-space text-label-bold-caps text-muted-foreground">
                      <IndicatorTooltip tooltipKey="indice">Índice</IndicatorTooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STAT_KEYS.map(key => {
                    const delta = calcDelta(emp[key], mkt[key]);
                    const pct = calcDeltaPct(emp[key], mkt[key]);
                    const idx = calcIndice(emp[key], mkt[key]);
                    const color = delta > 0 ? 'text-positive' : delta < 0 ? 'text-negative' : '';
                    return (
                      <tr key={key} className="border-b border-border hover:bg-grayscale-5 transition-colors">
                        <td className="py-sm-space px-default-space text-label-bold">
                          <IndicatorTooltip tooltipKey={statTooltipKeys[key]}>{STAT_LABELS[key]}</IndicatorTooltip>
                        </td>
                        {!isManager && <td className="text-right py-sm-space px-default-space tabular-nums">{formatBRL(emp[key])}</td>}
                        {!isManager && <td className="text-right py-sm-space px-default-space tabular-nums">{formatBRL(mkt[key])}</td>}
                        {!isManager && <td className={`text-right py-sm-space px-default-space tabular-nums ${color}`}>{formatBRL(delta)}</td>}
                        <td className={`text-right py-sm-space px-default-space tabular-nums ${color}`}>{formatPct(pct)}</td>
                        <td className="text-right py-sm-space px-default-space tabular-nums">{idx.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Data quality notes */}
          <div className="space-y-xs">
            <h4 className="text-h3-caps text-muted-foreground">Notas de Qualidade</h4>
            <p className="text-small text-muted-foreground">
              <IndicatorTooltip tooltipKey="nAmostra" showIcon>
                <span>📊 Amostra mercado:</span>
              </IndicatorTooltip>{' '}
              <span className="text-small-bold">{data.n_amostra} empresas</span>
            </p>
            <p className="text-small text-muted-foreground">
              <IndicatorTooltip tooltipKey="nColaboradores" showIcon>
                <span>👥 Colaboradores empresa:</span>
              </IndicatorTooltip>{' '}
              <span className="text-small-bold">{data.n_colaboradores}</span>
            </p>
            <p className="text-small text-muted-foreground">
              <IndicatorTooltip tooltipKey="dataBase" showIcon>
                <span>📅 Data base:</span>
              </IndicatorTooltip>{' '}
              <span className="text-small-bold">{data.data_base}</span>
            </p>
            <p className="text-small text-muted-foreground">
              <IndicatorTooltip tooltipKey="fonte" showIcon>
                <span>📋 Fonte:</span>
              </IndicatorTooltip>{' '}
              <span className="text-small-bold">{data.fonte}</span>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
