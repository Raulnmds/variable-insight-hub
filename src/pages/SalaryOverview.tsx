import { useState } from 'react';
import { overviewCategories, variablePayStackedCuts } from '@/data/salaryOverviewMockData';
import { OverviewChartCard } from '@/components/overview/OverviewChartCard';
import { OverviewStackedChartCard } from '@/components/overview/OverviewStackedChartCard';
import { FilterBar } from '@/components/variable-pay/FilterBar';
import { MacroView } from '@/components/variable-pay/MacroView';
import { DetailView } from '@/components/variable-pay/DetailView';
import { Filters, VariablePayType } from '@/types/variablePay';
import { ChevronRight, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const defaultFilters: Filters = {
  ano: 2025,
  area: '',
  familia: '',
  nivel: '',
  localidade: '',
  viewMode: 'anual',
  userRole: 'hr',
};

type ViewState =
  | { mode: 'overview' }
  | { mode: 'variable-dashboard'; selectedType: VariablePayType | null };

const SalaryOverview = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [view, setView] = useState<ViewState>({ mode: 'overview' });

  const goToVariableDashboard = () =>
    setView({ mode: 'variable-dashboard', selectedType: null });

  const goToOverview = () => setView({ mode: 'overview' });

  // Variable dashboard sub-navigation
  const selectedType = view.mode === 'variable-dashboard' ? view.selectedType : null;
  const setSelectedType = (type: VariablePayType | null) => {
    if (view.mode === 'variable-dashboard') {
      setView({ mode: 'variable-dashboard', selectedType: type });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card px-xmd py-md-space shadow-dp01">
        <div className="max-w-[1440px] mx-auto">
          <nav className="flex items-center gap-1.5 text-small text-muted-foreground mb-2">
            <span
              className={`transition-colors ${
                view.mode !== 'overview'
                  ? 'hover:text-primary cursor-pointer'
                  : 'text-foreground font-bold'
              }`}
              onClick={goToOverview}
            >
              Pesquisa Salarial
            </span>
            {view.mode === 'variable-dashboard' && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span
                  className={`transition-colors ${
                    selectedType
                      ? 'hover:text-primary cursor-pointer'
                      : 'text-foreground font-bold'
                  }`}
                  onClick={() => setSelectedType(null)}
                >
                  Remuneração Variável
                </span>
                {selectedType && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-foreground font-bold">
                      {selectedType === 'bonus'
                        ? 'Bônus'
                        : selectedType === 'pplr'
                        ? 'PPLR (PLR/PPR)'
                        : selectedType === 'comissao'
                        ? 'Comissão'
                        : selectedType === 'premio'
                        ? 'Prêmio'
                        : 'Total Variável'}
                    </span>
                  </>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {view.mode === 'variable-dashboard' && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                onClick={goToOverview}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-h1 text-foreground">
              {view.mode === 'overview'
                ? 'Dashboard | Pesquisa Salarial'
                : 'Dashboard | Remuneração Variável'}
            </h1>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      <main className="flex-1 p-xmd max-w-[1440px] w-full mx-auto">
        {view.mode === 'overview' ? (
          <div className="space-y-big">
            {overviewCategories.map((cat) => {
              const isVariable = cat.id === 'remuneracao-variavel';
              return (
                <section key={cat.id}>
                  <div className="flex items-center gap-xs mb-default-space">
                    <h2 className="text-h3-caps text-muted-foreground">{cat.title}</h2>
                    {isVariable && (
                      <span className="text-small text-primary cursor-pointer hover:underline" onClick={goToVariableDashboard}>
                        Ver detalhes →
                      </span>
                    )}
                  </div>
                  {isVariable ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-xmd">
                      {variablePayStackedCuts.map((stackedCut) => (
                        <OverviewStackedChartCard
                          key={`stacked-${stackedCut.label}`}
                          cut={stackedCut}
                          clickable
                          onClick={goToVariableDashboard}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-xmd">
                      {cat.cuts.map((cut) => (
                        <OverviewChartCard
                          key={`${cat.id}-${cut.label}`}
                          title={cat.title}
                          cut={cut}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : selectedType ? (
          <DetailView
            type={selectedType}
            filters={filters}
            onBack={() => setSelectedType(null)}
          />
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

export default SalaryOverview;
