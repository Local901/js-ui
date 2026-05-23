import { useInput } from "../../src/hooks/Input.ts";
import { Button } from "../../src/input/Button.tsx";
import { TextInput } from "../../src/input/TextInput.tsx";
import { UintInput } from "../../src/input/UintInput.tsx";
import { InputValue } from "../../src/input/InputValue.tsx";
import { Stack } from "../../src/layout/Stack.tsx";
import type { Element } from "../../src/types/Element.ts";

export const InputTest: Element = () => {
    const input = useInput({
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
                Hello <InputValue input={input.getInput("name")}/>. You are <InputValue input={input.getInput("age")}/> years old.
            </p>
        </Stack>
    </>)
}
