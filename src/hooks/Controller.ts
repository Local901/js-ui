import { register } from "module";
import { useRef } from "react";

export interface BaseControls {
    open: () => void;
    close: () => void;
}

export interface Controls extends BaseControls {
    flip: () => void;
    isOpen: () => boolean;
}

export interface Controller extends Controls {
    register: (controls: BaseControls) => () => void;
    inverseController: Controller;
}

export function useController(open = false) {
    const controlData = useRef<{ isOpen: boolean, controls: BaseControls[]}>({
        isOpen: open,
        controls: [],
    });

    const call = (event: keyof BaseControls): void => {
        for (const control of controlData.current.controls) {
            try {
                control[event]();
            } catch (e) {
                console.error();
            }
        }
    }

    const response = {
        open: () => {
            controlData.current.isOpen = true;
            call("open");
        },
        close: () => {
            controlData.current.isOpen = false;
            call("close");
        },
        flip: () => {
            controlData.current.isOpen = !controlData.current.isOpen;
            call(controlData.current.isOpen ? "open" : "close");
        },
        isOpen: () => controlData.current.isOpen,
        register: (controls) => {
            controlData.current.controls.push(controls);
            return () => {
                controlData.current.controls.splice(
                    controlData.current.controls.indexOf(controls),
                    1,
                );
            }
        },
    } as Controller;

    const inverse = {
        open: response.close,
        close: response.open,
        flip: response.flip,
        isOpen: () => !response.isOpen,
        register: (controls) => response.register({ open: controls.close, close: controls.open }),
        inverseController: response,
    } satisfies Controller
    
    response.inverseController = inverse;

    return response;
}
