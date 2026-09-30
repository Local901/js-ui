import type { Element } from "../../types/Element.js";
import type { InputProperties } from "../../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../../types/Properties.js";

export interface CheckBoxInputProperties extends DefaultProperties, InputProperties<boolean> {
    value?: string;
    switch?: boolean;
}

export const CheckBox: Element<CheckBoxInputProperties> = (props) => {
    const state = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input ui-input-checkbox")}
        type="checkbox"
        checked={state}
        value={props.value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.checked)}
    />
}
