import type { CSSStyle, CSSRule, SelectorModifier, StyleComponent } from "./type.js";

/**
 * 
 * @param component Component style controller.
 * @param style Style for the component.
 * @param selectionModifier Additional style selectors. e.g.: `"&.primary:hover"`
 * @returns 
 */
export function createStyle(
    componentOrSelector: StyleComponent | string,
    style: CSSRule,
    selectionModifier?: SelectorModifier,
): CSSStyle {
    const component = typeof componentOrSelector === "string"
        ? { selector: componentOrSelector }
        : componentOrSelector;
    const selector = selectionModifier
        ? selectionModifier.replaceAll("&", component.selector)
        : component.selector;

    const properties: CSSRule = {};
    const variables: CSSRule = {};

    for (const [key, value] of Object.entries(style)) {
        // @ts-expect-error key type.
        (key.startsWith("--") ? variables : properties)[key] = value;
    }

    const result: Record<string, CSSRule> = Object.fromEntries(
        (component.defaultStyle ?? ["&"]).map((selector) => [selector, {
            ...style,
            ...((!component.variables || component.variables === selector) ? variables : {}),
        }]),
    );
    
    if (!component.styles) {
        return Object.fromEntries(
            Object.entries(
                result
            ).map(([sel, selStyle]) => [
                sel.replaceAll("&", selector),
                selStyle,
            ]),
        );
    }

    for (const [modifier, control] of Object.entries(component.styles)) {
        for(const includeProp of control.include ?? []) {
            if (typeof includeProp === "string") {
                // @ts-expect-error key type.
                if (style[includeProp]) {
                    // @ts-expect-error key type.
                    (result[modifier] ?? {})[includeProp] = style[includeProp]
                }
                continue;
            }
            result[modifier] = {
                ...result[modifier],
                ...(Object.fromEntries(Object.entries(style).filter(([key]) => includeProp.test(key))))
            }
        }
        if (!result[modifier]) {
            continue;
        }
        for (const excludeProp of control.exclude ?? []) {
            if (typeof excludeProp === "string") {
                // @ts-expect-error key type.
                if (result[modifier]?.[excludeProp]) {
                    // @ts-expect-error key type.
                    delete result[modifier][excludeProp];
                }
                continue;
            }
            result[modifier] = Object.fromEntries(Object.entries(style).filter(([key]) => !excludeProp.test(key)));
        }
    }

    return Object.fromEntries(
        Object.entries(
            result
        ).map(([sel, selStyle]) => [
            sel.replaceAll("&", selector),
            selStyle,
        ]),
    );
}

function stringifyCSSStyleProperties(style: CSSRule | CSSStyle): string {
    return Object.entries(style)
        .filter(([, value]) => value !== undefined)
        .map(([property, value]) => typeof value === "object" ? `${property} {${stringifyCSSStyleProperties(value)}}` : `${property}: ${value};`)
        .join("");
}

export function CSS(...styles: CSSStyle[]): string {
    return styles.map((s) => Object.entries(s))
        .flat()
        .map(([selector, style]) => {
            return `${selector} {${stringifyCSSStyleProperties(style)}}`
        }).join(" ");
}
