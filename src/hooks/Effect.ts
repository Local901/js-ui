import { useEffect as uEffect } from "react";

export type EffectCallback = () => void | (() => void) | Promise<void | (() => void)>;

export function useEffect(callback: EffectCallback, deps?: unknown[]): void {
    return uEffect(() => {
        const response = callback();

        let destructor: void | (() => void);
        if (response instanceof Promise) {
            response.then((r) => destructor = r);
        } else {
            destructor = response;
        }
        return () => {
            destructor?.();
        }
    }, deps);
}
