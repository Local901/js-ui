import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type CssProperties, type DefaultProperties } from "../types/Properties.js";

export interface GridItemProperties extends DefaultProperties {
    /** The number of columns are taken up. */
    columns?: number;
    /** The number of row are taken up. */
    rows?: number;
}

export interface GridProperties extends GridItemProperties {
    /**
     * The number of columns. If null 
     *
     * @default 12
     */
    width?: number | string | null;
    /** The number of rows. Unbounded By default. */
    height?: number | string;
    /** Is the grid inline. */
    inline?: boolean
}

function getGridItemStyle(props: GridItemProperties): CssProperties {
    return {
        gridColumnEnd: props.columns ? `span ${props.columns}` : undefined,
        gridRowEnd: props.rows ? `span ${props.rows}` : undefined,
    }
}

/**
 * Generic grid item.
 * 
 * ### Class
 * - ui-grid-panel
 */
export const GridItem: ParentElement<GridItemProperties> = (props) => {
    return <div
        {...getDefaultProperties(props, "ui-grid-item")}
        style={getGridItemStyle(props)}
    >
        {props.children}
    </div>
}

/**
 * Grid element. Default number of columns is 12.
 * 
 * ### Class
 * - ui-grid
 * - ui-grid-item
 */
export const Grid: ParentElement<GridProperties> & { GridItem: typeof GridItem } = (props) => {
    const columnDef = (props.width === undefined || typeof props.width === "number")
        ? " auto".repeat(props.width ?? 12).trimStart()
        : props.width ?? undefined;
    const rowDef = typeof props.height === "number"
        ? " auto".repeat(props.height)
        : props.height;

    return <div
        {...getDefaultProperties(props, "ui-grid ui-grid-item")}
        style={{
            display: props.inline ? "inline-grid" : "grid",
            gridTemplateColumns: columnDef,
            gridTemplateRows: rowDef,
            ...getGridItemStyle(props),
        }}
    >
        {props.children}
    </div>
}

Grid.GridItem = GridItem;
