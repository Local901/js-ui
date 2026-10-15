import { type Data } from "../../hooks/Data.js";
import type { ChildFactory, ChildType } from "../../types/Element.js";

interface BaseShowDataProperties<T, R extends T> {
    data: Data<T>;
    children: ChildFactory<[result: Data<R>], ChildType>;
    fallback?: ChildFactory<[result: Data<T>], ChildType>;
}
interface ShowDataProperties<T, R extends T> extends BaseShowDataProperties<T, R> {
    when(value: T): value is R;
}

export function ShowData<T, R extends T>(props: ShowDataProperties<T, R>): ChildType {
    // Only trigger a rerender when the condition changes.
    const value = props.data.use((newValue, oldValue) => props.when(newValue) !== props.when(oldValue));

    if (props.when(value)) {
        return props.children(props.data as unknown as Data<R>);
    }
    if (props.fallback) {
        return props.fallback(props.data);
    }
    return null;
};

export namespace ShowData {
    export function Defined<T>(props: BaseShowDataProperties<T, NonNullable<T>>): ChildType {
        return <ShowData
            data={props.data}
            when={(value): value is NonNullable<T> => value !== null && value !== undefined}
            fallback={props.fallback}
        >
            {props.children}
        </ShowData>
    }
    export function Optional<T>(props: BaseShowDataProperties<T, Exclude<T, undefined>>): ChildType {
        return <ShowData
            data={props.data}
            when={(value): value is Exclude<T, undefined> => value !== undefined}
            fallback={props.fallback}
        >
            {props.children}
        </ShowData>
    }
    export function Nullable<T>(props: BaseShowDataProperties<T, Exclude<T, null>>): ChildType {
        return <ShowData
            data={props.data}
            when={(value): value is Exclude<T, null> => value !== null}
            fallback={props.fallback}
        >
            {props.children}
        </ShowData>
    }
}
