import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';

export function useApi(path, params) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = JSON.stringify(params || {});
  const lastKey = useRef(null);

  useEffect(() => {
    let cancelled = false;
    lastKey.current = key;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, params)
      .then((data) => {
        if (cancelled || lastKey.current !== key) return;
        setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled || lastKey.current !== key) return;
        setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);

  return state;
}
