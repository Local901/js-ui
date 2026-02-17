import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export const Header: ParentElement<DefaultProperties> = (props) => {
    return <header {...getDefaultProperties(props, "ui-header")}>
        {props.children}
    </header>
}
