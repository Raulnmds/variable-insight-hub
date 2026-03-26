import { Card, CardContent } from '@/components/ui/card';
import { OverviewStackedCut } from '@/data/salaryOverviewMockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Maximize2 } from 'lucide-react';

const COMPONENTS = [
  { key: 'bonus', label: 'Bônus' },
  { key: 'pplr', label: 'PPLR' },
  { key: 'comissao', label: 'Comissão' },
  { key: 'premio', label: 'Prêmio' },
] as const;

// Empresa = Lime palette, Mercado = Hippie Blue palette
const EMPRESA_COLORS = {
  bonus: '#436500',    // Lime 900
  pplr: '#6DA300',     // Lime 700
  comissao: '#ADE500', // Lime 500
  premio: '#C8F15C',   // Lime 300
};

const MERCADO_COLORS = {
  bonus: '#1D2F34',    // Hippie Blue 900
  pplr: '#426E78',     // Hippie Blue 700
  comissao: '#67ACBC', // Hippie Blue 500
  premio: '#9ECAD4',   // Hippie Blue 300
};

type StatKey = 'p25' | 'media' | 'p50' | 'p75' | 'p90';
const PERCENTILES: { key: StatKey; label: string }[] = [
  { key: 'p25', label: 'P25' },
  { key: 'media', label: 'Média' },
  { key: 'p50', label: 'P50' },
  { key: 'p75', label: 'P75' },
  { key: 'p90', label: 'P90' },
];

interface Props {
  cut: OverviewStackedCut;
  clickable?: boolean;
  onClick?: () => void;
}

export function OverviewStackedChartCard({ cut, clickable, onClick }: Props) {
  // Build chart data: each percentile has Mercado and Empresa stacked values
  const data = PERCENTILES.map(({ key, label }) => {
    const entry: Record<string, string | number> = { name: label };
    COMPONENTS.forEach(({ key: comp }) => {
      entry[`mercado_${comp}`] = cut.mercado[comp][key];
      entry[`empresa_${comp}`] = cut.empresa[comp][key];
    });
    return entry;
  });

  // Total P50 for median footer
  const totalMercadoP50 = COMPONENTS.reduce((s, c) => s + cut.mercado[c.key].p50, 0);
  const totalEmpresaP50 = COMPONENTS.reduce((s, c) => s + cut.empresa[c.key].p50, 0);
  const delta = totalEmpresaP50 - totalMercadoP50;
  const deltaPercent = ((delta / totalMercadoP50) * 100).toFixed(1);
  const isPositive = delta >= 0;

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  const formatTick = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    // Group by mercado/empresa
    const mercadoItems = payload.filter((p: any) => p.dataKey.startsWith('mercado_'));
    const empresaItems = payload.filter((p: any) => p.dataKey.startsWith('empresa_'));
    const totalM = mercadoItems.reduce((s: number, p: any) => s + (p.value || 0), 0);
    const totalE = empresaItems.reduce((s: number, p: any) => s + (p.value || 0), 0);

    return (
      <div className="bg-card border border-border rounded shadow-dp08 px-sm-space py-xs text-small">
        <p className="text-small-bold mb-1">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <span className="text-muted-foreground font-bold">Mercado</span>
          <span className="text-muted-foreground font-bold">Empresa</span>
          {COMPONENTS.map(({ key, label: compLabel }) => (
            <>
              <span key={`m-${key}`} style={{ color: MERCADO_COLORS[key] }}>{compLabel}: {formatCurrency(cut.mercado[key].p50)}</span>
              <span key={`e-${key}`} style={{ color: EMPRESA_COLORS[key] }}>{compLabel}: {formatCurrency(cut.empresa[key].p50)}</span>
            </>
          ))}
          <span className="font-bold border-t border-border pt-0.5">Total: {formatCurrency(totalM)}</span>
          <span className="font-bold border-t border-border pt-0.5">Total: {formatCurrency(totalE)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`rounded-[10px] shadow-dp02 border border-border transition-all ${
        clickable ? 'cursor-pointer hover:shadow-dp04 group' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <CardContent className="p-xmd pb-default-space">
        {/* Header */}
        <div className="flex items-center justify-between mb-sm-space">
          <div className="flex items-center gap-xs">
            <h3 className="text-label-bold text-foreground">Remuneração variável</h3>
            {cut.label !== 'Geral' && (
              <span className="text-small text-muted-foreground">— {cut.label}</span>
            )}
          </div>
          {clickable && (
            <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-default-space mb-sm-space flex-wrap">
          <div className="flex items-center gap-xs">
            <span className="text-small font-bold text-muted-foreground">Mercado:</span>
            {COMPONENTS.map(({ key, label: l }) => (
              <div key={`m-${key}`} className="flex items-center gap-xxs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MERCADO_COLORS[key] }} />
                <span className="text-small text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-xs">
            <span className="text-small font-bold text-muted-foreground">Empresa:</span>
            {COMPONENTS.map(({ key, label: l }) => (
              <div key={`e-${key}`} className="flex items-center gap-xxs">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: EMPRESA_COLORS[key] }} />
                <span className="text-small text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={1} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--grayscale-20))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fontFamily: 'Open Sans', fill: 'hsl(var(--grayscale-70))' }}
              stroke="hsl(var(--grayscale-20))"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'Open Sans', fill: 'hsl(var(--grayscale-70))' }}
              tickFormatter={formatTick}
              stroke="hsl(var(--grayscale-20))"
              tickLine={false}
              axisLine={false}
              width={38}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--grayscale-10))' }} />
            {/* Mercado stacked bars */}
            {COMPONENTS.map(({ key }, i) => (
              <Bar
                key={`m-${key}`}
                dataKey={`mercado_${key}`}
                stackId="mercado"
                fill={MERCADO_COLORS[key]}
                radius={i === COMPONENTS.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={28}
              />
            ))}
            {/* Empresa stacked bars */}
            {COMPONENTS.map(({ key }, i) => (
              <Bar
                key={`e-${key}`}
                dataKey={`empresa_${key}`}
                stackId="empresa"
                fill={EMPRESA_COLORS[key]}
                radius={i === COMPONENTS.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={28}
              />
            ))}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Median comparison footer */}
        <div className="mt-sm-space pt-sm-space border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-small text-muted-foreground">Mediana Mercado</span>
              <span className="text-label-bold text-foreground">{formatCurrency(totalMercadoP50)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-small text-muted-foreground">Delta</span>
              <span className={`text-label-bold ${isPositive ? 'text-positive' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{deltaPercent}%
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-small text-muted-foreground">Mediana Empresa</span>
              <span className="text-label-bold text-foreground">{formatCurrency(totalEmpresaP50)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
