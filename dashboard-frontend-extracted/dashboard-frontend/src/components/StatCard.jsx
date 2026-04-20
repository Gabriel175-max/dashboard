import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { fmt } from '../lib/format.js';

function Spark({ data, color = '#7A9960' }) {
  if (!data || data.length < 2) return null;
  const gid = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className="h-10 w-full -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.4}
            fill={`url(#${gid})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * <StatCard
 *   index="01"
 *   label="Sessões"
 *   value={12843}
 *   format="int" | "pct" | "dec" | (v)=>string
 *   delta={4.2}            // % change
 *   hint="vs. período anterior"
 *   spark={[{v:1},{v:3}]}  // optional
 *   accent="amber" | "moss"
 * />
 */
export default function StatCard({
  index,
  label,
  value,
  format = 'int',
  delta,
  hint,
  spark,
  accent = 'amber'
}) {
  const formatter = typeof format === 'function' ? format : (v) => fmt[format]?.(v) ?? String(v);
  const deltaNum = delta == null ? null : Number(delta);
  const deltaClass =
    deltaNum == null
      ? 'chip'
      : deltaNum > 0
      ? 'chip chip-up'
      : deltaNum < 0
      ? 'chip chip-down'
      : 'chip';
  const accentColor = accent === 'moss' ? '#7A9960' : '#D4A84B';

  return (
    <div className="card">
      {/* top accent rule */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: `${accentColor}55` }}
      />
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {index && (
              <span className="font-mono text-[10px] tabular-nums text-bone-500 tracking-wider">
                {index}
              </span>
            )}
            <span className="label-xs">{label}</span>
          </div>
          {deltaNum != null && <span className={deltaClass}>{fmt.delta(deltaNum)}</span>}
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <div className="num text-kpi text-bone-50">{formatter(value)}</div>
        </div>

        {hint && (
          <div className="mt-1 font-sans text-[11.5px] text-bone-400">{hint}</div>
        )}

        {spark && spark.length > 1 && (
          <div className="mt-3">
            <Spark data={spark} color={accentColor} />
          </div>
        )}
      </div>
    </div>
  );
}
