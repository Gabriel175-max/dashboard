import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { useApi } from '../lib/useApi.js';
import { fmt } from '../lib/format.js';
import { palette } from '../lib/chartTheme.js';

import { PageHeader, LoadingState, ErrorState, SectionTitle } from '../components/PageShell.jsx';
import DateRangeSelect from '../components/DateRangeSelect.jsx';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import DataTable from '../components/DataTable.jsx';

function toSpark(timeseries, key) {
  if (!Array.isArray(timeseries)) return [];
  return timeseries.map((d) => ({ v: Number(d?.[key] ?? 0) }));
}

export default function SearchPage({ range, onRangeChange }) {
  const { data, loading, error } = useApi('/api/search-console', {
    from: range.from,
    to: range.to
  });

  const summary = data?.summary ?? {};
  const timeseries = data?.timeseries ?? [];
  const queries = data?.queries ?? [];
  const pages = data?.pages ?? [];

  return (
    <>
      <PageHeader
        kicker="Edição · Busca orgânica"
        title="O que o Google está colhendo."
        lede="Cliques, impressões, CTR e posição média — vindos direto do Search Console, arrumados em forma de jornal."
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
              label="Cliques"
              value={summary?.clicks?.value ?? summary?.clicks}
              delta={summary?.clicks?.delta}
              format="int"
              accent="amber"
              spark={toSpark(timeseries, 'clicks')}
              hint="total no período"
            />
            <StatCard
              index="02"
              label="Impressões"
              value={summary?.impressions?.value ?? summary?.impressions}
              delta={summary?.impressions?.delta}
              format="int"
              accent="moss"
              spark={toSpark(timeseries, 'impressions')}
              hint="exibições na SERP"
            />
            <StatCard
              index="03"
              label="CTR médio"
              value={summary?.ctr?.value ?? summary?.ctr}
              delta={summary?.ctr?.delta}
              format="pct"
              accent="amber"
              hint="cliques por impressão"
            />
            <StatCard
              index="04"
              label="Posição média"
              value={summary?.position?.value ?? summary?.position}
              delta={summary?.position?.delta != null ? -summary.position.delta : null}
              format="dec"
              accent="moss"
              hint="quanto menor, melhor"
            />
          </div>

          {/* Dual axis chart */}
          <ChartCard
            kicker="Série temporal"
            title="Cliques e impressões, lado a lado"
            subtitle="Barras representam impressões; a linha, cliques. Eixos independentes para capturar a relação mesmo com escalas distintas."
            height={340}
            className="mb-8"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeseries} margin={{ top: 12, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={palette.grid} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmt.shortDate}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={fmt.int}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={fmt.int}
                />
                <Tooltip
                  labelFormatter={fmt.longDate}
                  formatter={(v, name) => [fmt.int(v), name]}
                  cursor={{ fill: 'rgba(236,229,211,0.04)' }}
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
                <Bar
                  yAxisId="right"
                  dataKey="impressions"
                  name="Impressões"
                  fill={palette.moss}
                  fillOpacity={0.35}
                  radius={[1, 1, 0, 0]}
                  barSize={14}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clicks"
                  name="Cliques"
                  stroke={palette.amber}
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 3, fill: palette.amber, stroke: palette.ink, strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Two tables side-by-side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <DataTable
              kicker="Manchete · Top 10"
              title="Termos que mais trouxeram cliques"
              subtitle="Ordenado por cliques. Clique nas colunas numéricas para reordenar."
              columns={[
                { key: 'query', label: 'Termo', width: '44%' },
                { key: 'clicks', label: 'Cliques', align: 'right', format: 'int' },
                { key: 'impressions', label: 'Impr.', align: 'right', format: 'int' },
                { key: 'ctr', label: 'CTR', align: 'right', format: 'pct' },
                { key: 'position', label: 'Pos.', align: 'right', format: 'dec' }
              ]}
              rows={queries}
              maxRows={10}
            />
            <DataTable
              kicker="Páginas · Top 10"
              title="Páginas com melhor colheita"
              subtitle="URLs que mais receberam cliques orgânicos."
              columns={[
                {
                  key: 'page',
                  label: 'Página',
                  width: '44%',
                  render: (row) => {
                    const p = row.page ?? '';
                    try {
                      const u = new URL(p);
                      return (
                        <span className="truncate block max-w-[260px]" title={p}>
                          <span className="text-bone-400">{u.host}</span>
                          <span className="text-bone-100">{u.pathname}</span>
                        </span>
                      );
                    } catch {
                      return <span className="truncate block max-w-[260px]">{p}</span>;
                    }
                  }
                },
                { key: 'clicks', label: 'Cliques', align: 'right', format: 'int' },
                { key: 'impressions', label: 'Impr.', align: 'right', format: 'int' },
                { key: 'ctr', label: 'CTR', align: 'right', format: 'pct' },
                { key: 'position', label: 'Pos.', align: 'right', format: 'dec' }
              ]}
              rows={pages}
              maxRows={10}
            />
          </div>
        </>
      )}
    </>
  );
}
