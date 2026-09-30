import { useData } from "../../src/hooks/Data.ts";
import { Button } from "../../src/jsx/input/Button.tsx";
import { TextInput } from "../../src/jsx/input/TextInput.tsx";
import { UintInput } from "../../src/jsx/input/UintInput.tsx";
import { DataValue } from "../../src/jsx/output/DataValue.tsx";
import { Stack } from "../../src/jsx/layout/Stack.tsx";
import type { Element } from "../../src/types/Element.ts";

export const InputTest: Element = () => {
    const input = useData({
        age: 0,
        name: "",
    });

    return (<>
        <Button onClick={input.reset}>Reset</Button>
        <Stack direction="column">
            <Stack direction="row">
                <label>Name</label>
                <TextInput input={input.getInput("name")} />
                <Button onClick={() => input.reset("name")}>Reset text</Button>
                <Button onClick={() => input.setDefault(input.get("name"), "name")}>Set as default</Button>
            </Stack>
            <Stack direction="row">
                <label>Age</label>
                <UintInput input={input.getInput("age")} />
                <Button onClick={() => input.reset("age")}>Reset number</Button>
                <Button onClick={() => input.setDefault(input.get("age"), "age")}>Set as default</Button>
            </Stack>
            <p>
                Hello <DataValue data={input.getInput("name")}/>. You are <DataValue data={input.getInput("age")}/> years old.
            </p>
        </Stack>
    </>)
}
