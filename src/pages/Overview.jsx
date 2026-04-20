import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { useApi } from '../lib/useApi.js';
import { fmt } from '../lib/format.js';
import { palette, series } from '../lib/chartTheme.js';

import { PageHeader, LoadingState, ErrorState, SectionTitle } from '../components/PageShell.jsx';
import DateRangeSelect from '../components/DateRangeSelect.jsx';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import DataTable from '../components/DataTable.jsx';

function toSpark(timeseries, key) {
  if (!Array.isArray(timeseries)) return [];
  return timeseries.map((d) => ({ v: Number(d?.[key] ?? 0) }));
}

export default function Overview({ range, onRangeChange }) {
  const { data, loading, error } = useApi('/api/overview', {
    from: range.from,
    to: range.to
  });

  const kpis = data?.kpis ?? {};
  const timeseries = data?.timeseries ?? [];
  const topSources = data?.topSources ?? [];

  return (
    <>
      <PageHeader
        kicker="Edição diária · Geral"
        title="A colheita de hoje, em panorama."
        lede="Visão executiva do tráfego, buscas orgânicas, indicações de IA e atividade de bots — consolidada em uma única edição."
        actions={<DateRangeSelect value={range} onChange={onRangeChange} />}
      />

      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              index="01"
              label="Sessões"
              value={kpis?.sessions?.value}
              delta={kpis?.sessions?.delta}
              format="int"
              accent="amber"
              spark={toSpark(timeseries, 'sessions')}
              hint="visitas ao site no período"
            />
            <StatCard
              index="02"
              label="Indicações de IA"
              value={kpis?.aiReferrals?.value}
              delta={kpis?.aiReferrals?.delta}
              format="int"
              accent="moss"
              spark={toSpark(timeseries, 'aiReferrals')}
              hint="cliques vindos de chatbots"
            />
            <StatCard
              index="03"
              label="Cliques na busca"
              value={kpis?.searchClicks?.value}
              delta={kpis?.searchClicks?.delta}
              format="int"
              accent="amber"
              spark={toSpark(timeseries, 'searchClicks')}
              hint="Google Search Console"
            />
            <StatCard
              index="04"
              label="Hits de bots"
              value={kpis?.botHits?.value}
              delta={kpis?.botHits?.delta}
              format="int"
              accent="moss"
              spark={toSpark(timeseries, 'botHits')}
              hint="rastreadores de IA"
            />
          </div>

          {/* Timeseries + Top sources */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
            <ChartCard
              className="xl:col-span-2"
              kicker="Série temporal"
              title="Tráfego, dia a dia"
              subtitle="Sessões e cliques orgânicos cruzados ao longo do período selecionado."
              height={320}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseries} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-sessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.amber} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={palette.amber} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-search" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.moss} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={palette.moss} stopOpacity={0} />
                    </linearGradient>
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
                    formatter={(v, name) => [fmt.int(v), name]}
                    cursor={{ stroke: palette.grid, strokeWidth: 1 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={28}
                    iconType="plainline"
                    wrapperStyle={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: 11,
                      color: palette.boneMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sessões"
                    stroke={palette.amber}
                    strokeWidth={1.6}
                    fill="url(#g-sessions)"
                  />
                  <Area
                    type="monotone"
                    dataKey="searchClicks"
                    name="Cliques"
                    stroke={palette.moss}
                    strokeWidth={1.6}
                    fill="url(#g-search)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              kicker="Distribuição"
              title="Origens principais"
              subtitle="Top 7 fontes de tráfego no período."
              height={320}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSources.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap={10}
                >
                  <CartesianGrid horizontal={false} stroke={palette.grid} />
                  <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={fmt.int} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={92}
                  />
                  <Tooltip formatter={(v) => fmt.int(v)} cursor={{ fill: 'rgba(236,229,211,0.04)' }} />
                  <Bar dataKey="sessions" name="Sessões" radius={[0, 1, 1, 0]}>
                    {topSources.slice(0, 7).map((_, i) => (
                      <Cell key={i} fill={series[i % series.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Recent table */}
          <SectionTitle
            kicker="Registro"
            title="Resumo dos últimos dias"
            subtitle="Linha por linha, as métricas consolidadas do período."
          />
          <DataTable
            columns={[
              { key: 'date', label: 'Data', format: fmt.longDate, width: '22%' },
              { key: 'sessions', label: 'Sessões', align: 'right', format: 'int' },
              { key: 'aiReferrals', label: 'AI refs', align: 'right', format: 'int' },
              { key: 'searchClicks', label: 'Cliques', align: 'right', format: 'int' },
              { key: 'botHits', label: 'Bot hits', align: 'right', format: 'int' }
            ]}
            rows={[...timeseries].reverse()}
            maxRows={10}
          />
        </>
      )}
    </>
  );
}
