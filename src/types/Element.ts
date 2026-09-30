import type { ReactNode, JSX } from "react";

export type Properties = Omit<{}, "children">;

export type ChildType = ReactNode;
export type ChildFactory<ARGS extends unknown[] = [], CHILDREN extends ChildType = ChildType> = (...args: ARGS) => CHILDREN;

export type Element<PROPS extends Properties = {}> = (
    props: PROPS
) => JSX.Element;

export type ParentElement<
    PROPS extends Properties = {},
    CHILDREN extends ChildType | ChildFactory | undefined = ChildType
> = (
    props: PROPS & { children?: CHILDREN }
) => JSX.Element;

export type FactoryElement<
    PROPS extends Properties = {},
    ARGS extends unknown[] = [],
    CHILDREN extends ChildType = ChildType
> = (
    props: PROPS & { children: ChildFactory<ARGS, CHILDREN> }
) => JSX.Element;
