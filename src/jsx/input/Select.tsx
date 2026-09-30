import { For } from "../layout/For.jsx";
import type { ChildType, Element } from "../../types/Element.js";
import type { InputProperties } from "../../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../../types/Properties.js";

export interface SelectInputProperties extends DefaultProperties, InputProperties<string> {
    children?: ((value: string) => ChildType);
    values: string[];
}

export const Select: Element<SelectInputProperties> = (props) => {
    const value = props.input.use();

    return <select
        {...getDefaultProperties(props, "ui-input ui-input-select")}
        value={value}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.value)} // TODO: multiple -> target.selectedOptions.map((o) => o.value)
    >
        <For each={props.values}>
            {(v, i) => <option // TODO: create option groups
                    key={i}
                    value={v}
                >
                    {props.children?.(v) ?? v}
                </option>
            }
        </For>
    </select>;
}
