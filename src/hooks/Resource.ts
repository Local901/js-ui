import { ProcessFlags } from "../types/Process.js";
import { useSignal } from "./Signal.js";

export type ResourceCallback<T> = (refetching: boolean) => T | Promise<T>;
export type ResourceValue<T> = {
    state: ProcessFlags;
    latest?: T;
    error?: unknown;
}
export type ResourceControls<T> = {
    refetch: () => void;
    mutate: (value: T) => void;
}

export function useResource<T>(callback: ResourceCallback<T>): [ResourceValue<T>, ResourceControls<T>] {
    const [value, setValue] = useSignal<ResourceValue<T>>({
        state: ProcessFlags.LOADING,
    });

    const loadResource = async (refetching: boolean) => {
        try {
            const result = await callback(refetching);
            setValue({
                state: ProcessFlags.READY,
                latest: result,
            })
        } catch (error) {
            setValue({
                state: ProcessFlags.ERROR,
                error,
            });
        }
    }

    if (value.state === ProcessFlags.LOADING) {
        void loadResource(false);
    }

    return [value, {
        refetch: () => {
            setValue((prev) => ({ ...prev, state: prev.state | ProcessFlags.LOADING }));
            void loadResource(true);
        },
        mutate: (value) => {
            setValue({
                state: ProcessFlags.READY,
                latest: value,
            });
        },
    }];
}
