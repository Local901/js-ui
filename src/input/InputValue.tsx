import type { Input } from "../hooks/Input.js";
import type { Element } from "../types/Element.js";

export const InputValue: Element<{ input: Input<number> | Input<string> | Input<boolean> }> = (props) => {
    const value = props.input.use();
    return (<>{value}</>)
}
