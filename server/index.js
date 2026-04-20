import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fetchOverview, fetchAiReferrals } from './lib/ga4.js';
import { fetchSearchConsole } from './lib/gsc.js';

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.DASHBOARD_TOKEN || '';

app.use(cors());
app.use(express.json());

// Autenticação por token
app.use((req, res, next) => {
  if (!TOKEN) return next();
  const t = req.headers['x-dashboard-token'];
  if (t !== TOKEN) return res.status(401).json({ error: 'Token inválido' });
  next();
});

function dateRange(req) {
  const today = new Date().toISOString().slice(0, 10);
  const ago30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  return {
    from: req.query.from || ago30,
    to: req.query.to || today
  };
}

// GET /api/overview — sessões + indicações de IA + GSC cliques
app.get('/api/overview', async (req, res) => {
  try {
    const { from, to } = dateRange(req);
    const [ga, gsc] = await Promise.all([
      fetchOverview(from, to),
      fetchSearchConsole(from, to).catch(() => null)
    ]);

    // Mescla cliques do GSC no timeseries
    if (gsc) {
      const gscByDate = Object.fromEntries(gsc.timeseries.map(r => [r.date, r.clicks]));
      ga.timeseries = ga.timeseries.map(r => ({
        ...r,
        searchClicks: gscByDate[r.date] || 0
      }));
      ga.kpis.searchClicks = { value: gsc.summary.clicks, delta: null };
    }

    res.json(ga);
  } catch (err) {
    console.error('[/api/overview]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search-console — dados do Search Console
app.get('/api/search-console', async (req, res) => {
  try {
    const { from, to } = dateRange(req);
    const data = await fetchSearchConsole(from, to);
    res.json(data);
  } catch (err) {
    console.error('[/api/search-console]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai-referrals — indicações de chatbots
app.get('/api/ai-referrals', async (req, res) => {
  try {
    const { from, to } = dateRange(req);
    const data = await fetchAiReferrals(from, to);
    res.json(data);
  } catch (err) {
    console.error('[/api/ai-referrals]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai-bots — crawlers (GA4 filtra bots por padrão, retorna vazio)
app.get('/api/ai-bots', async (req, res) => {
  res.json({
    summary: { totalHits: 0, uniqueBots: 0, topBot: null },
    timeseries: [],
    byBot: [],
    topPaths: []
  });
});

app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
