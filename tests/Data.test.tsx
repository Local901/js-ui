// @vitest-environment jsdom
import * as React from "react";
import { act, memo } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ArrayData, ArrayDataItem, Data, useData } from "../src/hooks/Data.js";

type Item = { name: string };

const activeRoots: Root[] = [];

afterEach(() => {
    for (const root of activeRoots.splice(0)) {
        act(() => root.unmount());
    }
});

describe("ArrayData", () => {
    it("notifies only the changed item for item-value updates", () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement("div");
        const root = createRoot(container);
        activeRoots.push(root);

        const itemRenders = new Map<string, number>();
        let listRenders = 0;
        let rootRenders = 0;
        let rootData: Data<{ items: Item[] }> | undefined;
        let data: ArrayData<Item[]> | undefined;
        const ItemView = memo(({ item }: { item: ArrayDataItem<Item> }) => {
            itemRenders.set(item.key, (itemRenders.get(item.key) ?? 0) + 1);
            return <span>{item.data.use().name}</span>;
        });
        const ItemList = memo(({ listData }: { listData: ArrayData<Item[]> }) => {
            listRenders++;
            data = listData;
            return <>{listData.useItems().map((item) => <ItemView key={item.key} item={item} />)}</>;
        });

        function App() {
            rootRenders++;
            rootData = useData({ items: [{ name: "first" }, { name: "second" }] });
            rootData.use();
            return <ItemList listData={rootData.getData("items")} />;
        }

        act(() => root.render(<App />));
        const [first, second] = data!.getItems();
        const initialListRenders = listRenders;
        const originalArray = data!.get();
        const defaultArray = rootData!.getDefault("items");

        act(() => first!.data.set("updated", "name"));

        expect(container.textContent).toBe("updatedsecond");
        expect(rootRenders).toBe(1);
        expect(listRenders).toBe(initialListRenders);
        expect(itemRenders.get(first!.key)).toBe(2);
        expect(itemRenders.get(second!.key)).toBe(1);
        expect(data!.get()).toBe(originalArray);
        expect(data!.get()).not.toBe(defaultArray);
        expect(defaultArray[0]?.name).toBe("first");
        expect(data!.get()[0]?.name).toBe("updated");
    });

    it("notifies for structural changes and preserves item identity when moving", () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement("div");
        const root = createRoot(container);
        activeRoots.push(root);

        const itemRenders = new Map<string, number>();
        let listRenders = 0;
        let data: ArrayData<Item[]> | undefined;
        const ItemView = memo(({ item }: { item: ArrayDataItem<Item> }) => {
            itemRenders.set(item.key, (itemRenders.get(item.key) ?? 0) + 1);
            return <span>{item.data.use().name}</span>;
        });

        function App() {
            listRenders++;
            data = useData({ items: [{ name: "first" }, { name: "second" }] }).getData("items");
            return <>{data.useItems().map((item) => <ItemView key={item.key} item={item} />)}</>;
        }

        act(() => root.render(<App />));
        const [first, second] = data!.getItems();
        const initialListRenders = listRenders;

        act(() => data!.move(second!.key, 0));

        expect(data!.getItems().map((item) => item.key)).toEqual([second!.key, first!.key]);
        expect(data!.getItem(second!.key).index()).toBe(0);
        expect(container.textContent).toBe("secondfirst");
        expect(listRenders).toBe(initialListRenders + 1);
        expect(itemRenders.get(first!.key)).toBe(1);
        expect(itemRenders.get(second!.key)).toBe(1);

        act(() => data!.add({ name: "third" }));

        expect(container.textContent).toBe("secondfirstthird");
        expect(data!.getItems()).toHaveLength(3);

        act(() => data!.insert(1 ,{ name: "inserted" }));

        const insertedKey = data!.getItem(1).key;
        expect(container.textContent).toBe("secondinsertedfirstthird");
        expect(data!.getItem(first!.key).index()).toBe(2);

        act(() => data!.remove(insertedKey));

        expect(container.textContent).toBe("secondfirstthird");
        expect(data!.getItems()).toHaveLength(3);
    });

    it("recreates item identities when the whole array is replaced or reset", () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement("div");
        const root = createRoot(container);
        activeRoots.push(root);

        let data: ArrayData<Item[]> | undefined;
        function App() {
            data = useData({ items: [{ name: "default" }] }).getData("items");
            return <>{data.useItems().map((item) => <span key={item.key}>{item.data.get("name")}</span>)}</>;
        }

        act(() => root.render(<App />));
        const originalKey = data!.getItem(0).key;

        act(() => data!.set([{ name: "replacement" }]));
        const replacementKey = data!.getItem(0).key;

        act(() => data!.reset());

        expect(replacementKey).not.toBe(originalKey);
        expect(data!.getItem(0).key).not.toBe(replacementKey);
        expect(data!.get()[0]?.name).toBe("default");
    });

    it("routes tuple item access through ArrayData", () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement("div");
        const root = createRoot(container);
        activeRoots.push(root);

        let rootData: Data<{ pair: [string, number] }> | undefined;
        let data: ArrayData<[string, number]> | undefined;
        function App() {
            rootData = useData({ pair: ["first", 2] as [string, number] });
            data = rootData.getData("pair");
            return <span>{data.useItem(0).data.use()}</span>;
        }

        act(() => root.render(<App />));
        const first = data!.getItem(0);
        const previousArray = data!.get();

        act(() => first.data.set("updated"));

        expect(container.textContent).toBe("updated");
        expect(data!.get()).toEqual(["updated", 2]);
        expect(rootData!.get("pair")).toBe(data!.get());
        expect(data!.get()).toBe(previousArray);
        expect(previousArray).not.toEqual(["first", 2]);
        expect(data!.getItem(1).data.get()).toBe(2);
    });
});