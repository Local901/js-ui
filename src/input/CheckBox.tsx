import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface UintInputProperties extends DefaultProperties, InputProperties<boolean> {
    value?: string;
    switch?: boolean;
}

export const CheckBox: Element<UintInputProperties> = (props) => {
    const state = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-checkbox")}
        type="checkbox"
        checked={state}
        value={props.value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.checked)}
    />
}
