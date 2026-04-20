import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync } from 'fs';

let _client = null;

function getClient() {
  if (_client) return _client;
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || './service-account.json';
  const credentials = JSON.parse(readFileSync(keyPath, 'utf8'));
  _client = new BetaAnalyticsDataClient({ credentials });
  return _client;
}

const property = () => `properties/${process.env.GA4_PROPERTY_ID}`;

// Fontes de IA conhecidas
const AI_SOURCES = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'claude.ai',
  'gemini.google.com', 'copilot.microsoft.com', 'you.com', 'phind.com'];

function rowVal(row, idx) {
  return row.dimensionValues?.[idx]?.value ?? '';
}
function metricVal(row, idx) {
  return parseInt(row.metricValues?.[idx]?.value ?? '0', 10);
}

export async function fetchOverview(from, to) {
  const client = getClient();

  // Sessões por dia
  const [sessionsRes] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });

  // Indicações de IA por dia
  const [aiRes] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: 'date' }, { name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      orGroup: {
        expressions: AI_SOURCES.map(src => ({
          filter: {
            fieldName: 'sessionSource',
            stringFilter: { matchType: 'CONTAINS', value: src, caseSensitive: false }
          }
        }))
      }
    },
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });

  // Top fontes de tráfego
  const [sourcesRes] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  });

  // Montar timeseries
  const sessionsByDate = {};
  for (const row of sessionsRes.rows ?? []) {
    const date = rowVal(row, 0);
    sessionsByDate[date] = (sessionsByDate[date] || 0) + metricVal(row, 0);
  }

  const aiByDate = {};
  for (const row of aiRes.rows ?? []) {
    const date = rowVal(row, 0);
    aiByDate[date] = (aiByDate[date] || 0) + metricVal(row, 0);
  }

  const dates = Object.keys(sessionsByDate).sort();
  const timeseries = dates.map(date => ({
    date,
    sessions: sessionsByDate[date] || 0,
    aiReferrals: aiByDate[date] || 0,
    searchClicks: 0, // preenchido pelo GSC
    botHits: 0       // bots são filtrados pelo GA4 por padrão
  }));

  const totalSessions = dates.reduce((s, d) => s + (sessionsByDate[d] || 0), 0);
  const totalAi = dates.reduce((s, d) => s + (aiByDate[d] || 0), 0);

  const topSources = (sourcesRes.rows ?? []).map(row => ({
    name: rowVal(row, 0),
    sessions: metricVal(row, 0)
  }));

  return {
    kpis: {
      sessions: { value: totalSessions, delta: null },
      aiReferrals: { value: totalAi, delta: null },
      searchClicks: { value: 0, delta: null },
      botHits: { value: 0, delta: null }
    },
    timeseries,
    topSources
  };
}

export async function fetchAiReferrals(from, to) {
  const client = getClient();

  const sourceMap = {
    'chatgpt.com': 'chatgpt',
    'chat.openai.com': 'chatgpt',
    'perplexity.ai': 'perplexity',
    'claude.ai': 'claude',
    'gemini.google.com': 'gemini',
    'copilot.microsoft.com': 'copilot'
  };

  const [res] = await client.runReport({
    property: property(),
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: 'date' }, { name: 'sessionSource' }, { name: 'landingPage' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      orGroup: {
        expressions: AI_SOURCES.map(src => ({
          filter: {
            fieldName: 'sessionSource',
            stringFilter: { matchType: 'CONTAINS', value: src, caseSensitive: false }
          }
        }))
      }
    },
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });

  function normalizeSource(raw) {
    const lower = raw.toLowerCase();
    for (const [key, label] of Object.entries(sourceMap)) {
      if (lower.includes(key)) return label;
    }
    return 'other';
  }

  // Timeseries por fonte
  const timeMap = {};
  const bySourceMap = {};
  const pageMap = {};
  let totalReferrals = 0;
  const uniquePages = new Set();

  for (const row of res.rows ?? []) {
    const date = rowVal(row, 0);
    const rawSource = rowVal(row, 1);
    const page = rowVal(row, 2);
    const sessions = metricVal(row, 0);
    const source = normalizeSource(rawSource);

    totalReferrals += sessions;
    if (!timeMap[date]) timeMap[date] = { date };
    timeMap[date][source] = (timeMap[date][source] || 0) + sessions;
    timeMap[date].total = (timeMap[date].total || 0) + sessions;

    bySourceMap[source] = (bySourceMap[source] || 0) + sessions;

    const pageKey = `${page}|${source}`;
    if (!pageMap[pageKey]) pageMap[pageKey] = { page, source, referrals: 0 };
    pageMap[pageKey].referrals += sessions;
    uniquePages.add(page);
  }

  const timeseries = Object.values(timeMap).sort((a, b) => a.date.localeCompare(b.date));
  const bySource = Object.entries(bySourceMap)
    .map(([source, referrals]) => ({ source, referrals }))
    .sort((a, b) => b.referrals - a.referrals);

  const topPages = Object.values(pageMap)
    .sort((a, b) => b.referrals - a.referrals)
    .slice(0, 15);

  const topSource = bySource[0] ? { name: bySource[0].source } : null;

  return {
    summary: {
      totalReferrals,
      uniquePages: uniquePages.size,
      topSource
    },
    timeseries,
    bySource,
    topPages
  };
}
