import React from 'react';
import { Button } from '@/components/ui/Button';

export interface MobileCardField {
  label: string;
  value: React.ReactNode;
}

export interface MobileCardProps {
  title: string;
  subtitle?: string;
  statusBadge?: React.ReactNode;
  fields: MobileCardField[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'danger' | 'warning';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function MobileCard({
  title,
  subtitle,
  statusBadge,
  fields,
  primaryAction,
  secondaryAction,
}: MobileCardProps) {
  const buttonVariant =
    primaryAction?.variant === 'danger'
      ? 'danger'
      : primaryAction?.variant === 'warning'
      ? 'wholesale'
      : 'primary';

  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3">
      {/* ১. হেডার: নাম ও স্ট্যাটাস ব্যাজ */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-subtle">
        <div className="min-w-0">
          <span className="font-bold text-ink-primary text-sm truncate block">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-ink-secondary mt-0.5 block truncate">
              {subtitle}
            </span>
          )}
        </div>
        {statusBadge && <div className="shrink-0">{statusBadge}</div>}
      </div>

      {/* ২. তথ্য সারি */}
      <div className="space-y-2 text-xs">
        {fields.map((field, idx) => (
          <div
            key={field.label}
            className={`flex items-center justify-between gap-3 ${
              idx > 0 ? 'pt-2 border-t border-border-subtle' : 'py-0.5'
            }`}
          >
            <span className="shrink-0 text-ink-secondary font-semibold text-xs">
              {field.label}
            </span>
            <div className="text-right font-bold text-ink-primary break-words tabular-numbers">
              {field.value}
            </div>
          </div>
        ))}
      </div>

      {/* ৩. অ্যাকশন ফুটার (>= 40px টাচ উচ্চতা) */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
          {secondaryAction && (
            <Button
              variant="secondary"
              size="md"
              onClick={secondaryAction.onClick}
              className="flex-1"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </Button>
          )}
          {primaryAction && (
            <Button
              variant={buttonVariant}
              size="md"
              onClick={primaryAction.onClick}
              className="flex-1"
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
