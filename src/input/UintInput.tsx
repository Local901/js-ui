import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface UintInputProperties extends DefaultProperties, InputProperties<number> {
    min?: number;
    max?: number;
}

export const UintInput: Element<UintInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-number ui-input-whole-number")}
        type="number"
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        min={Math.max(0, props.min ?? 0)}
        max={(props.max)}
        onChange={(event) => props.input.set(Number.parseInt(event.target.value), "")}
    />
}
