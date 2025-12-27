import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  trend?: 'up' | 'down' | 'neutral';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subtitle,
  color = 'primary',
}: MetricCardProps) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start gap-3">
        <div className={cn("p-2.5 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
