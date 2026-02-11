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
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(250,25%,12%)] via-[hsl(260,40%,18%)] to-[hsl(270,50%,25%)] px-6 py-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-20 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 left-32 w-32 h-32 rounded-full bg-purple-300/20 blur-2xl" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <nav className="flex items-center gap-1.5 text-sm text-white/50 mb-2">
            <span className="hover:text-white/80 cursor-pointer transition-colors">Pesquisa Salarial</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span
              className={`transition-colors ${selectedType ? 'hover:text-white/80 cursor-pointer' : 'text-white font-medium'}`}
              onClick={() => setSelectedType(null)}
            >
              Remuneração Variável
            </span>
            {selectedType && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-white font-medium">{VARIABLE_PAY_LABELS[selectedType]}</span>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dashboard | Remuneração Variável
            </h1>
          </div>
        </div>
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
