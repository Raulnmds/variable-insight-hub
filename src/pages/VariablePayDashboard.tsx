import { useState } from 'react';
import { FilterBar } from '@/components/variable-pay/FilterBar';
import { MacroView } from '@/components/variable-pay/MacroView';
import { DetailView } from '@/components/variable-pay/DetailView';
import { VariablePayType, VARIABLE_PAY_LABELS, Filters } from '@/types/variablePay';
import { ChevronRight } from 'lucide-react';

const defaultFilters: Filters = {
  ano: 2025,
  area: '',
  familia: '',
  nivel: '',
  localidade: '',
  viewMode: 'anual',
  userRole: 'hr',
};

const VariablePayDashboard = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedType, setSelectedType] = useState<VariablePayType | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
          <span className="hover:text-foreground cursor-pointer transition-colors">Pesquisa Salarial</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span
            className={`transition-colors ${selectedType ? 'hover:text-foreground cursor-pointer' : 'text-foreground font-medium'}`}
            onClick={() => setSelectedType(null)}
          >
            Remuneração Variável
          </span>
          {selectedType && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{VARIABLE_PAY_LABELS[selectedType]}</span>
            </>
          )}
        </nav>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Dashboard | Remuneração Variável
        </h1>
      </header>

      {/* Filters */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
        {selectedType ? (
          <DetailView type={selectedType} filters={filters} onBack={() => setSelectedType(null)} />
        ) : (
          <MacroView filters={filters} onSelectType={setSelectedType} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-3 text-xs text-muted-foreground text-center">
        Percentis: 25/50/75/90 e média · Comparação Empresa × Mercado · Referência: {filters.ano} · Valores em BRL ({filters.viewMode === 'anual' ? 'anual' : 'mensal equivalente'})
      </footer>
    </div>
  );
};

export default VariablePayDashboard;
