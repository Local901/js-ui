import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface PasswordInputProperties extends DefaultProperties, InputProperties<string> {
    min?: number;
    max?: number;
    pattern?: string;
}

export const PasswordInput: Element<PasswordInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-password")}
        type="password"
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.value)}
        minLength={props.min}
        maxLength={props.max}
        pattern={props.pattern}
    />
}
