import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export const Footer: ParentElement<DefaultProperties> = (props) => {
    return <footer {...getDefaultProperties(props, "ui-footer")}>
        {props.children}
    </footer>
}
