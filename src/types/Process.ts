/**
 * Process state flags.
 * 
 * ### States:
 * - 1 = LOADING
 * - 2 = READY
 * - 4 = ERROR
 * ### Combinations:
 * - 3 = LOADING & READY => REFETCHING
 * - 5 = LOADING & ERROR => RETRY
 */
export enum ProcessFlags {
    LOADING = 1,
    READY = 2,
    REFETCHING = 3,
    ERROR = 4,
    RETRY = 5,
}
