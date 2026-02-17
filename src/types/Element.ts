import type { JSX } from "react";

export type Properties = Omit<{}, "children">;

export type Element<PROPS extends Properties = {}> = (
    props: PROPS
) => JSX.Element;
export type ParentElement<PROPS extends Properties = {}> = (
    props: PROPS & { children: JSX.Element[] }
) => JSX.Element;
export type FactoryElement<PROPS extends Properties = {}, ARGS extends unknown[] = []> = (
    props: PROPS & { children: (...args: ARGS) => JSX.Element }
) => JSX.Element;
