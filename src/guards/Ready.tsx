import type { ParentElement } from "../types/Element.js";
import { ProcessFlags } from "../types/Process.js";
import { Fallback } from "./Fallback.jsx";
import { Show } from "./Show.jsx";

/**
 * Guard internal elements until state is ready. Else `<Ready.Fallback>`
 */
export const Ready: ParentElement<{ state: ProcessFlags }> & { Fallback: typeof Fallback } = (props) => {
    return Show({ ...props, when: () => (props.state & ProcessFlags.READY) === ProcessFlags.READY });
}

Ready.Fallback = Fallback;
