import { google } from 'googleapis';
import { readFileSync } from 'fs';

let _auth = null;

function getAuth() {
  if (_auth) return _auth;
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || './service-account.json';
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  _auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
  });
  return _auth;
}

export async function fetchSearchConsole(from, to) {
  const auth = getAuth();
  const client = await auth.getClient();
  const webmasters = google.searchconsole({ version: 'v1', auth: client });
  const siteUrl = process.env.GSC_SITE_URL;

  // Busca dados gerais por data
  const [timeRes, queriesRes, pagesRes] = await Promise.all([
    webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: from,
        endDate: to,
        dimensions: ['date'],
        rowLimit: 500
      }
    }),
    webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: from,
        endDate: to,
        dimensions: ['query'],
        rowLimit: 20
      }
    }),
    webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: from,
        endDate: to,
        dimensions: ['page'],
        rowLimit: 20
      }
    })
  ]);

  const timeseries = (timeRes.data.rows ?? []).map(row => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position
  }));

  const totalClicks = timeseries.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = timeseries.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = timeseries.length > 0
    ? timeseries.reduce((s, r) => s + r.position, 0) / timeseries.length
    : 0;

  const queries = (queriesRes.data.rows ?? []).map(row => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position
  }));

  const pages = (pagesRes.data.rows ?? []).map(row => ({
    page: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position
  }));

  return {
    summary: {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: avgCtr,
      position: avgPosition
    },
    timeseries,
    queries,
    pages
  };
}
