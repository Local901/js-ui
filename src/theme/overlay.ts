import type { StyleComponent } from "./type.js";

export const DialogStyle = ".ui-dialog";
export const DrawerStyle: StyleComponent = {
    selector: ".ui-drawer",
    styles: {
        "&": {
            exclude: [
                /padding/,
                /border/,
                /margin/,
            ],
        },
        "&.ui-drawer-body": {
            include: [
                /padding/,
                /border/,
            ],
        },
        ".ui-drawer-root:has(> div > &.ui-drawer-body)": {
            include: [
                /margin/,
            ],
        },
    },
};
