import type { ParentElement } from "../types/Element.js";

/**
 * The `Fallback` element does not display any child elements.
 *
 * The children are only show if extracted by parent element like `Show`.
 */
export const Fallback: ParentElement = (props) => {
    return <></>;
}
