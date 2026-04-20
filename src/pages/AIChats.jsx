import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { useApi } from '../lib/useApi.js';
import { fmt } from '../lib/format.js';
import { palette, series } from '../lib/chartTheme.js';

import { PageHeader, LoadingState, ErrorState } from '../components/PageShell.jsx';
import DateRangeSelect from '../components/DateRangeSelect.jsx';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import DataTable from '../components/DataTable.jsx';

const KNOWN_SOURCES = ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'other'];
const SOURCE_LABEL = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  copilot: 'Copilot',
  other: 'Outros'
};

function detectSeriesKeys(timeseries) {
  if (!Array.isArray(timeseries) || timeseries.length === 0) return [];
  const keys = new Set();
  for (const row of timeseries) {
    Object.keys(row).forEach((k) => {
      if (k === 'date' || k === 'total') return;
      if (typeof row[k] === 'number') keys.add(k);
    });
  }
  const ordered = [];
  KNOWN_SOURCES.forEach((k) => { if (keys.has(k)) ordered.push(k); });
  Array.from(keys).forEach((k) => { if (!ordered.includes(k)) ordered.push(k); });
  return ordered;
}

export default function AIChats({ range, onRangeChange }) {
  const { data, loading, error } = useApi('/api/ai-referrals', {
    from: range.from,
    to: range.to
  });

  const summary = data?.summary ?? {};
  const timeseries = data?.timeseries ?? [];
  const bySource = data?.bySource ?? [];
  const topPages = data?.topPages ?? [];

  const seriesKeys = detectSeriesKeys(timeseries);

  return (
    <>
      <PageHeader
        kicker="Edição · Tráfego de IA"
        title="Quando o chatbot cita você, o leitor chega."
        lede="Sessões referidas por ChatGPT, Perplexity, Claude, Gemini e demais assistentes — as novas manchetes da descoberta."
        actions={<DateRangeSelect value={range} onChange={onRangeChange} />}
      />

      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              index="01"
              label="Indicações totais"
              value={summary?.totalReferrals?.value ?? summary?.totalReferrals}
              delta={summary?.totalReferrals?.delta}
              format="int"
              accent="amber"
              hint="visitas originadas de IAs"
            />
            <StatCard
              index="02"
              label="Páginas únicas"
              value={summary?.uniquePages?.value ?? summary?.uniquePages}
              delta={summary?.uniquePages?.delta}
              format="int"
              accent="moss"
              hint="URLs citadas ao menos uma vez"
            />
            <StatCard
              index="03"
              label="Fonte líder"
              value={
                summary?.topSource?.name ??
                summary?.topSource ??
                bySource[0]?.source ??
                '—'
              }
              format={(v) => <span className="font-display text-[38px] tracking-tight">{v}</span>}
              accent="amber"
              hint={
                bySource[0]
                  ? `${fmt.int(bySource[0].referrals)} indicações`
                  : 'sem dados no período'
              }
            />
          </div>

          {/* Timeseries area by source + donut */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
            <ChartCard
              className="xl:col-span-2"
              kicker="Série · por fonte"
              title="De onde vieram, todo dia"
              subtitle="Área empilhada com o volume de indicações por assistente."
              height={340}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseries} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    {seriesKeys.map((k, i) => {
                      const c = series[i % series.length];
                      return (
                        <linearGradient key={k} id={`ga-${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c} stopOpacity={0.55} />
                          <stop offset="100%" stopColor={c} stopOpacity={0.05} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid vertical={false} stroke={palette.grid} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmt.shortDate}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis axisLine={false} tickLine={false} width={52} tickFormatter={fmt.int} />
                  <Tooltip
                    labelFormatter={fmt.longDate}
                    formatter={(v, name) => [fmt.int(v), SOURCE_LABEL[name] ?? name]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={28}
                    iconType="plainline"
                    formatter={(v) => SOURCE_LABEL[v] ?? v}
                    wrapperStyle={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: 11,
                      color: palette.boneMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em'
                    }}
                  />
                  {seriesKeys.map((k, i) => (
                    <Area
                      key={k}
                      type="monotone"
                      dataKey={k}
                      name={k}
                      stackId="1"
                      stroke={series[i % series.length]}
                      strokeWidth={1.2}
                      fill={`url(#ga-${k})`}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              kicker="Composição"
              title="Fatia por assistente"
              subtitle="Participação de cada fonte no total do período."
              height={340}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(v) => fmt.int(v)}
                    labelFormatter={() => ''}
                  />
                  <Pie
                    data={bySource}
                    dataKey="referrals"
                    nameKey="source"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={2}
                    stroke={palette.ink}
                    strokeWidth={2}
                  >
                    {bySource.map((_, i) => (
                      <Cell key={i} fill={series[i % series.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="square"
                    formatter={(v) => SOURCE_LABEL[v] ?? v}
                    wrapperStyle={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: 11,
                      color: palette.boneMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Top pages table */}
          <DataTable
            kicker="Páginas citadas · Top 15"
            title="As URLs que os chatbots estão mandando"
            subtitle="Ordem por número de indicações recebidas no período."
            columns={[
              {
                key: 'page',
                label: 'Página',
                width: '52%',
                render: (row) => {
                  const p = row.page ?? '';
                  try {
                    const u = new URL(p);
                    return (
                      <span className="truncate block max-w-[520px]" title={p}>
                        <span className="text-bone-400">{u.host}</span>
                        <span className="text-bone-100">{u.pathname}</span>
                      </span>
                    );
                  } catch {
                    return <span className="truncate block max-w-[520px]">{p}</span>;
                  }
                }
              },
              {
                key: 'source',
                label: 'Fonte',
                width: '16%',
                render: (row) => (
                  <span className="chip">{SOURCE_LABEL[row.source] ?? row.source}</span>
                ),
                sortable: false
              },
              { key: 'referrals', label: 'Indicações', align: 'right', format: 'int' }
            ]}
            rows={topPages}
            maxRows={15}
          />
        </>
      )}
    </>
  );
}
