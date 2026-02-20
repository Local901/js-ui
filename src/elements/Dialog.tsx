import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";
import type { Controller } from "../hooks/Controller.js";
import { useCallback } from "../hooks/Callback.js";

export interface DialogProperties extends DefaultProperties {
    /** Controller interface. */
    controller?: Controller,
}

export const Dialog: ParentElement<DialogProperties> = (props) => {
    const handleRef = useCallback((dialogElement: HTMLDialogElement | null) => {
        if (!(props.controller && dialogElement)) {
            return
        }

        return props.controller.register({
            open: () => dialogElement.showModal(),
            close: () => dialogElement.close(),
        });
    });

    return <dialog
        ref={handleRef}
        {...getDefaultProperties(props, "ui-dialog")}
    >
        {props.children}
    </dialog>
}
