import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'accent' | 'warning';
  onRefresh?: () => void;
}

export function StatCard({ title, value, icon, color, onRefresh }: StatCardProps) {
  const colorClasses = {
    primary: 'from-primary to-accent',
    success: 'from-success to-emerald-500',
    accent: 'from-accent to-cyan-400',
    warning: 'from-warning to-amber-400'
  };

  return (
    <div className="stat-card group">
      <div className={cn(
        "w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-primary-foreground bg-gradient-to-br",
        colorClasses[color]
      )}>
        {icon}
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <div className="text-2xl font-bold text-foreground">{value.toLocaleString('ar-EG')}</div>
      {onRefresh && (
        <Button
          onClick={onRefresh}
          size="sm"
          variant="outline"
          className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <RefreshCw className="w-3 h-3 ml-1" />
          تحديث
        </Button>
      )}
    </div>
  );
}
