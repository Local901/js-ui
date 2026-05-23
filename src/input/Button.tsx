import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface ButtonProperties extends DefaultProperties {
    disabled?: boolean;
    onClick?: () => void;
}

export const Button: ParentElement<ButtonProperties> = (props) => {
    return <button
        {...getDefaultProperties(props, "ui-button")}
        disabled={props.disabled}
        onClick={props.onClick ? () => props.onClick?.() : undefined}
    >
        {props.children}
    </button>
}
