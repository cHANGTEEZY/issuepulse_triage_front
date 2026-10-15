"use client";

import { useCallback, useEffect, useRef } from "react";

type DeferredOptions = {
  debounceMs?: number;
  throttleMs?: number;
};

export function useDeferredCallback<T>(
  callback: (value: T) => void,
  { debounceMs = 0, throttleMs = 0 }: DeferredOptions = {},
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const debounceTimer = useRef<number>(undefined);
  const throttleTimer = useRef<number>(undefined);
  const lastRan = useRef(0);

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceTimer.current);
      window.clearTimeout(throttleTimer.current);
    };
  }, []);

  return useCallback(
    (value: T) => {
      const invoke = () => {
        lastRan.current = Date.now();
        callbackRef.current(value);
      };

      if (throttleMs > 0) {
        const remaining = throttleMs - (Date.now() - lastRan.current);
        if (remaining <= 0) {
          invoke();
        } else if (debounceMs <= 0) {
          window.clearTimeout(throttleTimer.current);
          throttleTimer.current = window.setTimeout(invoke, remaining);
        }
      }

      if (debounceMs > 0) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = window.setTimeout(invoke, debounceMs);
        return;
      }

      if (throttleMs <= 0) invoke();
    },
    [debounceMs, throttleMs],
  );
}
