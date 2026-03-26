import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { filterOptions } from '@/data/variablePayMockData';
import { Filters } from '@/types/variablePay';
import { Filter, X, Eye, EyeOff } from 'lucide-react';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const defaultFilters: Omit<Filters, 'viewMode' | 'userRole'> = {
  ano: 2025,
  area: '',
  familia: '',
  nivel: '',
  localidade: '',
};

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const update = (patch: Partial<Filters>) => onFiltersChange({ ...filters, ...patch });
  const activeCount = 0;

  const clearAll = () => onFiltersChange({ ...filters, ...defaultFilters, ano: 2025 });

  const appliedChips: { label: string; clear: () => void }[] = [];

  return (
    <div className="border-b border-border bg-card px-xmd py-sm-space space-y-xs shadow-dp01">
      <div className="flex flex-wrap items-center gap-sm-space">
        <div className="flex items-center gap-xxs text-label text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-xxs text-small">{activeCount}</Badge>
          )}
        </div>

        <Select value={String(filters.ano)} onValueChange={v => update({ ano: Number(v) })}>
          <SelectTrigger className="w-[100px] h-9 text-label rounded-md border-input"><SelectValue /></SelectTrigger>
          <SelectContent>
            {filterOptions.anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>




        <div className="ml-auto flex items-center gap-xs">
          <Select value={filters.viewMode} onValueChange={v => update({ viewMode: v as 'anual' | 'mensal' })}>
            <SelectTrigger className="w-[110px] h-9 text-label rounded-md border-input"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-label gap-xxs"
            onClick={() => update({ userRole: filters.userRole === 'hr' ? 'manager' : 'hr' })}
          >
            {filters.userRole === 'hr' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {filters.userRole === 'hr' ? 'Visão RH' : 'Visão Gestor'}
          </Button>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="h-9 text-label" onClick={clearAll}>
              <X className="h-3.5 w-3.5 mr-xxs" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {appliedChips.length > 0 && (
        <div className="flex flex-wrap gap-xxs">
          {appliedChips.map((chip) => (
            <Badge key={chip.label} variant="outline" className="text-small gap-xxs cursor-pointer hover:bg-negative/10" onClick={chip.clear}>
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
