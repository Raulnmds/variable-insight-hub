import { useState } from 'react';
import { FilterBar } from '@/components/variable-pay/FilterBar';
import { MacroView } from '@/components/variable-pay/MacroView';
import { DetailView } from '@/components/variable-pay/DetailView';
import { VariablePayType, VARIABLE_PAY_LABELS, Filters } from '@/types/variablePay';
import { ChevronRight, BarChart3 } from 'lucide-react';

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
      {/* Header — white bg, dp01 shadow */}
      <header className="bg-card px-xmd py-md-space shadow-dp01">
        <div className="max-w-[1440px] mx-auto">
          <nav className="flex items-center gap-1.5 text-small text-muted-foreground mb-2">
            <span className="hover:text-primary cursor-pointer transition-colors">Pesquisa Salarial</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span
              className={`transition-colors ${selectedType ? 'hover:text-primary cursor-pointer' : 'text-foreground font-bold'}`}
              onClick={() => setSelectedType(null)}
            >
              Remuneração Variável
            </span>
            {selectedType && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-bold">{VARIABLE_PAY_LABELS[selectedType]}</span>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-h1 text-foreground">
              Dashboard | Remuneração Variável
            </h1>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      <main className="flex-1 p-xmd max-w-[1440px] w-full mx-auto">
        {selectedType ? (
          <DetailView type={selectedType} filters={filters} onBack={() => setSelectedType(null)} />
        ) : (
          <MacroView filters={filters} onSelectType={setSelectedType} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-xmd py-sm-space text-small text-muted-foreground text-center">
        Percentis: 25/50/75/90 e média · Comparação Empresa × Mercado · Referência: {filters.ano} · Valores em BRL ({filters.viewMode === 'anual' ? 'anual' : 'mensal equivalente'})
      </footer>
    </div>
  );
};

export default VariablePayDashboard;
