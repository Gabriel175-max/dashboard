import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Overview from './pages/Overview.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AIChats from './pages/AIChats.jsx';
import AIBots from './pages/AIBots.jsx';
import { defaultRange } from './components/DateRangeSelect.jsx';

const TAB_STORAGE_KEY = 'signal.activeTab';
const RANGE_STORAGE_KEY = 'signal.range';

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// Hash support so tabs are shareable via URL.
function tabFromHash() {
  const h = (typeof window !== 'undefined' && window.location.hash) || '';
  const t = h.replace(/^#\/?/, '');
  return ['overview', 'search', 'ai-chats', 'ai-bots'].includes(t) ? t : null;
}

export default function App() {
  const [tab, setTab] = useState(
    () => tabFromHash() ?? readStored(TAB_STORAGE_KEY, 'overview')
  );
  const [range, setRange] = useState(() => readStored(RANGE_STORAGE_KEY, defaultRange()));

  useEffect(() => {
    writeStored(TAB_STORAGE_KEY, tab);
    if (typeof window !== 'undefined') {
      const desired = `#/${tab}`;
      if (window.location.hash !== desired) {
        window.history.replaceState(null, '', desired);
      }
    }
  }, [tab]);

  useEffect(() => {
    writeStored(RANGE_STORAGE_KEY, range);
  }, [range]);

  useEffect(() => {
    const onHash = () => {
      const next = tabFromHash();
      if (next) setTab(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className="min-h-screen text-bone-100 relative">
      <Sidebar active={tab} onChange={setTab} />

      <main className="pl-[240px] relative z-[2]">
        <div className="max-w-[1360px] mx-auto px-10 py-10">
          {tab === 'overview' && <Overview range={range} onRangeChange={setRange} />}
          {tab === 'search' && <SearchPage range={range} onRangeChange={setRange} />}
          {tab === 'ai-chats' && <AIChats range={range} onRangeChange={setRange} />}
          {tab === 'ai-bots' && <AIBots range={range} onRangeChange={setRange} />}

          <footer className="mt-16 pt-6 border-t border-bone-600/15 flex items-center justify-between text-[11px] font-mono text-bone-500 tabular-nums">
            <div className="flex items-center gap-6">
              <span>SIGNAL · EDIÇÃO DIÁRIA</span>
              <span className="text-bone-600">·</span>
              <span>
                {new Date().toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div>
              Período · {range.from} → {range.to}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
