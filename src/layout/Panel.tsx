import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

/**
 * Relative div.
 * 
 * ### Class
 * - ui-panel
 */
export const Panel: ParentElement<DefaultProperties> = (props) => {
    return <div {...getDefaultProperties(props, "ui-panel")} style={{ position: "relative" }}>
        {props.children}
    </div>
}
