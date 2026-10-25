import React from 'react';
import { StatRow } from './ui/StatRow';
import { SectionLabel } from './ui/SectionLabel';

interface Indicators {
  n_permissions: number;
  n_dangerous_perms: number;
  n_suspicious_apis: number;
  has_native_code: number;
  has_dynamic_code: number;
  n_activities?: number;
  n_services?: number;
  n_receivers?: number;
}

interface IndicatorListProps {
  indicators: Indicators;
  dangerousPerms: string[];
}

export const IndicatorList: React.FC<IndicatorListProps> = ({
  indicators,
  dangerousPerms,
}) => {
  return (
    <div className="space-y-6">
      {/* Group 1: Permissions & APIs */}
      <div>
        <SectionLabel className="mb-2">Permissions & APIs</SectionLabel>
        <div className="divide-y divide-border/80 border-t border-b border-border/80">
          <StatRow
            label="Total declared permissions"
            value={indicators.n_permissions}
            isRisky={false}
          />
          <StatRow
            label="Dangerous permissions"
            value={indicators.n_dangerous_perms}
            isRisky={indicators.n_dangerous_perms > 0}
            subtext={indicators.n_dangerous_perms > 0 ? 'Requires explicit runtime grant' : undefined}
          />
          <StatRow
            label="Suspicious API references"
            value={indicators.n_suspicious_apis}
            isRisky={indicators.n_suspicious_apis > 0}
            isLast={true}
          />
        </div>
      </div>

      {/* Flagged Dangerous Permissions Chips if present */}
      {dangerousPerms && dangerousPerms.length > 0 && (
        <div className="p-3.5 rounded-button bg-surface-2 border border-border">
          <span className="text-xs font-mono uppercase tracking-wider text-muted block mb-2 font-medium">
            Flagged dangerous permissions ({dangerousPerms.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {dangerousPerms.map((perm) => (
              <span
                key={perm}
                className="px-2 py-1 bg-danger-tint text-danger text-xs rounded border border-danger-border font-mono"
              >
                {perm.split('.').pop()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Group 2: Components */}
      <div>
        <SectionLabel className="mb-2">Components</SectionLabel>
        <div className="divide-y divide-border/80 border-t border-b border-border/80">
          <StatRow
            label="Activities"
            value={indicators.n_activities ?? 0}
            isRisky={false}
          />
          <StatRow
            label="Services"
            value={indicators.n_services ?? 0}
            isRisky={false}
          />
          <StatRow
            label="Broadcast receivers"
            value={indicators.n_receivers ?? 0}
            isRisky={false}
            isLast={true}
          />
        </div>
      </div>

      {/* Group 3: Code behavior */}
      <div>
        <SectionLabel className="mb-2">Code behavior</SectionLabel>
        <div className="divide-y divide-border/80 border-t border-b border-border/80">
          <StatRow
            label="Native shared libraries (.so)"
            value={indicators.has_native_code ? 'Yes' : 'No'}
            isRisky={indicators.has_native_code === 1}
            subtext={indicators.has_native_code === 1 ? 'Executes compiled C/C++ architecture code' : undefined}
          />
          <StatRow
            label="Dynamic code loading (DexClassLoader / .dex)"
            value={indicators.has_dynamic_code ? 'Yes' : 'No'}
            isRisky={indicators.has_dynamic_code === 1}
            subtext={indicators.has_dynamic_code === 1 ? 'High risk: secondary payloads may load at runtime' : undefined}
            isLast={true}
          />
        </div>
      </div>
    </div>
  );
};
