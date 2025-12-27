import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SatisfactionChartProps {
  data: { name: string; count: number }[];
}

const satisfactionColors: Record<string, string> = {
  'Very Satisfied': 'hsl(145, 65%, 42%)',
  'Satisfied': 'hsl(145, 50%, 55%)',
  'Neutral': 'hsl(45, 70%, 50%)',
  'Unsatisfied': 'hsl(25, 80%, 55%)',
  'Very Unsatisfied': 'hsl(0, 72%, 51%)',
};

export function SatisfactionChart({ data }: SatisfactionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  
  if (total === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                  <p className="text-sm font-medium text-foreground">{payload[0].payload.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {payload[0].value} responses
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="count" 
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={satisfactionColors[entry.name] || 'hsl(var(--primary))'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
