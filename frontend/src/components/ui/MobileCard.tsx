import React from 'react';

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
  const primaryBg = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
  }[primaryAction?.variant || 'primary'];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
      {/* 1. Header: Entity Name & Status Badge */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="min-w-0">
          <span className="font-bold text-slate-900 text-sm truncate block">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
              {subtitle}
            </span>
          )}
        </div>
        {statusBadge && <div className="shrink-0">{statusBadge}</div>}
      </div>

      {/* 2. Key-Value Body */}
      <div className="space-y-2 text-xs">
        {fields.map((field, idx) => (
          <div
            key={field.label}
            className={`flex items-center justify-between gap-3 ${
              idx > 0 ? 'pt-2 border-t border-slate-100/70' : 'py-0.5'
            }`}
          >
            <span className="shrink-0 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              {field.label}
            </span>
            <div className="text-right font-bold text-slate-900 break-words tabular-numbers">
              {field.value}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Pinned Action Footer (>= 40px touch height) */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="flex-1 h-10 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer ${primaryBg}`}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
