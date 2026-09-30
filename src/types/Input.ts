import type { Data } from "../hooks/Data.js";

export interface InputProperties<T> {
    input: Data<T>;
    /**
     * Disable the input element.
     *
     * @default false
     */
    disabled?: boolean;
    required?: boolean;
    name?: string;
}
