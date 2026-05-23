import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface MonthInputProperties extends DefaultProperties, InputProperties<Date | undefined> {
    min?: `${number}-${number}`;
    max?: `${number}-${number}`;
}

function getMonthString(date: Date | undefined): string | undefined {
    if (!date) {
        return undefined;
    }
    return `${date.getFullYear()}-${date.getMonth()}`;
}

export const MonthInput: Element<MonthInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-month")}
        type="month"
        value={getMonthString(value)}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        min={props.min}
        max={props.max}
        onChange={(event) => {
            const date = value ?? new Date();
            const [year, month] = event.target.value.split("-");
            if (!!year) {
                date.setFullYear(Number.parseInt(year));
            }
            if (!!month) {
                date.setMonth(Number.parseInt(month));
            }
            props.input.set(date);
        }}
    />
}
