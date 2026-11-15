import type { ArrayData, ArrayDataItem, DataNode } from "../../hooks/Data.js";
import type { ChildType } from "../../index.jsx";
import { getDefaultProperties, type DefaultProperties } from "../../types/Properties.js";
import { BaseTable } from "./table/BaseTable.jsx";

export type CellControls = {
    /** Get current row index of the cell. */
    index(): number;
    /** Remove the current row. */
    remove(): void;
    /** Move the current row to a new index. */
    move(index: number): void;
}

export function DataTable<T>(props: DataTable.Properties<T>): ChildType {
    return <BaseTable<ArrayDataItem<T>[], ArrayDataItem<T>, DataNode<T>, CellControls>
        {...getDefaultProperties(props, "ui-data-table")}
        select={props.select}
        getArray={() => props.from.useItems()}
        getItemKey={(item) => item.key}
        getItemData={(item) => item.data}
        getControls={(item) => ({
            index: item.index,
            remove: () => props.from.remove(item.key),
            move: (index) => props.from.move(item.key, index),
        })}
        onClick={props.onClick}
    />;
}

export namespace DataTable {
    export type Column<T> = BaseTable.Column<DataNode<T>, CellControls>;

    export interface Properties<T> extends DefaultProperties {
        select: Column<T>[];
        from: ArrayData<T[]>;
        onClick?: (row: ArrayDataItem<T>) => void;
    }
}
