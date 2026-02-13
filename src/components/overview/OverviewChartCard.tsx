import { Card, CardContent } from '@/components/ui/card';
import { OverviewCut } from '@/data/salaryOverviewMockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Maximize2, Info } from 'lucide-react';

interface OverviewChartCardProps {
  title: string;
  cut: OverviewCut;
  clickable?: boolean;
  onClick?: () => void;
}

export function OverviewChartCard({ title, cut, clickable, onClick }: OverviewChartCardProps) {
  const data = [
    { name: 'Média', Mercado: cut.mercado.media, Empresa: cut.empresa.media },
    { name: '1º Quartil', Mercado: cut.mercado.p25, Empresa: cut.empresa.p25 },
    { name: 'Mediana', Mercado: cut.mercado.p50, Empresa: cut.empresa.p50 },
    { name: '3º Quartil', Mercado: cut.mercado.p75, Empresa: cut.empresa.p75 },
    { name: 'Percentil 90', Mercado: cut.mercado.p90, Empresa: cut.empresa.p90 },
  ];

  const formatTick = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return String(v);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-card border border-border rounded-md shadow-dp08 p-sm-space text-small">
        <p className="text-label-bold mb-xxs">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card
      className={`rounded-lg shadow-dp02 border border-border transition-all ${
        clickable ? 'cursor-pointer hover:shadow-dp04 group' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <CardContent className="p-default-space">
        {/* Header */}
        <div className="flex items-center justify-between mb-sm-space">
          <div className="flex items-center gap-xs">
            <h3 className="text-label-bold text-foreground">{title}</h3>
            {cut.label !== 'Geral' && (
              <span className="text-small text-muted-foreground">— {cut.label}</span>
            )}
          </div>
          <div className="flex items-center gap-xxs">
            {clickable && (
              <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2} barCategoryGap="18%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fontFamily: 'Open Sans', fill: 'hsl(210, 10%, 40%)' }}
              stroke="hsl(220, 13%, 91%)"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'Open Sans', fill: 'hsl(210, 10%, 40%)' }}
              tickFormatter={formatTick}
              stroke="hsl(220, 13%, 91%)"
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'Open Sans' }}
              formatter={(value: string) =>
                value === 'Mercado' ? 'Mercado Senior pesquisado' : 'Empresa'
              }
            />
            <Bar dataKey="Mercado" fill="hsl(90, 55%, 55%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Empresa" fill="hsl(260, 50%, 60%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
