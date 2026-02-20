import type { ParentElement } from "../types/Element.js";
import { splitChildrenOfType } from "../utility/SearchChildren.js";
import { Fallback } from "./Fallback.jsx";
import { Show } from "./Show.jsx";

export interface CaseProperties {
    when: () => boolean;
}

/**
 * A Case for a Switch. Can contain a Fallback element for when the case did not match or was not the first to match.
 */
export const Case: ParentElement<CaseProperties> & { Fallback: typeof Fallback } = () => {
    return <></>;
}

Case.Fallback = Fallback;

/**
 * A Switch element. It will show only the first Case element that has a positive when result.
 * In the case no Case's match all the Fallback element will be rendered.
 * Other Element are allowed to be between the Case and Fallback elements.
 * 
 * ```typescript
 * <Switch>
 *   <Fallback>
 *     No Case matched.
 *   </Fallback>
 *   <hr/>
 *   <Case when={() => someCheck()}>
 *      <Fallback>
 *        The case did not match.
 *      </FallBack>
 *      Case 1 matched.
 *   </Case>
 *   <Case when={() => someOtherCheck()}>
 *     Case 2 matched.
 *   </Case>
 *   <Fallback>
 *     No Case matched. So here is another value and location.
 *   </Fallback>
 * </Switch>
 * ```
 */
export const Switch: ParentElement & {
    Case: typeof Case,
    Fallback: typeof Fallback,
} = (props) => {
    let foundCase = false;
    return <>
        {props.children?.map((child) => {
            if (child.type === Switch.Fallback) {
                return () => Show({ when: () => !foundCase, children: child.props.children });
            } else if (child.type === Switch.Case) {
                const match = foundCase
                    ? false
                    : (() => {
                        foundCase = child.props.when();
                        return foundCase;
                    })();
                const [fallback, rest] = splitChildrenOfType(child.props.children, Case.Fallback);
                return () => match ? rest : fallback.map((c) => c.props.children);
            }
            return child;
        })}
    </>
}

Switch.Case = Case;
Switch.Fallback = Fallback;
