import React from 'react';
import { ShieldAlert, HelpCircle, Loader2 } from 'lucide-react';
import { Badge, type BadgeVariant } from './ui/Badge';

interface FamilyBadgeProps {
  family: string | null;
  isNovel: boolean;
  elapsedSeconds?: number;
  estimatedSeconds?: number;
  isRunning?: boolean;
}

const FAMILY_VARIANTS: Record<string, BadgeVariant> = {
  Ransomware: 'danger',
  Spy: 'danger',
  Adware: 'warning',
  Trojan: 'danger',
  Backdoor: 'danger',
  Banker: 'danger',
  Dropper: 'warning',
  Sms: 'warning',
  Riskware: 'warning',
  Scareware: 'warning',
};

export const FamilyBadge: React.FC<FamilyBadgeProps> = ({
  family,
  isNovel,
  elapsedSeconds,
  isRunning = false,
}) => {
  if (isRunning) {
    const formatted =
      elapsedSeconds !== undefined
        ? `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60)
            .toString()
            .padStart(2, '0')}`
        : '...';

    return (
      <Badge variant="info" size="md">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" aria-hidden="true" />
        <span>Sandbox running ({formatted})</span>
      </Badge>
    );
  }

  if (isNovel) {
    return (
      <Badge variant="warning" size="md">
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Unknown / Novel Threat</span>
      </Badge>
    );
  }

  if (family) {
    const variant = FAMILY_VARIANTS[family] || 'danger';
    return (
      <Badge variant={variant} size="md">
        <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{family.toUpperCase()}</span>
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" size="md">
      <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Unclassified Family</span>
    </Badge>
  );
};
