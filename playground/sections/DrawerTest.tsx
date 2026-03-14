import { useController } from "../../src/hooks/Controller.ts";
import { Button } from "../../src/input/Button.tsx";
import { Stack } from "../../src/layout/Stack.tsx";
import { Drawer } from "../../src/overlay/Drawer.tsx";
import type { Element } from "../../src/types/Element.ts";

export const DrawerTest: Element = () => {
    const controller = useController(true);
    return (<>
        <Button onClick={controller.flip}>Flip</Button>
        <Stack>
            <Stack direction="row">
                Here is <Drawer controller={controller}><pre> Jonny!</pre></Drawer>
            </Stack>
            is
            <Drawer controller={controller.inverseController} position="top">Jonny!!!!</Drawer>
        </Stack>
    </>)
}
