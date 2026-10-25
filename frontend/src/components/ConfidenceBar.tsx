import React from 'react';

interface ConfidenceBarProps {
  malwareProb: number;
  benignProb: number;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ malwareProb, benignProb }) => {
  const malPct = Math.round(malwareProb * 100);
  const benPct = Math.round(benignProb * 100);

  return (
    <div className="w-full space-y-4">
      {/* 48px mono percentage display */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl sm:text-[48px] font-semibold text-text tracking-tight tabular-nums">
            {malPct}%
          </span>
          <span className="text-xs font-mono uppercase text-muted tracking-wider">
            Malware confidence
          </span>
        </div>

        <span className="font-mono text-xs text-muted tabular-nums">
          Benign: {benPct}%
        </span>
      </div>

      {/* 10px bar: red fill over green remainder with 50% white threshold marker */}
      <div className="relative">
        <div
          role="progressbar"
          aria-valuenow={malPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Malware Probability"
          className="h-2.5 w-full bg-safe rounded-full overflow-hidden flex relative"
        >
          {/* Red fill for malware probability */}
          <div
            className="h-full bg-danger transition-all duration-500 ease-out"
            style={{ width: `${malPct}%` }}
          />
        </div>

        {/* Threshold marker at 50% */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white z-10 pointer-events-none"
        />
      </div>

      {/* Legend below bar */}
      <div className="flex items-center justify-between text-xs font-mono text-muted pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span>Malware</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
          <span>Threshold 50%</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-safe" />
          <span>Benign</span>
        </div>
      </div>
    </div>
  );
};
