import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface RangeInputProperties extends DefaultProperties, InputProperties<number> {
    min?: number;
    max?: number;
}

export const RangeInput: Element<RangeInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-range")}
        type="range"
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        min={Math.max(0, props.min ?? 0)}
        max={(props.max)}
        onChange={(event) => props.input.set(Number.parseInt(event.target.value), "")}
    />
}
