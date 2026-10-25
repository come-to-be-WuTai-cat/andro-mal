import { CheckCircle2, type LucideProps } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface StepItem {
  id: number;
  title: string;
  desc: string;
  icon?: React.ComponentType<LucideProps>;
}

interface StepperProps {
  steps: StepItem[];
  activeStepIndex: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStepIndex,
  className,
}) => {
  return (
    <div className={twMerge(clsx('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3', className))}>
      {steps.map((step) => {
        const isDone = activeStepIndex > step.id;
        const isActive = activeStepIndex === step.id;
        const isPending = activeStepIndex < step.id;

        return (
          <div
            key={step.id}
            className={clsx(
              'rounded-card border p-3.5 transition-colors duration-200 flex flex-col justify-between min-h-[92px]',
              isDone && 'bg-surface border-border text-text',
              isActive && 'bg-surface-2 border-accent text-text ring-1 ring-accent/40',
              isPending && 'bg-surface/40 border-border/60 text-muted/55 opacity-60'
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-xs text-muted">
                0{step.id}
              </span>

              {isDone && (
                <CheckCircle2
                  aria-label="Completed"
                  className="w-4 h-4 text-safe shrink-0"
                />
              )}

              {isActive && (
                <span
                  aria-label="In progress"
                  className="relative flex h-3 w-3 shrink-0"
                >
                  <span className="animate-ping motion-reduce:hidden absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
                </span>
              )}

              {isPending && (
                <span
                  aria-label="Pending"
                  className="w-2.5 h-2.5 rounded-full bg-border-strong shrink-0"
                />
              )}
            </div>

            <div>
              <p className={clsx('text-xs font-semibold leading-tight', isActive && 'text-accent')}>
                {step.title}
              </p>
              <p className="text-[11px] text-muted leading-tight mt-1 line-clamp-1">
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
