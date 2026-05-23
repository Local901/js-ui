import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface TextAreaInputProperties extends DefaultProperties, InputProperties<string> {
}

export const TextArea: Element<TextAreaInputProperties> = (props) => {
    const value = props.input.use();

    return <textarea
        {...getDefaultProperties(props, "ui-input-text-area")}
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.value)}
    />;
}
