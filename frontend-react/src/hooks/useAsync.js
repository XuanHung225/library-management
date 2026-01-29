import { useState, useCallback } from "react";

export function useAsync(asyncFn, deps = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError("");
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra");
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  return { loading, error, data, run };
}
