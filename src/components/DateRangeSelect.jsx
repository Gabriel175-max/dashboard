import React, { useEffect, useRef, useState } from 'react';
import { isoDaysAgo, todayIso, fmt } from '../lib/format.js';

const PRESETS = [
  { id: '7d', label: '7 dias', days: 7 },
  { id: '14d', label: '14 dias', days: 14 },
  { id: '30d', label: '30 dias', days: 30 },
  { id: '90d', label: '90 dias', days: 90 }
];

export function defaultRange() {
  return { preset: '30d', from: isoDaysAgo(30), to: todayIso() };
}

/**
 * value: { preset: '7d'|'14d'|'30d'|'90d'|'custom', from, to }
 * onChange(range)
 */
export default function DateRangeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(value.from);
  const [draftTo, setDraftTo] = useState(value.to);
  const ref = useRef(null);

  useEffect(() => {
    setDraftFrom(value.from);
    setDraftTo(value.to);
  }, [value.from, value.to]);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pickPreset = (p) => {
    onChange({ preset: p.id, from: isoDaysAgo(p.days), to: todayIso() });
    setOpen(false);
  };

  const applyCustom = () => {
    if (!draftFrom || !draftTo) return;
    const [from, to] = draftFrom <= draftTo ? [draftFrom, draftTo] : [draftTo, draftFrom];
    onChange({ preset: 'custom', from, to });
    setOpen(false);
  };

  const label =
    PRESETS.find((p) => p.id === value.preset)?.label ??
    `${fmt.shortDate(value.from)} → ${fmt.shortDate(value.to)}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-3 border border-bone-600/30 hover:border-bone-400/50 px-3.5 py-2 transition-colors group"
      >
        <span className="label-xs group-hover:text-bone-200">Período</span>
        <span className="font-display text-[14px] text-bone-50 tracking-tight">{label}</span>
        <span className="font-mono text-[10px] text-bone-400 tabular-nums">
          {fmt.shortDate(value.from)}–{fmt.shortDate(value.to)}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-bone-400">
          <path d="M2 3.5L5 6.5L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] bg-ink-850 border border-bone-600/25 shadow-2xl z-20">
          <div className="px-4 pt-3.5 pb-2 label-xs border-b border-bone-600/15">
            Atalhos
          </div>
          <div className="grid grid-cols-2 gap-px bg-bone-600/10 p-0">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => pickPreset(p)}
                className={[
                  'px-4 py-3 text-left transition-colors bg-ink-850 hover:bg-ink-800',
                  value.preset === p.id ? 'text-amber-500' : 'text-bone-100'
                ].join(' ')}
              >
                <div className="font-display text-[15px] tracking-tight">{p.label}</div>
                <div className="label-xs mt-0.5 text-bone-500">
                  {fmt.shortDate(isoDaysAgo(p.days))} — {fmt.shortDate(todayIso())}
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 pt-4 pb-3 label-xs border-t border-bone-600/15">Intervalo custom</div>
          <div className="px-4 pb-4 flex items-end gap-2">
            <div className="flex-1">
              <label className="label-xs block mb-1.5 text-bone-500">De</label>
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="w-full bg-ink-900 border border-bone-600/30 px-2.5 py-1.5 text-[13px] font-mono text-bone-100 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="flex-1">
              <label className="label-xs block mb-1.5 text-bone-500">Até</label>
              <input
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="w-full bg-ink-900 border border-bone-600/30 px-2.5 py-1.5 text-[13px] font-mono text-bone-100 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <button
              onClick={applyCustom}
              className="bg-amber-500 hover:bg-amber-400 text-ink-900 px-3.5 py-1.5 font-sans text-[12px] font-medium tracking-wide transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
