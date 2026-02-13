import { Card, CardContent } from '@/components/ui/card';
import { OverviewCut } from '@/data/salaryOverviewMockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Maximize2 } from 'lucide-react';

interface OverviewChartCardProps {
  title: string;
  cut: OverviewCut;
  clickable?: boolean;
  onClick?: () => void;
}

export function OverviewChartCard({ title, cut, clickable, onClick }: OverviewChartCardProps) {
  const data = [
    { name: 'P25', Mercado: cut.mercado.p25, Empresa: cut.empresa.p25 },
    { name: 'Média', Mercado: cut.mercado.media, Empresa: cut.empresa.media },
    { name: 'P50', Mercado: cut.mercado.p50, Empresa: cut.empresa.p50 },
    { name: 'P75', Mercado: cut.mercado.p75, Empresa: cut.empresa.p75 },
    { name: 'P90', Mercado: cut.mercado.p90, Empresa: cut.empresa.p90 },
  ];

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  const formatTick = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return String(v);
  };

  const medianaEmpresa = cut.empresa.p50;
  const medianaMercado = cut.mercado.p50;
  const delta = medianaEmpresa - medianaMercado;
  const deltaPercent = ((delta / medianaMercado) * 100).toFixed(1);
  const isPositive = delta >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-card border border-border rounded shadow-dp08 px-sm-space py-xs">
        <p className="text-small-bold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-small" style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
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
            <h3 className="text-label-bold text-foreground">{title}</h3>
            {cut.label !== 'Geral' && (
              <span className="text-small text-muted-foreground">— {cut.label}</span>
            )}
          </div>
          {clickable && (
            <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-default-space mb-sm-space">
          <div className="flex items-center gap-xxs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-market))' }} />
            <span className="text-small text-muted-foreground">Mercado</span>
          </div>
          <div className="flex items-center gap-xxs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-company))' }} />
            <span className="text-small text-muted-foreground">Empresa</span>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={180}>
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
            <Bar dataKey="Mercado" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill="hsl(var(--chart-market))" />
              ))}
            </Bar>
            <Bar dataKey="Empresa" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell key={i} fill="hsl(var(--chart-company))" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Median comparison */}
        <div className="mt-sm-space pt-sm-space border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-small text-muted-foreground">Mediana Mercado</span>
              <span className="text-label-bold text-foreground">{formatCurrency(medianaMercado)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-small text-muted-foreground">Delta</span>
              <span className={`text-label-bold ${isPositive ? 'text-positive' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{deltaPercent}%
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-small text-muted-foreground">Mediana Empresa</span>
              <span className="text-label-bold text-foreground">{formatCurrency(medianaEmpresa)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
