import { Direction } from "../types/Direction.js";
import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";

export interface StackProperties extends DefaultProperties {
    /**
     * The direction the elements should be laid out.
     *
     * @default Direction.Vertical
     */
    direction?: Direction;
}

/**
 * A layout component for stacking elements.
 *
 * ### classes
 * * `ui-stack`
 * * `direction-row` | `direction-column` | `direction-row-reverse` | `direction-column-reverse`
 *
 * ### element style:
 * ```css
 * Stack {
 *   display: flex;
 *   flex-direction: row | column | row-reverse | column-reverse;
 * }
 * ```
 *
 * @param props.direction The direction the stack should order the elements.
 */
export const Stack: ParentElement<StackProperties> = (props) => {
    return (
        <div
            {...getDefaultProperties(
                props,
                `ui-stack direction-${props.direction ?? Direction.Column}`,
            )}
            style={{
                display: "flex",
                flexDirection: props.direction ?? Direction.Column,
            }}
        >
            { props.children }
        </div>
    )
}
