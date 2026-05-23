import type { Input } from "../hooks/Input.js";

export interface InputProperties<T> {
    input: Input<T>;
    /**
     * Disable the input element.
     *
     * @default false
     */
    disabled?: boolean;
    required?: boolean;
    name?: string;
}
