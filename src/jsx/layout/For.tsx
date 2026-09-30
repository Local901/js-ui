import type { ChildType } from "../../types/Element.js";

export interface ForProperties<T> {
    each: T[];
    children: (item: T, index: number) => ChildType;
}

export function For<T>(props: ForProperties<T>): ChildType[] {
    return props.each.map((item, index) => props.children(item, index));
}
