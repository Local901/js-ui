
export interface DefaultProperties {
    id?: string;
    class?: string;
}

export function getDefaultProperties(props: DefaultProperties, extraClass?: string): {
    id?: string,
    className?: string,
} {
    return {
        id: props.id,
        className: [extraClass, props.class].filter(Boolean).join(" "),
    };
}
