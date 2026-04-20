import React from 'react';

export default function ChartCard({
  kicker,
  title,
  subtitle,
  actions,
  height = 280,
  children,
  className = ''
}) {
  return (
    <div className={`card ${className}`}>
      <div className="card-head">
        <div>
          {kicker && <div className="label-xs mb-1.5">{kicker}</div>}
          <h3 className="font-display text-[20px] tracking-tight text-bone-50 leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[12.5px] text-bone-400 max-w-prose">{subtitle}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="rule mx-5" />
      <div className="card-body pt-4">
        <div style={{ height }} className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
