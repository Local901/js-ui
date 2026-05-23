import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface ColorInputProperties extends DefaultProperties, InputProperties<string> {
    alpha?: boolean;
    /** https://developer.mozilla.org/en-US/docs/Glossary/Color_space */
    colorSpace?: string;
}

export const ColorInput: Element<ColorInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-color")}
        type="color"
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.value)}
        // @ts-expect-error Experimental property
        alpha={props.alpha}
        colorspace={props.colorSpace}
    />
}
