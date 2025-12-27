import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ShopTypeChartProps {
  data: { name: string; withSoftware: number; withoutSoftware: number; total: number }[];
}

export function ShopTypeChart({ data }: ShopTypeChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                  <p className="text-sm font-medium text-foreground mb-1">{label}</p>
                  {payload.map((p, i) => (
                    <p key={i} className="text-sm" style={{ color: p.color }}>
                      {p.name}: {p.value}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => (
            <span className="text-sm text-foreground">{value}</span>
          )}
        />
        <Bar 
          dataKey="withSoftware" 
          name="With Software" 
          fill="hsl(var(--success))" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="withoutSoftware" 
          name="Without Software" 
          fill="hsl(var(--warning))" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
