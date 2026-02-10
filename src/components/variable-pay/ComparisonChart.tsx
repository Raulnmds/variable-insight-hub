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
      <div className="bg-card border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-medium mb-1">{label}</p>
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
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={v => hideValues ? '•••' : `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Empresa" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Mercado" fill="hsl(170, 55%, 45%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
