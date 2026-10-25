import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  Cpu,
  Clock,
  HelpCircle,
} from 'lucide-react';
import type { ApkAnalysisResult, DynamicJobInfo } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { SectionLabel } from './ui/SectionLabel';
import { ConfidenceBar } from './ConfidenceBar';
import { FamilyBadge } from './FamilyBadge';
import { IndicatorList } from './IndicatorList';
import { DynamicProgressPanel } from './DynamicProgressPanel';

interface ResultCardProps {
  result: ApkAnalysisResult;
  onReset: () => void;
  dynamicJob?: DynamicJobInfo | null;
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '0s';
  if (ms < 1000) return `${ms}ms`;
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset,
  dynamicJob,
}) => {
  const [copied, setCopied] = useState(false);

  const isMalware = result.is_malware;
  const isDynamicActive =
    !!dynamicJob && (dynamicJob.status === 'pending' || dynamicJob.status === 'running');
  const isDynamicError = dynamicJob?.status === 'error';

  const packageName = result.apk_info?.package_name || 'unknown.package';
  const apkSizeMb = result.apk_info?.apk_size_mb?.toFixed(2) || '0.00';
  const minSdk = result.apk_info?.min_sdk ?? 0;
  const targetSdk = result.apk_info?.target_sdk ?? 0;

  const handleCopyPackage = () => {
    if (packageName && navigator?.clipboard) {
      navigator.clipboard.writeText(packageName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // -------------------------------------------------------------
  // STATE 1: ANALYZING SCREEN (Static scan ready, dynamic sandbox actively running)
  // -------------------------------------------------------------
  if (isDynamicActive) {
    const staticPct = Math.round(result.malware_prob * 100);

    return (
      <div className="w-full max-w-[1040px] mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Analyzing Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1 min-w-0">
            <SectionLabel as="span">Analyzing</SectionLabel>
            <h1 className="text-xl sm:text-[26px] font-mono font-semibold text-text tracking-tight truncate" title={packageName}>
              {packageName}
            </h1>
            <p className="font-mono text-xs text-muted">
              {apkSizeMb} MB · SDK {minSdk} → {targetSdk}
            </p>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <FamilyBadge
              family={result.family}
              isNovel={result.is_novel}
              elapsedSeconds={dynamicJob?.elapsed_seconds}
              isRunning={true}
            />
          </div>
        </div>

        {/* Compact Static Verdict Card */}
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border-border p-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <span
              className={`w-3 h-3 rounded-full shrink-0 mt-1 sm:mt-0 ${
                isMalware ? 'bg-danger' : 'bg-safe'
              }`}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-text">
                Static verdict: {result.verdict}
              </p>
              <p className="text-xs text-muted mt-0.5">
                Family classification and runtime telemetry arrive when the sandbox finishes.
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 self-end sm:self-auto font-mono">
            <span className="text-xs text-muted uppercase">Confidence</span>
            <span
              className={`text-2xl sm:text-3xl font-semibold tabular-nums ${
                isMalware ? 'text-danger' : 'text-safe'
              }`}
            >
              {staticPct}%
            </span>
          </div>
        </Card>

        {/* Active Dynamic Progress Panel with Stepper */}
        <DynamicProgressPanel job={dynamicJob} />

        {/* Dashed Skeleton Placeholder Card for Pending Family & Behavioral Telemetry */}
        <Card
          variant="dashed"
          className="p-8 text-center flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full border border-border-strong bg-surface-2 flex items-center justify-center text-muted">
            <Cpu className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-text mt-1">
            Model confidence and family result will appear here.
          </p>
          <p className="text-xs text-muted max-w-md">
            The sandbox is currently extracting runtime syscalls and process telemetry to evaluate against the 13-class ML model.
          </p>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: FINAL REPORT SCREEN (Analysis complete, benign or malware)
  // -------------------------------------------------------------
  const formattedDuration = formatDuration(result.analysis_time_ms);
  const familyConfPercent =
    result.family_conf !== null && result.family_conf !== undefined
      ? (result.family_conf * 100).toFixed(1)
      : null;

  return (
    <div className="w-full max-w-[1040px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Hero Verdict Card */}
      <Card
        variant={isMalware ? 'danger' : 'safe'}
        className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="flex items-start sm:items-center gap-5">
          <div
            className={`w-[52px] h-[52px] rounded-card border flex items-center justify-center shrink-0 ${
              isMalware
                ? 'bg-danger-tint border-danger-border text-danger'
                : 'bg-safe-tint border-safe-border text-safe'
            }`}
          >
            {isMalware ? (
              <ShieldAlert className="w-7 h-7 text-danger" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-safe" aria-hidden="true" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMalware ? 'bg-danger' : 'bg-safe'
                }`}
                aria-hidden="true"
              />
              <SectionLabel as="span">Final verdict</SectionLabel>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 ${
                isMalware ? 'text-danger' : 'text-safe'
              }`}
            >
              {isMalware ? 'Malware Detected' : 'Benign Application'}
            </h1>
            <p className="text-xs sm:text-sm text-muted font-mono mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Analysis completed in {formattedDuration}</span>
            </p>
          </div>
        </div>

        {/* Right-aligned Badge */}
        <div className="self-start sm:self-center shrink-0">
          {isMalware ? (
            <FamilyBadge family={result.family} isNovel={result.is_novel} />
          ) : (
            <Badge variant="safe" size="md">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>VERIFIED BENIGN</span>
            </Badge>
          )}
        </div>
      </Card>

      {/* Dynamic Sandbox Error Banner if profiling failed */}
      {isDynamicError && (
        <div
          role="status"
          className="rounded-card border border-warning-border bg-warning-tint p-4 flex items-start gap-3 text-warning text-xs"
        >
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-semibold text-warning">Dynamic Sandbox Notice: </span>
            <span className="text-warning/90">
              {dynamicJob?.message ||
                'Dynamic sandbox behavioral profiling could not complete. Relying on static ML classification.'}
            </span>
          </div>
        </div>
      )}

      {/* Two Column Layout (Auto-fit min 320px; stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Machine Learning Probabilities */}
        <div className="space-y-6">
          {/* Card 1: Static malware probability */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <SectionLabel as="h2">Static malware probability</SectionLabel>
              <span className="font-mono text-xs text-muted">SelectKBest + Ensemble</span>
            </div>

            <ConfidenceBar
              malwareProb={result.malware_prob}
              benignProb={result.benign_prob}
            />
          </Card>

          {/* Card 2: Family classification confidence */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <SectionLabel as="h2">Family classification confidence</SectionLabel>
              <span className="font-mono text-xs text-muted">13-class XGB/LGBM</span>
            </div>

            {familyConfPercent ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl sm:text-[48px] font-semibold text-text tracking-tight tabular-nums">
                    {familyConfPercent}%
                  </span>
                  <span className="text-xs font-mono uppercase text-muted tracking-wider">
                    Family confidence
                  </span>
                </div>

                <div className="p-3 rounded-button bg-surface-2 border border-border">
                  <p className="text-xs text-muted leading-relaxed">
                    Evaluated behavioral telemetry against serialized XGBoost and LightGBM family pipelines trained on the CIC-AndMal-2020 corpus.
                  </p>
                </div>
              </div>
            ) : result.is_novel ? (
              <div className="space-y-2">
                <Badge variant="warning" size="md">Novel Zero-Day Threat</Badge>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Model confidence remained below threshold (50%), indicating anomalous behavioral patterns unmapped to common malware families.
                </p>
              </div>
            ) : (
              <div className="py-2 text-muted text-xs leading-relaxed">
                {isMalware
                  ? 'Detailed family classification was not concluded by dynamic runtime hooks.'
                  : 'Benign package: No malicious signature family pattern was recognized.'}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Package Metadata & Grouped Stat Rows */}
        <Card className="space-y-6">
          {/* Package block with copy-to-clipboard button */}
          <div className="pb-5 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel as="h2">Package details</SectionLabel>
              <button
                type="button"
                onClick={handleCopyPackage}
                aria-label="Copy package name to clipboard"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-button border border-border bg-surface-2 text-muted hover:text-text hover:border-border-strong transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-safe" aria-hidden="true" />
                    <span className="text-safe">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy name</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-button bg-surface-2 border border-border font-mono text-sm text-text break-all select-all">
              {packageName}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-muted pt-1">
              <span>Size: <strong className="text-text">{apkSizeMb} MB</strong></span>
              <span>·</span>
              <span>SDK: <strong className="text-text">{minSdk} → {targetSdk}</strong></span>
            </div>
          </div>

          {/* Grouped Stat Rows (Permissions, Components, Behavior) */}
          <IndicatorList
            indicators={result.indicators}
            dangerousPerms={result.dangerous_permissions || []}
          />
        </Card>
      </div>

      {/* Reset Action */}
      <div className="pt-4 flex justify-start">
        <Button
          type="button"
          variant="secondary"
          onClick={onReset}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Analyze another file</span>
        </Button>
      </div>
    </div>
  );
};
