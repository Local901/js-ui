import { useCallback as rUseCallback } from "react";

export function useCallback<ARGS extends unknown[]>(callback: (...args: ARGS) => void, deps: unknown[] = []): (...args: ARGS) => void {
    return rUseCallback(callback, deps);
}
