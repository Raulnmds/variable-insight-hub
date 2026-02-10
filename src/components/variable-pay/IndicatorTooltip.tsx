import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export const INDICATOR_TOOLTIPS: Record<string, string> = {
  p25: 'Percentil 25: 25% das empresas/colaboradores pagam abaixo deste valor. Representa o quartil inferior do mercado.',
  p50: 'Percentil 50 (Mediana): valor central da distribuição. Metade paga acima e metade abaixo. Principal referência de comparação.',
  p75: 'Percentil 75: apenas 25% das empresas/colaboradores pagam acima deste valor. Representa práticas competitivas.',
  p90: 'Percentil 90: apenas 10% pagam acima. Representa práticas agressivas de remuneração no mercado.',
  media: 'Média aritmética dos valores. Pode ser influenciada por outliers, ao contrário dos percentis.',
  delta: 'Delta Absoluto (Δ): diferença em reais entre o valor da Empresa e o valor de Mercado. Positivo = empresa paga mais.',
  deltaPct: 'Delta Percentual (Δ%): diferença percentual entre Empresa e Mercado. Fórmula: (Empresa − Mercado) / Mercado × 100.',
  indice: 'Índice de competitividade: razão Empresa / Mercado. Ex.: 1,10 = empresa paga 10% acima; 0,90 = 10% abaixo.',
  posicao: 'Posição relativa ao mercado com base no P50. Acima (>5%), Alinhado (±5%) ou Abaixo (<-5%).',
  p50Empresa: 'Mediana (P50) da remuneração variável praticada internamente pela empresa para o recorte selecionado.',
  p50Mercado: 'Mediana (P50) da remuneração variável praticada pelo mercado de referência para o recorte selecionado.',
  mediaEmpresa: 'Média aritmética da remuneração variável praticada pela empresa para o recorte selecionado.',
  barPosicao: 'Barra de posicionamento: indica visualmente onde a empresa se encontra em relação ao mercado (centro = alinhado).',
  nAmostra: 'Número de empresas participantes da pesquisa de mercado para este cargo/recorte. Amostras maiores = dados mais confiáveis.',
  nColaboradores: 'Número de colaboradores da empresa considerados no cálculo desta estatística.',
  fonte: 'Pesquisa ou base de dados de origem das informações de mercado.',
  dataBase: 'Data de referência da coleta dos dados de mercado.',
};

interface IndicatorTooltipProps {
  tooltipKey: string;
  children: ReactNode;
  showIcon?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function IndicatorTooltip({ tooltipKey, children, showIcon = false, side = 'top', className = '' }: IndicatorTooltipProps) {
  const text = INDICATOR_TOOLTIPS[tooltipKey];
  if (!text) return <>{children}</>;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
          {children}
          {showIcon && <Info className="h-3 w-3 text-muted-foreground/60 shrink-0" />}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-xs leading-relaxed font-normal">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
