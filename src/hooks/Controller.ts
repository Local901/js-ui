import { useRef } from "react";

export interface Controls {
    open: () => void;
    close: () => void;
}

export interface Controller extends Controls {
    register: (controls: Controls) => () => void;
}

export function useController() {
    const controlList = useRef<Controls[]>([]);

    const call = (event: keyof Controls): void => {
        for (const control of controlList.current) {
            try {
                control[event]();
            } catch (e) {
                console.error();
            }
        }
    }
    
    return {
        open: () => call("open"),
        close: () => call("close"),
        register: (controls) => {
            controlList.current.push(controls);
            return () => {
                controlList.current.splice(controlList.current.indexOf(controls), 1);
            }
        },
    } satisfies Controller;
}
