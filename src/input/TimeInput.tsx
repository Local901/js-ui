import type { Element } from "../types/Element.js";
import type { InputProperties } from "../types/Input.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface TimeInputProperties extends DefaultProperties, InputProperties<Date | undefined> {
    seconds?: boolean;
}

function getTimeString(date: Date | undefined, seconds = false): string | undefined {
    if (!date) {
        return undefined;
    }
    const time = [date.getHours(), date.getMinutes()];
    if (seconds) {
        time.push(date.getSeconds());
    }
    return time.map((num) => `${num}`).join(":");
}

export const TimeInput: Element<TimeInputProperties> = (props) => {
    const value = props.input.use();

    return <input
        {...getDefaultProperties(props, "ui-input-time")}
        type="time"
        value={getTimeString(value, props.seconds)}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        onChange={(event) => {
            const date = value ?? new Date();
            const [hours, minutes, seconds] = event.target.value.split(":").map((num) => Number.parseInt(num));
            if (!!hours) {
                date.setHours(hours);
            }
            if (!!minutes) {
                date.setMinutes(minutes);
            }
            if (!!seconds) {
                date.setSeconds(seconds);
            }
            props.input.set(date);
        }}
    />
}
