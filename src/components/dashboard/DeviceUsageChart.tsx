import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DeviceUsageChartProps {
  data: { name: string; value: number; percent: number }[];
}

const COLORS = [
  'hsl(175, 65%, 40%)',
  'hsl(200, 85%, 50%)',
  'hsl(35, 95%, 55%)',
  'hsl(145, 65%, 42%)',
  'hsl(280, 60%, 55%)',
];

export function DeviceUsageChart({ data }: DeviceUsageChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  if (total === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={55}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                  <p className="text-sm font-medium text-foreground">{data.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.value} ({data.percent}%)
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-xs text-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
