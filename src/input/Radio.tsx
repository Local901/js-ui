import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface RadioInputProperties extends DefaultProperties, InputProperties<boolean> {
    name: string;
    value: string;
}

export const Radio: Element<RadioInputProperties> = (props) => {
    const state = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-checkbox")}
        type="radio"
        checked={state}
        value={props.value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.checked)}
    />
}
