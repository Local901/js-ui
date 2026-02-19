import type { CSSProperties } from "react";

export interface DefaultProperties {
    id?: string;
    className?: string;
}

export function getDefaultProperties(props: DefaultProperties, extraClass?: string): DefaultProperties {
    return {
        id: props.id,
        className: extraClass
            ? [extraClass, props.className].filter(Boolean).join(" ")
            : props.className,
    };
}

export type CssProperties = CSSProperties;
