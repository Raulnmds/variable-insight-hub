import { PercentileStats, STAT_KEYS, STAT_LABELS } from '@/types/variablePay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatBRL } from '@/lib/variablePayUtils';

interface ComparisonChartProps {
  empresa: PercentileStats;
  mercado: PercentileStats;
  hideValues?: boolean;
}

export function ComparisonChart({ empresa, mercado, hideValues }: ComparisonChartProps) {
  const data = STAT_KEYS.map(key => ({
    name: STAT_LABELS[key],
    Empresa: empresa[key],
    Mercado: mercado[key],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-card border border-border rounded-lg shadow-dp08 p-sm-space text-small">
        <p className="text-label-bold mb-xxs">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {hideValues ? '••••' : formatBRL(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barGap={4} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Open Sans' }} stroke="hsl(210, 10%, 40%)" />
        <YAxis
          tick={{ fontSize: 11, fontFamily: 'Open Sans' }}
          tickFormatter={v => hideValues ? '•••' : `${(v / 1000).toFixed(0)}k`}
          stroke="hsl(210, 10%, 40%)"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Open Sans' }} />
        <Bar dataKey="Mercado" fill="hsl(210, 56%, 60%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Empresa" fill="hsl(152, 83%, 36%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
