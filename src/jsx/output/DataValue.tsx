import type { Data } from "../../hooks/Data.js";
import type { Element } from "../../types/Element.js";

export const DataValue: Element<{ data: Data<number> | Data<string> | Data<boolean> }> = (props) => {
    const value = props.data.use();
    return (<>{value}</>)
}
