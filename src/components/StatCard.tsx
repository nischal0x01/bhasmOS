import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: 'border-border bg-card',
  primary: 'border-primary/30 bg-primary/5',
  accent: 'border-accent/30 bg-accent/5',
  success: 'border-success/30 bg-success/5',
  warning: 'border-warning/30 bg-warning/5',
};

const textStyles = {
  default: 'text-foreground',
  primary: 'text-primary text-glow',
  accent: 'text-accent text-glow-accent',
  success: 'text-success',
  warning: 'text-warning',
};

export function StatCard({ label, value, unit, icon, variant = 'default', className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-4",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold font-mono", textStyles[variant])}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
}
