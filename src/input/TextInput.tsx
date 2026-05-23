import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface TextInputProperties extends DefaultProperties, InputProperties<string> {
    pattern?: string;
    placeholder?: string;
}

export const TextInput: Element<TextInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-text")}
        type="text"
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.value)}
        pattern={props.pattern}
        placeholder={props.placeholder}
    />
}
