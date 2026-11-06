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
    />

    // return <table
    //     {...getDefaultProperties(props, "ui-table")}
    // >
    //     <thead>
    //         <tr>
    //             <For each={props.select}>
    //                 {(column) => <th key={column.key}>
    //                     {typeof column.header === "function" ? column.header() : column.header}
    //                 </th>}
    //             </For>
    //         </tr>
    //     </thead>
    //     <tbody>
    //         <For each={array}>
    //             {(row) => <tr
    //                 key={row.key}
    //                 className={props.onClick ? "clickable" : undefined}
    //                 onClick={() => props.onClick?.(row as ArrayDataItem<T>)}
    //             >
    //                 <For each={props.select}>
    //                     {(column) => <td key={column.key}>
    //                         {column.cell(row.data as DataNode<T>, {
    //                             index: row.index,
    //                             remove: () => props.from.remove(row.key),
    //                             move: (index) => props.from.move(row.key, index),
    //                         })}
    //                     </td>}
    //                 </For>
    //             </tr>}
    //         </For>
    //     </tbody>
    // </table>
}

export namespace DataTable {
    export type Column<T> = BaseTable.Column<DataNode<T>, CellControls>;

    export interface Properties<T> extends DefaultProperties {
        select: Column<T>[];
        from: ArrayData<T[]>;
        onClick?: (row: ArrayDataItem<T>) => void;
    }
}
