import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  subtitle?: string;
}

export const MetricCard = ({ title, value, change, changeType, subtitle }: MetricCardProps) => {
  const isPositive = changeType === 'positive';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {value}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
              isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              <TrendIcon className="w-3 h-3" />
              {change}
            </div>
            {subtitle && (
              <span className="text-sm text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};