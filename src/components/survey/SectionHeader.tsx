import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export function SectionHeader({ title, subtitle, icon: Icon, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center gap-3 mb-1">
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground ml-0">{subtitle}</p>
      )}
    </div>
  );
}
