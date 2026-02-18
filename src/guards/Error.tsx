import type { ParentElement } from "../types/Element.js";
import { ProcessFlags } from "../types/Process.js";
import { Fallback } from "./Fallback.jsx";
import { Show } from "./Show.jsx";

/**
 * Guard internal elements until state is an error. Else `<Error.Fallback>`
 */
export const Error: ParentElement<{ state: ProcessFlags }> & { Fallback: typeof Fallback } = (props) => {
    return Show({ ...props, when: () => (props.state & ProcessFlags.ERROR) === ProcessFlags.ERROR });
}

Error.Fallback = Fallback;
