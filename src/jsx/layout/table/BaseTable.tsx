import type { ChildType } from "../../../types/Element.js";
import { getDefaultProperties, type DefaultProperties,  } from "../../../types/Properties.js";
import { For } from "../For.jsx";

export function BaseTable<ARRAY extends ITEM[], ITEM, TYPE, CONTROLS extends BaseTable.Controls>(
    props: BaseTable.Properties<ARRAY, ITEM, TYPE, CONTROLS>
): ChildType {
    const array = props.getArray();

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
                {(row, index) => <tr
                    key={props.getItemKey(row, index)}
                    className={props.onClick ? "clickable" : undefined}
                    onClick={() => props.onClick?.(row)}
                >
                    <For each={props.select}>
                        {(column) => <td key={column.key}>
                            {column.cell(props.getItemData(row), props.getControls(row, index))}
                        </td>}
                    </For>
                </tr>}
            </For>
        </tbody>
    </table>
}

export namespace BaseTable {
    export interface Controls {
        /** Get current row index of the cell. */
        index(): number;
    }

    export interface Column<T, CONTROLS extends Controls> {
        key: string;
        header: string | (() => ChildType);
        cell: (data: T, controls: CONTROLS) => ChildType;
    }

    export interface Properties<ARRAY extends ITEM[], ITEM, TYPE, CONTROLS extends Controls> extends DefaultProperties {
        select: Column<TYPE, CONTROLS>[];
        onClick?: (row: ITEM) => void;
        getArray: () => ARRAY;
        getItemKey: (item: ITEM, index: number) => string;
        getItemData: (item: ITEM) => TYPE;
        getControls: (item: ITEM, index: number) => CONTROLS;
    }
}
