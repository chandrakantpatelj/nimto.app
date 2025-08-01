import { cn } from '@/lib/utils';

export const Toolbar = ({ children }) => {
  return (
    <div className="flex items-center justify-between grow gap-2.5 pb-5">
      {children}
    </div>
  );
};

export const ToolbarHeading = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col flex-wrap gap-px', className)}>
      {children}
    </div>
  );
};

export const ToolbarTitle = ({ className, children }) => {
  return (
    <h1 className={cn('font-semibold text-foreground text-lg', className)}>
      {children}
    </h1>
  );
};

export const ToolbarActions = ({ children }) => {
  return (
    <div className="flex items-center flex-wrap gap-1.5 lg:gap-3.5">
      {children}
    </div>
  );
};
