import { useRef } from "react";
import { useEffect } from "./Effect.js";

export type EventArgs = unknown[];

/** Event subscriber. */
export interface Subscribable<ARGS extends EventArgs> {
    subscribe(handler: (...args: ARGS) => unknown): void;
}

/** Event publisher. */
export interface Publisher<ARGS extends EventArgs> {
    publish(...args: ARGS): void;
}

/** Event controller. */
export interface Event<ARGS extends EventArgs> extends Subscribable<ARGS>, Publisher<ARGS> {

}

/** Event controller implementation. */
export class EventController<ARGS extends EventArgs> implements Event<ARGS> {
    private readonly handlers: Array<(...args: ARGS) => unknown> = [];

    public subscribe(handler: (...args: ARGS) => unknown): void {
        useEffect(() => {
            this.handlers.push(handler);

            return () => this.handlers.splice(this.handlers.indexOf(handler), 1);
        }, [handler]);
    }

    public publish(...args: ARGS): void {
        for (const handler of this.handlers) {
            if (!handler) {
                continue;
            }
            void handler(...args);
        }
    }
}

/**
 * Get event controller. To distribute events.
 *
 * @returns Event controller.
 */
export function useEvent<ARGS extends EventArgs>(): Event<ARGS> {
    const controller = useRef(new EventController<ARGS>());
    return controller.current;
}
