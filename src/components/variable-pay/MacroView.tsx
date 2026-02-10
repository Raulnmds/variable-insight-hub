import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filters, VariablePayType, VARIABLE_PAY_LABELS, STAT_KEYS, STAT_LABELS } from '@/types/variablePay';
import { getAggregatedComparisons, applyViewMode, calcDelta, calcDeltaPct, getPositionStatus, formatBRL, formatPct, exportToCSV, generateInsights } from '@/lib/variablePayUtils';
import { TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface MacroViewProps {
  filters: Filters;
  onSelectType: (type: VariablePayType) => void;
}

const positionConfig = {
  acima: { label: 'Acima do mercado', icon: TrendingUp, className: 'bg-positive/10 text-positive border-positive/20' },
  abaixo: { label: 'Abaixo do mercado', icon: TrendingDown, className: 'bg-negative/10 text-negative border-negative/20' },
  alinhado: { label: 'Alinhado ao mercado', icon: Minus, className: 'bg-warning/10 text-warning border-warning/20' },
};

export function MacroView({ filters, onSelectType }: MacroViewProps) {
  const comparisons = useMemo(() => getAggregatedComparisons(filters), [filters]);

  const handleExport = () => {
    const headers = ['Tipo', 'Estatística', 'Empresa', 'Mercado', 'Δ Absoluto', 'Δ%'];
    const rows: string[][] = [];
    for (const c of comparisons) {
      const emp = applyViewMode(c.empresa, filters.viewMode);
      const mkt = applyViewMode(c.mercado, filters.viewMode);
      for (const key of STAT_KEYS) {
        rows.push([
          VARIABLE_PAY_LABELS[c.tipo],
          STAT_LABELS[key],
          String(emp[key]),
          String(mkt[key]),
          String(calcDelta(emp[key], mkt[key])),
          `${calcDeltaPct(emp[key], mkt[key]).toFixed(1)}%`,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Visão Consolidada</h2>
          <p className="text-sm text-muted-foreground">Comparativo Empresa × Mercado por tipo de remuneração variável</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSummary}>
            <FileText className="h-4 w-4" /> Gerar Resumo
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {comparisons.map((comp) => {
          const emp = applyViewMode(comp.empresa, filters.viewMode);
          const mkt = applyViewMode(comp.mercado, filters.viewMode);
          const status = getPositionStatus(emp.p50, mkt.p50);
          const pos = positionConfig[status];
          const Icon = pos.icon;
          const isManager = filters.userRole === 'manager';

          return (
            <Card
              key={comp.tipo}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
              onClick={() => onSelectType(comp.tipo)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{VARIABLE_PAY_LABELS[comp.tipo]}</CardTitle>
                  <Badge variant="outline" className={pos.className}>
                    <Icon className="h-3 w-3 mr-1" />
                    {isManager ? pos.label : `${formatPct(calcDeltaPct(emp.p50, mkt.p50))}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1.5 font-medium text-muted-foreground">Stat</th>
                        {!isManager && <th className="text-right py-1.5 font-medium text-chart-company">Empresa</th>}
                        {!isManager && <th className="text-right py-1.5 font-medium text-chart-market">Mercado</th>}
                        <th className="text-right py-1.5 font-medium text-muted-foreground">{isManager ? 'Índice' : 'Δ'}</th>
                        <th className="text-right py-1.5 font-medium text-muted-foreground">Δ%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STAT_KEYS.map(key => {
                        const delta = calcDelta(emp[key], mkt[key]);
                        const deltaPct = calcDeltaPct(emp[key], mkt[key]);
                        const deltaColor = delta > 0 ? 'text-positive' : delta < 0 ? 'text-negative' : '';
                        return (
                          <tr key={key} className="border-b border-border/50 last:border-0">
                            <td className="py-1.5 font-medium">{STAT_LABELS[key]}</td>
                            {!isManager && <td className="text-right py-1.5 tabular-nums">{formatBRL(emp[key])}</td>}
                            {!isManager && <td className="text-right py-1.5 tabular-nums">{formatBRL(mkt[key])}</td>}
                            <td className={`text-right py-1.5 tabular-nums ${deltaColor}`}>
                              {isManager ? (emp[key] / mkt[key]).toFixed(2) : formatBRL(delta)}
                            </td>
                            <td className={`text-right py-1.5 tabular-nums ${deltaColor}`}>{formatPct(deltaPct)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
