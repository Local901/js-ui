import type { ArrayData, ArrayDataItem, DataNode } from "../../hooks/Data.js";
import type { ChildType } from "../../index.jsx";
import { getDefaultProperties, type DefaultProperties } from "../../types/Properties.js";
import { For } from "./For.jsx";

export type CellControls = {
    /** Get current row index of the cell. */
    index(): number;
    /** Remove the current row. */
    remove(): void;
    /** Move the current row to a new index. */
    move(index: number): void;
}

export interface ColumnDefinition<T> {
    key: string;
    header: string | (() => ChildType);
    cell: (data: DataNode<T>, controls: CellControls) => ChildType;
}

export interface TableProperties<T> extends DefaultProperties {
    select: ColumnDefinition<T>[];
    from: ArrayData<T>;
    onClick?: (row: ArrayDataItem<T>) => void;
}

export function Table<T>(props: TableProperties<T>): ChildType {
    const array = props.from.useItems();

    return <table
        {...getDefaultProperties(props, "ui-table")}
    >
        <thead>
            <tr>
                <For each={props.select}>
                    {(column) => <th key={column.key}>
                        {typeof column.header === "function" ? column.header() : column.header}
                    </th>}
                </For>
            </tr>
        </thead>
        <tbody>
            <For each={array}>
                {(row) => <tr
                    key={row.key}
                    className={props.onClick ? "clickable" : undefined}
                    onClick={() => props.onClick?.(row as ArrayDataItem<T>)}
                >
                    <For each={props.select}>
                        {(column) => <td key={column.key}>
                            {column.cell(row.data as DataNode<T>, {
                                index: row.index,
                                remove: () => props.from.remove(row.key),
                                move: (index) => props.from.move(row.key, index),
                            })}
                        </td>}
                    </For>
                </tr>}
            </For>
        </tbody>
    </table>
}
