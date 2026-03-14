import type { ParentElement } from "../types/Element.js";
import { getDefaultProperties, type DefaultProperties } from "../types/Properties.js";
import type { Controller } from "../hooks/Controller.js";
import { Position } from "../types/Position.js";
import { useCallback } from "../hooks/Callback.js";
import type { ControllerEvents } from "../types/Overlay.js";
import { useRef } from "react";

export interface DialogProperties extends DefaultProperties, ControllerEvents {
    /** Controller interface. Drawer will stay open if not defined */
    controller?: Controller,
    /** Which position should the drawer come from. */
    position?: Position,
}

export const Drawer: ParentElement<DialogProperties> = (props) => {
    const elRefs = useRef<{ root: HTMLDivElement | null, body: HTMLDivElement | null }>({ root: null, body: null });
    const isHorizontal = () => {
        return !(props.position && ["top", "bottom"].includes(props.position));
    }

    const update = useCallback(() => {
        const { root, body } = elRefs.current;
        if (!(root && body && props.controller)) {
            return;
        }
        
        const property = isHorizontal() ? "width" : "height";

        if (props.controller.isOpen()) {
            root.style.setProperty(property, `${isHorizontal() ? body.offsetWidth : body.offsetHeight}px`);
        }

        body.addEventListener("resize", () => {
            if (!props.controller?.isOpen()) {
                return;
            }
            root.style.setProperty(property, `${isHorizontal() ? body.offsetWidth : body.offsetHeight}px`);
        });

        return props.controller.register({
            open: () => {
                root.style.setProperty(property, `${isHorizontal() ? body.offsetWidth : body.offsetHeight}px`);
                props.onOpen?.();
            },
            close: () => {
                root.style.setProperty(property, "0");
                props.onClose?.();
            },
        });
    }, [props.controller]);
    
    const handleRootRef = useCallback((drawerElement: HTMLDivElement | null) => {
        elRefs.current.root = drawerElement;
        if (!(props.controller && drawerElement)) {
            return;
        }

        update();
    });
    
    const handleBodyRef = useCallback((drawerElement: HTMLDivElement | null) => {
        elRefs.current.body = drawerElement;
        if (!(props.controller && drawerElement)) {
            return;
        }

        update();
    });

    const classBase = `ui-drawer position-${props.position ?? "left"} direction-${isHorizontal() ?  "horizontal": "vertical"}`;

    return <div
        ref={handleRootRef}
        {...getDefaultProperties(props, `${classBase} ui-drawer-root`)}
        style={{
            overflow: "hidden",
            // If no controller is defined keep drawer open.
            [isHorizontal() ? "width" : "height"]: (props.controller?.isOpen() ?? true) ? undefined : 0,
            display: "inline-flex",
            justifyContent: (props.position ?? "left") === "left" ? "flex-end" : undefined,
            alignItems: props.position === "top" ? "flex-end" : undefined,
        }}
    >
        <div>
        <div
            ref={handleBodyRef}
            className={`${classBase} ui-drawer-body ${props.className ?? ""}`.trimEnd()}
        >
            {props.children}
        </div>
        </div>
    </div>
}
