import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

import { useApi } from '../lib/useApi.js';
import { fmt } from '../lib/format.js';
import { palette, series } from '../lib/chartTheme.js';

import { PageHeader, LoadingState, ErrorState } from '../components/PageShell.jsx';
import DateRangeSelect from '../components/DateRangeSelect.jsx';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import DataTable from '../components/DataTable.jsx';

const BOT_LABEL = {
  gptbot: 'GPTBot',
  perplexitybot: 'PerplexityBot',
  claudebot: 'ClaudeBot',
  'claude-web': 'Claude-Web',
  googlebot: 'Googlebot',
  bingbot: 'Bingbot',
  ccbot: 'CCBot',
  'google-extended': 'Google-Extended',
  'applebot-extended': 'Applebot-Extended',
  facebookbot: 'FacebookBot',
  other: 'Outros'
};

const botName = (b) => BOT_LABEL[String(b).toLowerCase()] ?? b;

function detectSeriesKeys(timeseries) {
  if (!Array.isArray(timeseries) || timeseries.length === 0) return [];
  const keys = new Set();
  for (const row of timeseries) {
    Object.keys(row).forEach((k) => {
      if (k === 'date' || k === 'total') return;
      if (typeof row[k] === 'number') keys.add(k);
    });
  }
  return Array.from(keys);
}

export default function AIBots({ range, onRangeChange }) {
  const { data, loading, error } = useApi('/api/ai-bots', {
    from: range.from,
    to: range.to
  });

  const summary = data?.summary ?? {};
  const timeseries = data?.timeseries ?? [];
  const byBot = data?.byBot ?? [];
  const topPaths = data?.topPaths ?? [];
  const seriesKeys = detectSeriesKeys(timeseries);

  return (
    <>
      <PageHeader
        kicker="Edição · Rastreadores"
        title="Quem anda vasculhando o campo."
        lede="Atividade de crawlers de IA e buscadores — quais bots vieram, com que frequência e em quais páginas."
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
              label="Hits totais"
              value={summary?.totalHits?.value ?? summary?.totalHits}
              delta={summary?.totalHits?.delta}
              format="int"
              accent="amber"
              hint="requisições feitas por bots"
            />
            <StatCard
              index="02"
              label="Bots distintos"
              value={summary?.uniqueBots?.value ?? summary?.uniqueBots}
              delta={summary?.uniqueBots?.delta}
              format="int"
              accent="moss"
              hint="user-agents observados"
            />
            <StatCard
              index="03"
              label="Bot líder"
              value={botName(summary?.topBot?.name ?? summary?.topBot ?? byBot[0]?.bot ?? '—')}
              format={(v) => <span className="font-display text-[32px] tracking-tight">{v}</span>}
              accent="amber"
              hint={byBot[0] ? `${fmt.int(byBot[0].hits)} hits` : 'sem dados no período'}
            />
          </div>

          {/* Stacked bar timeseries + bar by bot */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
            <ChartCard
              className="xl:col-span-2"
              kicker="Série · por bot"
              title="Rastreio, dia após dia"
              subtitle="Barras empilhadas com o número de hits por user-agent."
              height={340}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeseries} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
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
                    formatter={(v, name) => [fmt.int(v), botName(name)]}
                    cursor={{ fill: 'rgba(236,229,211,0.04)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={28}
                    iconType="square"
                    formatter={(v) => botName(v)}
                    wrapperStyle={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: 11,
                      color: palette.boneMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em'
                    }}
                  />
                  {seriesKeys.map((k, i) => (
                    <Bar
                      key={k}
                      dataKey={k}
                      stackId="bots"
                      name={k}
                      fill={series[i % series.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              kicker="Ranking"
              title="Hits por bot"
              subtitle="Total acumulado no período."
              height={340}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byBot.slice(0, 8).map((r) => ({ ...r, label: botName(r.bot) }))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap={10}
                >
                  <CartesianGrid horizontal={false} stroke={palette.grid} />
                  <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={fmt.int} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    width={108}
                  />
                  <Tooltip formatter={(v) => fmt.int(v)} cursor={{ fill: 'rgba(236,229,211,0.04)' }} />
                  <Bar dataKey="hits" name="Hits" radius={[0, 1, 1, 0]}>
                    {byBot.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={series[i % series.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Paths table */}
          <DataTable
            kicker="Caminhos · Top 15"
            title="Onde os bots mais bateram"
            subtitle="Paths mais rastreados no período."
            columns={[
              {
                key: 'path',
                label: 'Caminho',
                width: '56%',
                render: (row) => (
                  <span className="font-mono text-[12.5px] text-bone-100 truncate block max-w-[560px]" title={row.path}>
                    {row.path}
                  </span>
                )
              },
              {
                key: 'bot',
                label: 'Bot',
                width: '20%',
                render: (row) => <span className="chip">{botName(row.bot)}</span>,
                sortable: false
              },
              { key: 'hits', label: 'Hits', align: 'right', format: 'int' }
            ]}
            rows={topPaths}
            maxRows={15}
          />
        </>
      )}
    </>
  );
}
