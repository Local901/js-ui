import type { ParentElement } from "../types/Element.js";
import { Fallback } from "./Fallback.jsx";

export interface ShowProperties {
    /** When should content be shown. */
    when: () => boolean;
}

/**
 * Show children when validation is true.
 * 
 * If it is false it will extract children from the Fallback elements.
 * ```typescript
 * <Show when={() => True}>
 *   <Fallback> # Or <Show.Fallback>
 *     Shown when it is false.
 *   </Fallback>
 *   Shown when it is true.
 * </Show>
 * ```
 */
export const Show: ParentElement<ShowProperties> & { Fallback: typeof Fallback } = (props) => {
    const shouldShow = props.when();
    return (<>
        {shouldShow && props.children.filter((child) => child.type !== Show.Fallback)}
        {!shouldShow && props.children.filter((child) => child.type === Show.Fallback).map((child) => child.props.children).flat()}
    </>);
}

Show.Fallback = Fallback;
