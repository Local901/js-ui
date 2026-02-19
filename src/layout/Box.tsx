import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

/**
 * Relative inline element.
 * 
 * ### Class
 * - ui-box
 */
export const Box: ParentElement<DefaultProperties> = (props) => {
    return <span {...getDefaultProperties(props, "ui-box")} style={{ position: "relative" }}>
        {props.children}
    </span>
}
