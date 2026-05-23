import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface TextInputProperties extends DefaultProperties, InputProperties<File | undefined> {
    accept?: string;
}

export const TextInput: Element<TextInputProperties> = (props) => {
    return <input
        {...getDefaultProperties(props, "ui-input-text")}
        type="text"
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => props.input.set(event.target.files?.item(0) ?? undefined)}
        accept={props.accept}
    />
}
