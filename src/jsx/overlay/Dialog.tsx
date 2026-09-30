import type { ParentElement } from "../../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../../types/Properties.js";
import type { Controller } from "../../hooks/Controller.js";
import { useCallback } from "../../hooks/Callback.js";
import type { ControllerEvents } from "../../types/Overlay.js";

export interface DialogProperties extends DefaultProperties, ControllerEvents {
    /** Controller interface. */
    controller?: Controller,
    /**
     * How can the dialog be closed. [(docs)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
     *
     * @default "any"
     */
    closedBy?: "any" | "closerequest" | "none"
}

export const Dialog: ParentElement<DialogProperties> = (props) => {
    const handleRef = useCallback((dialogElement: HTMLDialogElement | null) => {
        if (!(props.controller && dialogElement)) {
            return
        }

        if (props.controller.isOpen()) {
            // Open dialog if the controller was set to open.
            dialogElement.showModal();
        }

        return props.controller.register({
            open: () => {
                dialogElement.showModal();
                props.onOpen?.();
            },
            close: () => {
                dialogElement.close();
                props.onClose?.();
            },
        });
    });

    return <dialog
        ref={handleRef}
        closedby={props.closedBy ?? "any"}
        {...getDefaultProperties(props, "ui-dialog")}
    >
        {props.children}
    </dialog>
}
