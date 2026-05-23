import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface DateInputProperties extends DefaultProperties, InputProperties<Date | undefined> {
    min?: `${number}-${number}-${number}`;
    max?: `${number}-${number}-${number}`;
}

function getDateString(date: Date | undefined): string | undefined {
    if (!date) {
        return undefined;
    }
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export const DateInput: Element<DateInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-date")}
        type="date"
        value={getDateString(value)}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        min={props.min}
        max={props.max}
        onChange={(event) => {
            const date = value ?? new Date();
            const [year, month, day] = event.target.value.split("-");
            if (!!year) {
                date.setFullYear(Number.parseInt(year));
            }
            if (!!month) {
                date.setMonth(Number.parseInt(month));
            }
            if (!!day) {
                date.setDate(Number.parseInt(day));
            }
            props.input.set(date);
        }}
    />
}
