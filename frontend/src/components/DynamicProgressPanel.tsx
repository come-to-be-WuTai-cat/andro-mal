import React, { useState, useEffect } from 'react';
import { Smartphone, Activity, Clock, Loader2, Cpu, Layers } from 'lucide-react';
import type { DynamicJobInfo } from '../types';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Stepper, type StepItem } from './ui/Stepper';
import { SectionLabel } from './ui/SectionLabel';

interface DynamicProgressPanelProps {
  job: DynamicJobInfo | null;
}

const STAGES: StepItem[] = [
  { id: 1, title: 'Sandbox Boot', desc: 'Initialize AVD & ADB bridge', icon: Smartphone },
  { id: 2, title: 'Deploy & Launch', desc: 'Install APK & trigger main activity', icon: Layers },
  { id: 3, title: 'Behavioral Profiling', desc: 'Frida API hooks & runtime monitoring', icon: Activity },
  { id: 4, title: 'ML Classification', desc: 'Dumpsys memory & 13-class inference', icon: Cpu },
];

export const DynamicProgressPanel: React.FC<DynamicProgressPanelProps> = ({ job }) => {
  // Increment local elapsed between poll updates without cascading renders
  const [extraSeconds, setExtraSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setExtraSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const localElapsed = (job?.elapsed_seconds ?? 0) + extraSeconds;

  const totalEstimated = job?.estimated_seconds || 60;
  const remainingSec = Math.max(0, totalEstimated - localElapsed);

  // Smooth progress calculation
  const rawProgress =
    job?.progress !== undefined
      ? job.progress
      : Math.min(95, Math.round((localElapsed / totalEstimated) * 100));

  // Combine stage index and time interpolation
  const activeStageIndex =
    job?.stage_index ||
    (localElapsed < 8 ? 1 : localElapsed < 18 ? 2 : localElapsed < 45 ? 3 : 4);

  const currentStageText =
    job?.stage ||
    (activeStageIndex === 1
      ? 'Booting Android sandbox emulator...'
      : activeStageIndex === 2
      ? 'Installing application & starting activity...'
      : activeStageIndex === 3
      ? 'Monitoring system calls & Frida hooks...'
      : 'Extracting telemetry and evaluating malware family...');

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-5 sm:p-6 space-y-5 border-border bg-surface">
      {/* Header with Title and Live Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse motion-reduce:hidden" />
            <SectionLabel as="h3">Dynamic sandbox execution</SectionLabel>
          </div>
          <p className="text-sm font-medium text-text mt-1">
            Isolated runtime behavioral analysis in progress
          </p>
        </div>

        {/* Timers & Countdown in mono */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-surface-2 px-3 py-1.5 rounded-button border border-border font-mono text-xs text-muted">
          <div className="flex items-center gap-1.5 text-text">
            <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>
              Elapsed: <strong className="text-text tabular-nums">{formatTime(localElapsed)}</strong>
            </span>
          </div>
          <span className="text-border-strong">·</span>
          <div className="tabular-nums">
            {remainingSec > 0 ? (
              <span>~{formatTime(remainingSec)} left</span>
            ) : rawProgress >= 90 ? (
              <span className="text-warning">Finalizing report...</span>
            ) : (
              <span>In progress</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span
            className="text-muted flex items-center gap-2 truncate max-w-[80%]"
            aria-live="polite"
          >
            <Loader2 className="w-3.5 h-3.5 text-accent animate-spin shrink-0" aria-hidden="true" />
            <span className="truncate">{currentStageText}</span>
          </span>
          <span className="font-mono font-semibold text-accent text-sm tabular-nums">
            {rawProgress}%
          </span>
        </div>

        <ProgressBar
          value={rawProgress}
          label="Sandbox Analysis Progress"
          height="h-1.5"
        />
      </div>

      {/* 4-Stage Stepper in responsive grid */}
      <Stepper steps={STAGES} activeStepIndex={activeStageIndex} />

      {/* Educational Note */}
      <div className="pt-2 flex items-center gap-2 text-xs text-muted">
        <p>
          Dynamic sandbox profiling takes a few minutes to let the APK execute its entrypoints and hook background daemon behaviors.
        </p>
      </div>
    </Card>
  );
};
