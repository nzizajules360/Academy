import { cn } from '@/lib/utils';
import { designSystem as ds } from '@/lib/design-constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StyledCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children?: ReactNode;
}

const variantStyles = {
  default: {
    gradient: ds.colors.primary.gradient,
    border: ds.colors.primary.border,
    iconColor: 'text-primary',
  },
  success: {
    gradient: ds.colors.success.gradient,
    border: ds.colors.success.border,
    iconColor: 'text-green-500',
  },
  warning: {
    gradient: ds.colors.warning.gradient,
    border: ds.colors.warning.border,
    iconColor: 'text-orange-500',
  },
  danger: {
    gradient: ds.colors.danger.gradient,
    border: ds.colors.danger.border,
    iconColor: 'text-destructive',
  },
};

export function StyledCard({
  title,
  description,
  icon,
  variant = 'default',
  className,
  headerClassName,
  contentClassName,
  children,
}: StyledCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn(
        ds.colors.card.background,
        ds.colors.card.backdropBlur,
        ds.colors.card.border,
        'shadow-xl overflow-hidden',
        className
      )}>
        {(title || description) && (
          <CardHeader className={cn(
            'bg-gradient-to-r',
            styles.gradient,
            'border-b',
            styles.border,
            headerClassName
          )}>
            <div className="flex items-start gap-3">
              {icon && (
                <div className={cn(styles.iconColor, "mt-1")}>
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <CardTitle className={ds.typography.heading.h2}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className={ds.typography.body.large}>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className={cn(ds.spacing.cardPadding, contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}