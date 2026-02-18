import type { ParentElement } from "../types/Element.js";
import { ProcessFlags } from "../types/Process.js";
import { Fallback } from "./Fallback.jsx";
import { Show } from "./Show.jsx";

/**
 * Guard internal elements until state is loading. Else `<Loading.Fallback>`
 */
export const Loading: ParentElement<{ state: ProcessFlags }> & { Fallback: typeof Fallback } = (props) => {
    return Show({ ...props, when: () => (props.state & ProcessFlags.LOADING) === ProcessFlags.LOADING });
}

Loading.Fallback = Fallback;
