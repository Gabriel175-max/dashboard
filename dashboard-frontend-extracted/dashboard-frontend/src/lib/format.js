const nfInt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const nfDec = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nfPct = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 });

export const fmt = {
  int: (v) => (v == null || Number.isNaN(+v) ? '—' : nfInt.format(+v)),
  dec: (v) => (v == null || Number.isNaN(+v) ? '—' : nfDec.format(+v)),
  pct: (v) => {
    if (v == null || Number.isNaN(+v)) return '—';
    const n = +v;
    // Accept both 0..1 and 0..100 inputs. If value > 1.5, assume it's in %.
    return nfPct.format(n > 1.5 ? n / 100 : n);
  },
  delta: (v) => {
    if (v == null || Number.isNaN(+v)) return '—';
    const n = +v;
    const sign = n > 0 ? '+' : n < 0 ? '' : '±';
    return `${sign}${nfDec.format(n)}%`;
  },
  shortDate: (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  },
  longDate: (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
};

export function isoDaysAgo(n) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export function todayIso() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
