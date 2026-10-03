import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Charge des données asynchrones et expose { data, loading, error, retry, setData }.
// `deps` (valeurs simples) relance le chargement : changement de période, de filtre…
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${JSON.stringify(deps)}#${attempt}`;
  const [state, setState] = useState<AsyncState<T> & { requestKey: string }>({
    data: null,
    loading: true,
    error: null,
    requestKey,
  });

  // Nouvelle requête : on passe en chargement pendant le rendu (en gardant les anciennes données)
  if (state.requestKey !== requestKey) {
    setState((s) => ({ ...s, loading: true, error: null, requestKey }));
  }

  // Toujours la dernière version de `load`, sans en faire une dépendance de l'effet
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null, requestKey });
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
            requestKey,
          }));
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  // Mise à jour locale sans recharger (ex : après un changement de statut)
  const setData = useCallback(
    (updater: (data: T | null) => T | null) => setState((s) => ({ ...s, data: updater(s.data) })),
    []
  );

  return { data: state.data, loading: state.loading, error: state.error, retry, setData };
}
