import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";
import type { Controller } from "../hooks/Controller.js";
import { useSignal } from "../hooks/Signal.js";
import { useEffect } from "../hooks/Effect.js";
import { Position } from "../types/Position.js";
import { useCallback } from "../hooks/Callback.js";

export interface DialogProperties extends DefaultProperties {
    /** Controller interface. */
    controller?: Controller,
    /** Should the drawer start open. */
    open?: boolean,
    /** Which position should the drawer come from. */
    position?: Position,
}

export const Drawer: ParentElement<DialogProperties> = (props) => {
    const [isOpen, setIsOpen] = useSignal(props.open ?? false);
    
    const handleRef = useCallback((dialogElement: HTMLDivElement | null) => {
        if (!(props.controller && dialogElement)) {
            return
        }

        return props.controller.register({
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
        });
    });

    useEffect(() => {
        if (!props.controller) {
            return;
        }

        return props.controller.register({
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
        });
    }, [setIsOpen]);

    const isHorizontal = () => {
        return !(props.position && [Position.top, Position.bottom].includes(props.position));
    }

    const classBase = `ui-drawer position-${props.position ?? Position.left} direction-${isHorizontal() ?  "horizontal": "vertical"}`;

    return <div
        ref={handleRef}
        {...getDefaultProperties(props, `${classBase} ui-drawer-root`)}
        style={{
            ...(isHorizontal()
                ? { width: !isOpen ? 0 : undefined }
                : { height: !isOpen ? 0 : undefined }),
            overflow: "hidden"
        }}
    >
        <div
            className={`${classBase} ui-drawer-body ${props.className ?? ""}`.trimEnd()}
        >
            {props.children}
        </div>
    </div>
}
