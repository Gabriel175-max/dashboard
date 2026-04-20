import React from 'react';

export function PageHeader({ kicker, title, lede, actions }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-8">
      <div className="max-w-2xl">
        {kicker && <div className="label-xs mb-3 text-amber-500">{kicker}</div>}
        <h1 className="font-display text-[44px] leading-[1.02] tracking-tight text-bone-50">
          {title}
        </h1>
        {lede && (
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-bone-300 max-w-xl">
            {lede}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 pt-2">{actions}</div>}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-[140px] animate-pulse">
          <div className="p-5">
            <div className="h-2 w-20 bg-bone-600/20" />
            <div className="h-8 w-32 bg-bone-600/20 mt-6" />
            <div className="h-2 w-24 bg-bone-600/15 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card px-6 py-8">
      <div className="label-xs text-amber-500 mb-2">Erro</div>
      <h3 className="font-display text-[22px] text-bone-50 tracking-tight">
        Não foi possível carregar os dados.
      </h3>
      <p className="mt-2 text-[13px] text-bone-300 font-mono break-words">
        {error?.message ?? String(error)}
      </p>
      <div className="mt-4 flex items-center gap-3 text-[12.5px] text-bone-400">
        <span>Verifique se a API está rodando em </span>
        <code className="font-mono text-amber-400 bg-ink-900 px-1.5 py-0.5 border border-bone-600/20">
          {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}
        </code>
        <span>e o token está configurado.</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 border border-bone-600/40 hover:border-amber-500/60 hover:text-amber-400 px-4 py-2 text-[12px] font-sans tracking-wide transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ kicker, title, subtitle }) {
  return (
    <div className="mb-4">
      {kicker && <div className="label-xs mb-1.5">{kicker}</div>}
      <h2 className="font-display text-[26px] tracking-tight text-bone-50 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-[13px] text-bone-400 max-w-prose">{subtitle}</p>
      )}
    </div>
  );
}
