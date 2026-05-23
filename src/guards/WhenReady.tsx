import type { ParentElement } from "../types/Element.js";
import { ProcessFlag } from "../types/Process.js";
import { Fallback } from "./Fallback.jsx";
import { Show } from "./Show.jsx";

/**
 * Guard internal elements until state is ready. Else `<Ready.Fallback>`
 */
export const WhenReady: ParentElement<{ state: ProcessFlag }> & { Fallback: typeof Fallback } = (props) => {
    return Show({ children: props.children, when: () => (props.state & ProcessFlag.READY) === ProcessFlag.READY });
}

WhenReady.Fallback = Fallback;
