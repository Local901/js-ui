import type { ParentElement } from "../types/Element.js";
import { ProcessFlag } from "../types/Process.js";
import { Fallback } from "./Fallback.jsx";
import { Show } from "./Show.jsx";

/**
 * Guard internal elements until state is loading. Else `<Loading.Fallback>`
 */
export const WhenLoading: ParentElement<{ state: ProcessFlag }> & { Fallback: typeof Fallback } = (props) => {
    return Show({ children: props.children, when: () => (props.state & ProcessFlag.LOADING) === ProcessFlag.LOADING });
}

WhenLoading.Fallback = Fallback;
