import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Job, JobVariablePayData, Filters, STAT_KEYS, STAT_LABELS } from '@/types/variablePay';
import { applyViewMode, formatBRL, formatPct, calcDelta, calcDeltaPct, calcIndice, getPositionStatus } from '@/lib/variablePayUtils';
import { ComparisonChart } from './ComparisonChart';

interface JobDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  data: JobVariablePayData | null;
  filters: Filters;
}

export function JobDetailDrawer({ open, onClose, job, data, filters }: JobDetailDrawerProps) {
  if (!job || !data) return null;

  const emp = applyViewMode(data.empresa, filters.viewMode);
  const mkt = applyViewMode(data.mercado, filters.viewMode);
  const isManager = filters.userRole === 'manager';
  const status = getPositionStatus(emp.p50, mkt.p50);

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{job.nome}</SheetTitle>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{job.familia}</Badge>
            <Badge variant="secondary" className="text-xs">{job.nivel}</Badge>
            <Badge variant="secondary" className="text-xs">{job.area}</Badge>
            <Badge variant="secondary" className="text-xs">{job.localidade}</Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Position indicator */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`text-sm py-1 px-3 ${
              status === 'acima' ? 'bg-positive/10 text-positive border-positive/20' :
              status === 'abaixo' ? 'bg-negative/10 text-negative border-negative/20' :
              'bg-warning/10 text-warning border-warning/20'
            }`}>
              {status === 'acima' ? '↑ Acima do mercado' : status === 'abaixo' ? '↓ Abaixo do mercado' : '→ Alinhado ao mercado'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Índice: <span className="font-mono font-medium">{calcIndice(emp.p50, mkt.p50).toFixed(2)}</span>
            </span>
          </div>

          {/* Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3">Comparativo Empresa × Mercado</h4>
            <ComparisonChart empresa={emp} mercado={mkt} hideValues={isManager} />
          </div>

          <Separator />

          {/* Stats table */}
          <div>
            <h4 className="text-sm font-medium mb-3">Estatísticas Detalhadas</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground">Stat</th>
                  {!isManager && <th className="text-right py-2 text-xs font-medium">Empresa</th>}
                  {!isManager && <th className="text-right py-2 text-xs font-medium">Mercado</th>}
                  {!isManager && <th className="text-right py-2 text-xs font-medium">Δ</th>}
                  <th className="text-right py-2 text-xs font-medium">Δ%</th>
                  <th className="text-right py-2 text-xs font-medium">Índice</th>
                </tr>
              </thead>
              <tbody>
                {STAT_KEYS.map(key => {
                  const delta = calcDelta(emp[key], mkt[key]);
                  const pct = calcDeltaPct(emp[key], mkt[key]);
                  const idx = calcIndice(emp[key], mkt[key]);
                  const color = delta > 0 ? 'text-positive' : delta < 0 ? 'text-negative' : '';
                  return (
                    <tr key={key} className="border-b border-border/50">
                      <td className="py-2 font-medium">{STAT_LABELS[key]}</td>
                      {!isManager && <td className="text-right py-2 tabular-nums">{formatBRL(emp[key])}</td>}
                      {!isManager && <td className="text-right py-2 tabular-nums">{formatBRL(mkt[key])}</td>}
                      {!isManager && <td className={`text-right py-2 tabular-nums ${color}`}>{formatBRL(delta)}</td>}
                      <td className={`text-right py-2 tabular-nums ${color}`}>{formatPct(pct)}</td>
                      <td className="text-right py-2 tabular-nums">{idx.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Data quality notes */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <h4 className="font-medium text-sm text-foreground">Notas de Qualidade</h4>
            <p>📊 Amostra mercado: <span className="font-medium">{data.n_amostra} empresas</span></p>
            <p>👥 Colaboradores empresa: <span className="font-medium">{data.n_colaboradores}</span></p>
            <p>📅 Data base: <span className="font-medium">{data.data_base}</span></p>
            <p>📋 Fonte: <span className="font-medium">{data.fonte}</span></p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
