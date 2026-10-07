import { useState, useEffect } from 'react';
import { fetchTasks } from '../api';

export function useTasks(query, status, page, pageSize) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Abort the previous request when inputs change, so a slow older
    // response can never overwrite the results of a newer one.
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchTasks({ query, status, page, pageSize, signal: controller.signal })
      .then((data) => {
        setTasks(data.items ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setTasks([]);
        setTotal(0);
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query, status, page, pageSize]);

  return { tasks, total, loading, error };
}
