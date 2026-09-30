import { useController } from "../../src/hooks/Controller.ts";
import { Button } from "../../src/jsx/input/Button.tsx";
import { Dialog } from "../../src/jsx/overlay/Dialog.tsx";
import type { Element } from "../../src/types/Element.ts";

export const DialogTest: Element = () => {
    const controller = useController();
    return (<>
        <Button onClick={controller.open}>Open Dialog</Button>
        <Dialog controller={ controller }>
            Hello
        </Dialog>
    </>)
}
