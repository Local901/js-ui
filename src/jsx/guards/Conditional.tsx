import { type Data } from "../../hooks/Data.js";
import type { ChildFactory, ChildType } from "../../types/Element.js";

interface BaseConditionalProperties<T, R extends T> {
    data: Data<T>;
    children: ChildFactory<[result: Data<R>], ChildType>;
}
interface ConditionalProperties<T, R extends T> extends BaseConditionalProperties<T, R> {
    when(value: T): value is R;
}

export function Conditional<T, R extends T>(props: ConditionalProperties<T, R>): ChildType {
    // Only trigger a rerender when the condition changes.
    const value = props.data.use((newValue, oldValue) => props.when(newValue) !== props.when(oldValue));

    if (props.when(value)) {
        return props.children(props.data as unknown as Data<R>);
    }
    return null;
};

export namespace Conditional {
    export function Defined<T>(props: BaseConditionalProperties<T, NonNullable<T>>): ChildType {
        return <Conditional
            data={props.data}
            when={(value): value is NonNullable<T> => value !== null && value !== undefined}
        >
            {props.children}
        </Conditional>
    }
    export function Optional<T>(props: BaseConditionalProperties<T, Exclude<T, undefined>>): ChildType {
        return <Conditional
            data={props.data}
            when={(value): value is Exclude<T, undefined> => value !== undefined}
        >
            {props.children}
        </Conditional>
    }
    export function Nullable<T>(props: BaseConditionalProperties<T, Exclude<T, null>>): ChildType {
        return <Conditional
            data={props.data}
            when={(value): value is Exclude<T, null> => value !== null} 
        >
            {props.children}
        </Conditional>
    }
}
