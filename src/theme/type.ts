import type * as CSS from 'csstype';

type CamelToKebab<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${CamelToKebab<U>}`
    : `${Lowercase<T>}-${CamelToKebab<U>}`
  : S;

// Mapped type using `as` clause to remap property keys to kebab-case
export type CSSProperties = {
  [K in keyof CSS.Properties as CamelToKebab<Extract<K, string>>]?: CSS.Properties[K];
};

type Properties = keyof CSSProperties;

export type CSSVariables = Record<`--${string}`, string | number>;

export type CSSRule = CSSProperties | CSSVariables;

export interface CSSStyle {
  [key: string]: CSSRule | CSSStyle;
}

export type SelectorModifier = `${string}&${string}`;

export type StyleComponent = {
  /** Base selector. */
  readonly selector: string;
  /** default selector to apply styles to. Defaults to selector. */
  readonly defaultStyle?: SelectorModifier[];
  /** Selector for the variables. Default to selector. */
  readonly variables?: SelectorModifier;
  /** Record of styles to select which CSS property should target which part of a component */
  readonly styles?: Record<SelectorModifier, {
    include?: Array<Properties | RegExp>;
    exclude?: Array<Properties | RegExp>;
  }>;
}
