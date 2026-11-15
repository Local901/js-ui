import type { ChildType } from "../../index.jsx";
import { getDefaultProperties, type DefaultProperties } from "../../types/Properties.js";
import { BaseTable } from "./table/BaseTable.jsx";

export type CellControls = {
    /** Get current row index of the cell. */
    index(): number;
}

export function Table<T>(props: Table.Properties<T>): ChildType {
    return <BaseTable<T[], T, T, CellControls>
        {...getDefaultProperties(props)}
        select={props.select}
        getArray={() => props.from}
        getItemKey={(_item, index) => `${index}`}
        getItemData={(item) => item}
        getControls={(_item, index) => ({
            index: () => index,
        })}
        onClick={props.onClick}
    />;
}

export namespace Table {
    export type Column<T> = BaseTable.Column<T, CellControls>

    export interface Properties<T> extends DefaultProperties {
        select: Column<T>[];
        from: T[];
        onClick?: (row: T) => void;
    }
}
