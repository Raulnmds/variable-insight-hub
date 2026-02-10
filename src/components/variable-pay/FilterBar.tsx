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
  const activeCount = [filters.area, filters.familia, filters.nivel, filters.localidade].filter(Boolean).length;

  const clearAll = () => onFiltersChange({ ...filters, ...defaultFilters, ano: 2025 });

  const appliedChips = [
    filters.area && { label: `Área: ${filters.area}`, clear: () => update({ area: '' }) },
    filters.familia && { label: `Família: ${filters.familia}`, clear: () => update({ familia: '' }) },
    filters.nivel && { label: `Nível: ${filters.nivel}`, clear: () => update({ nivel: '' }) },
    filters.localidade && { label: `Local: ${filters.localidade}`, clear: () => update({ localidade: '' }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="border-b bg-card/50 px-6 py-3 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">{activeCount}</Badge>
          )}
        </div>

        <Select value={String(filters.ano)} onValueChange={v => update({ ano: Number(v) })}>
          <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {filterOptions.anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.area || '__all__'} onValueChange={v => update({ area: v === '__all__' ? '' : v })}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Área" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as áreas</SelectItem>
            {filterOptions.areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.familia || '__all__'} onValueChange={v => update({ familia: v === '__all__' ? '' : v })}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Família" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as famílias</SelectItem>
            {filterOptions.familias.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.nivel || '__all__'} onValueChange={v => update({ nivel: v === '__all__' ? '' : v })}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Nível" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os níveis</SelectItem>
            {filterOptions.niveis.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.localidade || '__all__'} onValueChange={v => update({ localidade: v === '__all__' ? '' : v })}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="Localidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas localidades</SelectItem>
            {filterOptions.localidades.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Select value={filters.viewMode} onValueChange={v => update({ viewMode: v as 'anual' | 'mensal' })}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => update({ userRole: filters.userRole === 'hr' ? 'manager' : 'hr' })}
          >
            {filters.userRole === 'hr' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {filters.userRole === 'hr' ? 'Visão RH' : 'Visão Gestor'}
          </Button>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearAll}>
              <X className="h-3.5 w-3.5 mr-1" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {appliedChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {appliedChips.map((chip) => (
            <Badge key={chip.label} variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-destructive/10" onClick={chip.clear}>
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
