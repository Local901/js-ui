import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface EmailInputProperties extends DefaultProperties, InputProperties<string> {
    min?: number;
    max?: number;
    pattern?: string;
    placeholder?: string;
}

export const EmailInput: Element<EmailInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-email")}
        type="email"
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.value)}
        minLength={props.min}
        maxLength={props.max}
        pattern={props.pattern}
        placeholder={props.placeholder}
    />
}
