import React from 'react';

const NAV = [
  { id: 'overview', label: 'Overview', index: '01' },
  { id: 'search', label: 'Search Console', index: '02' },
  { id: 'ai-chats', label: 'AI Chats', index: '03' },
  { id: 'ai-bots', label: 'AI Bots', index: '04' }
];

function WheatMark({ className = '' }) {
  // Minimal editorial wheat/grain mark
  return (
    <svg viewBox="0 0 40 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <path d="M20 46 V14" />
      <path d="M20 16 C 14 14, 11 11, 10 6 C 15 7, 19 10, 20 15" />
      <path d="M20 16 C 26 14, 29 11, 30 6 C 25 7, 21 10, 20 15" />
      <path d="M20 22 C 14 20, 11 17, 10 12 C 15 13, 19 16, 20 21" />
      <path d="M20 22 C 26 20, 29 17, 30 12 C 25 13, 21 16, 20 21" />
      <path d="M20 28 C 14 26, 11 23, 10 18 C 15 19, 19 22, 20 27" />
      <path d="M20 28 C 26 26, 29 23, 30 18 C 25 19, 21 22, 20 27" />
      <path d="M20 34 C 15 33, 13 31, 12 27" />
      <path d="M20 34 C 25 33, 27 31, 28 27" />
    </svg>
  );
}

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] border-r border-bone-600/15 bg-ink-900/80 backdrop-blur-sm flex flex-col z-10">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-start gap-3">
          <WheatMark className="w-7 h-9 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-none">
            <div className="font-display text-[22px] tracking-tight text-bone-50">Signal</div>
            <div className="label-xs mt-1.5 text-bone-500">Edição nº 01</div>
          </div>
        </div>
      </div>

      <div className="mx-6 rule-amber" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <div className="label-xs px-3 mb-3">Seções</div>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChange(item.id)}
                  className={[
                    'group w-full text-left px-3 py-2.5 flex items-baseline gap-3 relative transition-colors',
                    isActive
                      ? 'text-bone-50'
                      : 'text-bone-300 hover:text-bone-50 hover:bg-ink-800/60'
                  ].join(' ')}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-amber-500"
                    />
                  )}
                  <span
                    className={[
                      'font-mono text-[10px] tabular-nums tracking-wider',
                      isActive ? 'text-amber-500' : 'text-bone-500 group-hover:text-bone-300'
                    ].join(' ')}
                  >
                    {item.index}
                  </span>
                  <span className="font-display text-[16px] tracking-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 pb-6 pt-4">
        <div className="rule mb-4" />
        <div className="flex items-center justify-between">
          <div>
            <div className="label-xs">Status</div>
            <div className="font-mono text-[11px] text-bone-200 mt-1 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-moss-500" />
              </span>
              ao vivo
            </div>
          </div>
          <div className="text-right">
            <div className="label-xs">v</div>
            <div className="font-mono text-[11px] text-bone-200 mt-1">0.1.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
