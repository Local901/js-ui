import { useData, type ArrayData } from "../../src/hooks/Data.js";
import type { InputProperties } from "../../src/types/Input.js";

const data = useData<{ pair: [string, number]; readonlyPair: readonly [string, number]; items: { name: string }[] }>({
    pair: ["text", 1],
    readonlyPair: ["text", 1],
    items: [],
});

const array = useData(["hello"]);

function testGeneric<T>(data: ArrayData<T[]>) {
    void data;
}

const pair = data.getData("pair");
const firstString: string = pair.getItem(0).data.get();
const secondNumber: number = pair.useItem(1).data.use();
const dynamicIndex: number = Math.random();
const dynamicValue: string | number = pair.getItem(dynamicIndex).data.get();
const keyedValue: string | number = pair.getItem("0").data.get();
const listedValue: string | number = pair.getItems()[0]!.data.get();
const readonlyPair = data.getData("readonlyPair");
const readonlyFirst: string = readonlyPair.getItem(0).data.get();
const readonlySecond: number = readonlyPair.useItem(1).data.use();
const items = data.getData("items");
const firstItemName: string = items.getItem(0).data.get("name");
const textInputProperties: InputProperties<string> = {
    input: useData({ age: 0, name: "" }).getData("name"),
};

testGeneric(array);

pair.getItem(0).data.set("updated");
pair.getItem(1).data.set(2);
pair.add("next");
pair.insert(1, 3);
pair.move(pair.getItem(0).key, 1);
pair.remove(pair.getItem(0).key);
data.getData("items").add({ name: "item" });

// @ts-expect-error Tuple slots are only available through ArrayData item methods.
data.get("pair.0");
// @ts-expect-error Tuple slots are only available through ArrayData item methods.
data.getData("pair.1");
// @ts-expect-error Tuple slots are only available through ArrayData item methods.
data.set("wrong", "pair.0");
// @ts-expect-error Tuple slots are only available through ArrayData item methods.
data.reset("pair.length");
// @ts-expect-error Literal tuple slots retain their declared item type.
pair.getItem(0).data.set(1);
// @ts-expect-error Literal tuple slots retain their declared item type.
pair.useItem(1).data.set("wrong");

void firstString;
void secondNumber;
void dynamicValue;
void keyedValue;
void listedValue;
void readonlyFirst;
void readonlySecond;
void textInputProperties;
void firstItemName;
