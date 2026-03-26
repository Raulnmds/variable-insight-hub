import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job, JobVariablePayData, Filters } from '@/types/variablePay';
import { applyViewMode, calcDeltaPct, calcIndice, formatBRL, formatPct, formatIndice, getPositionStatus } from '@/lib/variablePayUtils';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { IndicatorTooltip } from './IndicatorTooltip';

interface JobTableProps {
  jobs: Job[];
  data: JobVariablePayData[];
  filters: Filters;
  onSelectJob: (jobId: string) => void;
}

const PAGE_SIZE = 8;

export function JobTable({ jobs, data, filters, onSelectJob }: JobTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortAsc, setSortAsc] = useState(false);

  const isManager = filters.userRole === 'manager';

  const enriched = useMemo(() => {
    return data.map(d => {
      const job = jobs.find(j => j.cargo_id === d.cargo_id);
      if (!job) return null;
      const emp = applyViewMode(d.empresa, filters.viewMode);
      const mkt = applyViewMode(d.mercado, filters.viewMode);
      const deltaPct = calcDeltaPct(emp.p50, mkt.p50);
      const indice = calcIndice(emp.p50, mkt.p50);
      return { ...d, job, emp, mkt, deltaPct, indice };
    }).filter(Boolean) as any[];
  }, [data, jobs, filters]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r: any) =>
        r.job.nome.toLowerCase().includes(q) ||
        r.job.familia.toLowerCase().includes(q) ||
        r.job.area.toLowerCase().includes(q)
      );
    }
    result.sort((a: any, b: any) => sortAsc ? a.deltaPct - b.deltaPct : b.deltaPct - a.deltaPct);
    return result;
  }, [enriched, search, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-sm-space">
      <div className="flex items-center gap-sm-space">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Digite ou busque pela lupa"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pr-9 h-9 text-label rounded-md border-input"
          />
        </div>
        <span className="text-small text-muted-foreground">{filtered.length} cargos</span>
      </div>

      <div className="bg-card rounded-lg shadow-dp02 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-grayscale-5 border-b border-border">
                <TableHead className="text-label-bold-caps text-muted-foreground py-sm-space px-default-space">Cargo</TableHead>
                <TableHead className="text-label-bold-caps text-muted-foreground py-sm-space px-default-space">Família</TableHead>
                <TableHead className="text-label-bold-caps text-muted-foreground py-sm-space px-default-space">Nível</TableHead>
                {!isManager && <TableHead className="text-label-bold-caps text-chart-company py-sm-space px-default-space text-right"><IndicatorTooltip tooltipKey="p50Empresa">P50 Empresa</IndicatorTooltip></TableHead>}
                {!isManager && <TableHead className="text-label-bold-caps text-chart-market py-sm-space px-default-space text-right"><IndicatorTooltip tooltipKey="p50Mercado">P50 Mercado</IndicatorTooltip></TableHead>}
                <TableHead className="text-label-bold-caps text-muted-foreground py-sm-space px-default-space text-right cursor-pointer" onClick={() => setSortAsc(!sortAsc)}>
                  <IndicatorTooltip tooltipKey="deltaPct">
                    <span className="inline-flex items-center gap-xxs">
                      Δ% P50 <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </IndicatorTooltip>
                </TableHead>
                <TableHead className="text-label-bold-caps text-muted-foreground py-sm-space px-default-space text-center"><IndicatorTooltip tooltipKey="posicao">Posição</IndicatorTooltip></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManager ? 4 : 6} className="text-center py-xxbig text-label text-muted-foreground">
                    Nenhum cargo encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((row: any) => {
                  const status = getPositionStatus(row.emp.p50, row.mkt.p50);
                  const deltaColor = row.deltaPct < 0 ? 'text-negative' : 'text-foreground';
                  return (
                    <TableRow
                      key={row.cargo_id}
                      className="cursor-pointer hover:bg-grayscale-5 transition-colors border-b border-border"
                      onClick={() => onSelectJob(row.cargo_id)}
                    >
                      <TableCell className="text-label font-medium py-sm-space px-default-space">{row.job.nome}</TableCell>
                      <TableCell className="text-small text-muted-foreground py-sm-space px-default-space">{row.job.familia}</TableCell>
                      <TableCell className="text-small text-muted-foreground py-sm-space px-default-space">{row.job.nivel}</TableCell>
                      {!isManager && <TableCell className="text-label text-right tabular-nums py-sm-space px-default-space text-chart-company">{formatBRL(row.emp.p50)}</TableCell>}
                      {!isManager && <TableCell className="text-label text-right tabular-nums py-sm-space px-default-space text-chart-market">{formatBRL(row.mkt.p50)}</TableCell>}
                      <TableCell className={`text-label text-right tabular-nums font-bold py-sm-space px-default-space ${deltaColor}`}>
                        {formatPct(row.deltaPct)}
                      </TableCell>
                      <TableCell className="text-center py-sm-space px-default-space">
                        <Badge variant="outline" className={`text-small ${
                          status === 'acima' ? 'bg-positive/10 text-positive border-positive/20' :
                          status === 'abaixo' ? 'bg-negative/10 text-negative border-negative/20' :
                          'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          {status === 'acima' ? 'Acima' : status === 'abaixo' ? 'Abaixo' : 'Alinhado'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-small text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-xxs">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
