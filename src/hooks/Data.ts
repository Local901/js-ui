import { useReducer, useRef, type ActionDispatch } from "react";
import { useEffect } from "./Effect.js";

type Primitive = string | number | boolean | bigint | symbol | null | undefined | Date | URL | Uint8Array | File;

type IsPlainObject<T> =
    T extends readonly unknown[]
        ? false
        : T extends object
            ? T extends Function
                ? false
                : T extends Primitive
                    ? false
                    : true
        : false;

type NestedPaths<T> = 
    IsPlainObject<T> extends true
        ? {
            [K in keyof T & string]:
                | K
                | `${K}.${NestedPaths<T[K]>}`
        }[keyof T & string]
        : never;

type Paths<T> = "" | NestedPaths<T>;

type PathValue<T, P extends Paths<T>> =
    P extends `${infer K}.${infer Rest}`
        ? K extends keyof T
            ? Rest extends Paths<T[K]>
                ? PathValue<T[K], Rest>
                : never
            : never
        : P extends keyof T
            ? T[P]
            : P extends ""
                ? T
                : never;

type DataNode<T> = Extract<T, readonly unknown[]> extends never ? Data<T> : ArrayData<T>;

export interface Data<T> {
    use(rerenderFilter?: (newValue: T, oldValue: T) => boolean): T;
    getData<const P extends Paths<T>>(path: P): DataNode<PathValue<T, P>>;
    /**
     * Get the value of the input or a sub-value.
     * 
     * WARNING: This value is not reactive. Only use for on demand lookup in callbacks or effects.
     *
     * @param path Path to the value.
     * @returns The value that is currently stored.
     */
    get<const P extends Paths<T>>(path?: P): PathValue<T, P>;
    /**
     * Set a value in the input. This will trigger rerenders.
     *
     * @param value The value to set.
     * @param path Path to the value.
     */
    set<const P extends Paths<T>>(value: PathValue<T, P>, path?: P): void;
    /**
     * Reset the value back to the default value. This will trigger rerenders.
     * 
     * @param path Path to the value.
     */
    reset<const P extends Paths<T>>(path?: P): void;
    /**
     * Get the default value.
     * 
     * @param path Path to the value.
     */
    getDefault<const P extends Paths<T>>(path?: P): PathValue<T, P>;
    /**
     * Will update the default value. But this will not trigger rerenders.
     * 
     * @param value The value to set.
     * @param path Path to the value.
     */
    setDefault<const P extends Paths<T>>(value: PathValue<T, P>, path?: P): void;
    /**
     * Trigger rerender fot this input.
     * 
     * This is for internal use. It will rerender all components that use this input.
     */
    rerender(): void;
}

export interface ArrayDataItem<T> {
    index(): number;
    key: string;
    data: DataNode<T>;
};

type ArrayItemValue<T> = T extends readonly (infer I)[] ? I : never;
type ArrayItemValueAt<T, K extends string | number> = K extends number
    ? T extends readonly unknown[]
        ? number extends K
            ? ArrayItemValue<T>
            : `${K}` extends keyof T
                ? T[`${K}` & keyof T]
                : ArrayItemValue<T>
        : never
    : ArrayItemValue<T>;

export interface ArrayData<T> extends Data<T> {
    useItems(): ArrayDataItem<ArrayItemValue<T>>[];
    getItems(): ArrayDataItem<ArrayItemValue<T>>[];
    useItem<const K extends string | number>(keyOrIndex: K): ArrayDataItem<ArrayItemValueAt<T, K>>;
    getItem<const K extends string | number>(keyOrIndex: K): ArrayDataItem<ArrayItemValueAt<T, K>>;

    move(key: string, index: number): void;
    add(item: ArrayItemValue<T>): void;
    insert(item: ArrayItemValue<T>, index: number): void;
    remove(key: string): void;
}

function mergePaths(root: string, subPath: string = ""): string {
    if (root === "") {
        return subPath;
    }
    if (subPath === "") {
        return root;
    }
    return `${root}.${subPath}`;
}

class DataClass<ROOT, T> implements Data<T> {
    private reducers: ActionDispatch<[]>[] = [];

    public constructor(
        protected rootInput: RootData<ROOT>,
        protected readonly path: string,
    ) {}

    /** @inheritDoc */
    public use(rerenderFilter?: (newValue: T, oldValue: T) => boolean): T {
        const [_value, reducer] = useReducer((prev) => ++prev, 0);

        const result = this.get("") as T;
        useEffect(() => {
            const rerender = rerenderFilter
                ? () => {
                    if (rerenderFilter(result, this.get("") as T)) {
                        reducer();
                    }
                }
                : reducer;
            this.reducers.push(rerender);

            return () => this.reducers.splice(this.reducers.indexOf(rerender), 1);
        }, [reducer])

        return result;
    }
    /** @inheritDoc */
    public rerender = (): void => {
        for(const reducer of this.reducers) {
            try {
                reducer();
            } catch (e) {}
        }
    }
    /** @inheritDoc */
    public getData = <const P extends Paths<T>>(path: P): DataNode<PathValue<T, P>> => {
        return this.rootInput.getData(mergePaths(this.path, path) as Paths<ROOT>) as DataNode<PathValue<T, P>>;
    }
    /** @inheritDoc */
    public get = <const P extends Paths<T>>(path?: P): PathValue<T, P> => {
        return this.rootInput.get(mergePaths(this.path, path) as Paths<ROOT>) as PathValue<T, P>;
    }
    /** @inheritDoc */
    public set = <const P extends Paths<T>>(value: PathValue<T, P>, path?: P): void => {
        return this.rootInput.set(mergePaths(this.path, path) as Paths<ROOT>, value as PathValue<ROOT, Paths<ROOT>>);
    }
    /** @inheritDoc */
    public reset = <const P extends Paths<T>>(path?: P): void => {
        return this.rootInput.reset(mergePaths(this.path, path) as Paths<ROOT>);
    }
    /** @inheritDoc */
    public getDefault = <const P extends Paths<T>>(path?: P): PathValue<T, P> => {
        return this.rootInput.getDefault(mergePaths(this.path, path) as Paths<ROOT>) as PathValue<T, P>;
    }
    /** @inheritDoc */
    public setDefault = <const P extends Paths<T>>(value: PathValue<T, P>, path?: P): void => {
        return this.rootInput.setDefault(mergePaths(this.path, path) as Paths<ROOT>, value as PathValue<ROOT, Paths<ROOT>>);
    }
}

class ArrayDataClass<ROOT, T> extends DataClass<ROOT, T> implements ArrayData<T> {
    private order: string[] = [];
    private items = new Map<string, ArrayDataItem<ArrayItemValue<T>>>();
    private itemsInitialized = false;
    private nextKey = 0;

    private assertArray(data: T): asserts data is T & unknown[] {
        if (Array.isArray(data)) {
            return;
        }
        throw new Error("Array data functions can only be used when the data is an array.");
    }

    private ensureItems(): ArrayItemValue<T>[] {
        const data = this.get() as T;
        this.assertArray(data);

        if (!this.itemsInitialized) {
            this.itemsInitialized = true;
            this.order = [];
            this.items.clear();
            for (let index = 0; index < data.length; index++) {
                const created = this.createItem(data[index] as ArrayItemValue<T>);
                data[index] = created.value;
            }
        }
        return data as ArrayItemValue<T>[];
    }

    private createItem(
        value: ArrayItemValue<T>,
        index = this.order.length,
    ): { item: ArrayDataItem<ArrayItemValue<T>>; value: ArrayItemValue<T> } {
        const key = String(this.nextKey++);
        let root: RootData<ArrayItemValue<T>>;
        root = new RootData(value, (updatedValue) => this.updateItemValue(key, updatedValue));
        const item: ArrayDataItem<ArrayItemValue<T>> = {
            key,
            index: () => this.order.indexOf(key),
            data: root.getData("") as DataNode<ArrayItemValue<T>>,
        };
        this.order.splice(index, 0, key);
        this.items.set(key, item);
        return { item, value: root.get("") as ArrayItemValue<T> };
    }

    private updateItemValue(key: string, value: ArrayItemValue<T>): void {
        if (this.items.has(key)) {
            const index = this.order.indexOf(key);
            if (index >= 0) {
                (this.get() as unknown[])[index] = value;
            }
        }
    }

    public onArrayReplaced(): void {
        this.itemsInitialized = false;
        this.order = [];
        this.items.clear();
        if (Array.isArray(this.get())) {
            this.ensureItems();
        }
    }

    public useItems(): ArrayDataItem<ArrayItemValue<T>>[] {
        this.use();
        return this.getItems();
    }
    public getItems(): ArrayDataItem<ArrayItemValue<T>>[] {
        this.ensureItems();
        return this.order.map((key) => this.items.get(key)!);
    }
    public useItem<const K extends string | number>(keyOrIndex: K): ArrayDataItem<ArrayItemValueAt<T, K>> {
        this.use();
        return this.getItem(keyOrIndex);
    }
    public getItem<const K extends string | number>(keyOrIndex: K): ArrayDataItem<ArrayItemValueAt<T, K>> {
        this.ensureItems();
        const index = typeof keyOrIndex === "number"
            ? keyOrIndex
            : this.order.indexOf(keyOrIndex);
        const key = this.order[index];
        const item = key === undefined ? undefined : this.items.get(key);
        if (!item) {
            throw new RangeError(`No array item exists at ${String(keyOrIndex)}.`);
        }
        return item as ArrayDataItem<ArrayItemValueAt<T, K>>;
    }
    public move(key: string, index: number): void {
        const data = this.ensureItems();
        const currentIndex = this.order.indexOf(key);
        if (currentIndex < 0) {
            return;
        }
        if (!Number.isInteger(index) || index < 0 || index >= this.order.length) {
            throw new RangeError(`Array index ${index} is out of range.`);
        }
        if (currentIndex === index) {
            return;
        }

        const [movedKey] = this.order.splice(currentIndex, 1);
        this.order.splice(index, 0, movedKey!);
        const [movedValue] = data.splice(currentIndex, 1);
        data.splice(index, 0, movedValue!);
        this.rerender();
    }
    public add(item: ArrayItemValue<T>): void {
        this.insert(item, this.ensureItems().length);
    }
    public insert(item: ArrayItemValue<T>, index: number): void {
        const data = this.ensureItems();
        if (!Number.isInteger(index) || index < 0 || index > data.length) {
            throw new RangeError(`Array index ${index} is out of range.`);
        }
        const arrayItem = this.createItem(item, index);
        data.splice(index, 0, arrayItem.value);
        this.rerender();
    }
    public remove(key: string): void {
        const data = this.ensureItems();
        const index = this.order.indexOf(key);
        if (index < 0) {
            return;
        }
        this.order.splice(index, 1);
        this.items.delete(key);
        data.splice(index, 1);
        this.rerender();
    }
}

type InternalData = {
    data?: DataNode<unknown>;
    current: unknown;
}

class RootData<T> {
    private inputs: Record<string, InternalData> = {};

    public constructor(
        private defaults: T,
        private readonly onChange?: (value: T) => void,
    ) {
        this.processValue("", defaults);
    }

    private processValue(path: string, value: unknown): unknown {
        const type = typeof value;
        if (type !== "object" || [Date, URL, Uint8Array, File].some((t) => value instanceof t)) {
            this.inputs[path] ??= { current: value };
            this.inputs[path].current = value;
            return value;
        }
        if (Array.isArray(value)) {
            const arrayCopy = [...value];
            this.inputs[path] ??= { current: arrayCopy };
            this.inputs[path].current = arrayCopy;
            return arrayCopy;
        }
        const objCopy = Object.fromEntries(Object.entries(value as {}).map(([key, value]) => [
            key,
            this.processValue(mergePaths(path, key), value),
        ]));
        this.inputs[path] ??= { current: objCopy };
        this.inputs[path].current = objCopy;
        return objCopy;
    }

    private getPathsOf(path: string): [string, InternalData][] {
        return Object.entries(this.inputs)
            .filter(([key]) => key.startsWith(path) && (
                key.length === path.length ||
                key[path.length] === "."
            ));
    }

    private deepClear(path: string) {
        for (const [,data] of this.getPathsOf(path)) {
            data.current = undefined;
        }
    }

    private insertValue(path: string, value: unknown) {
        const currentValue = this.processValue(path, value);

        // Walk down to create objects.
        const parts = path.split(".");
        if (path === "") {
            return;
        }
        if (parts.length === 1) {
            const parent = this.inputs[""]?.current;
            if (parent && typeof parent === "object" && !Array.isArray(parent)) {
                (parent as Record<string, unknown>)[parts[0]!] = currentValue;
            }
            return;
        }
        for (let end = parts.length - 1; end > 0; end--) {
            const subPath = parts.slice(0, end).join(".");
            const data = this.inputs[subPath];
            if (!data?.current) {
                const parentValue = { [parts[end - 1] as string]: currentValue };
                this.inputs[subPath] ??= {
                    current: parentValue,
                };
                this.inputs[subPath].current = parentValue;
                continue;
            }
            if (
                typeof data.current !== "object" ||
                Array.isArray(data.current) ||
                [Date, URL, Buffer, Uint8Array].some((t) => data.current instanceof t)
            ) {
                throw new Error(`Expected a record type at ${subPath}`);
            }
            (data.current as Record<string, unknown>)[parts[end - 1] as string] = currentValue;

            // No need to go deeper.
            break;
        }
    }

    private getDataInternal(path: string): InternalData | undefined {
        return this.inputs[path];
    }

    private triggerRerender(path: string, excludedData?: DataNode<unknown>): void {
        const keys = Object.keys(this.inputs)
            .filter((k) => path === "" || k === "" || (k.startsWith(path) && (k.length === path.length || k[path.length] === ".")) || path.startsWith(`${k}.`))
            .sort((k1, k2) => k1.length - k2.length);
        for (const key of keys){
            const data = this.getDataInternal(key)?.data;
            if (data && data !== excludedData) {
                data.rerender();
            }
        }
        if (path === "") {
            this.onChange?.(this.get("") as T);
        }
    }

    public getData<P extends Paths<T>>(path: P): DataNode<PathValue<T, P>> {
        if (!this.inputs[path]) {
            this.inputs[path] = {
                data: new ArrayDataClass<T, PathValue<T, P>>(this, path) as unknown as DataNode<unknown>,
                current: this.get(path),
            };
        } else if (!this.inputs[path].data) {
            this.inputs[path].data = new ArrayDataClass<T, PathValue<T, P>>(this, path) as unknown as DataNode<unknown>;
        }
        return this.inputs[path].data as unknown as DataNode<PathValue<T, P>>;
    }
    public get<P extends Paths<T>>(path: P): PathValue<T, P> {
        return this.getDataInternal(path)?.current as PathValue<T, P>;
    }

    public set<P extends Paths<T>>(path: P, value: PathValue<T, P>): void {
        // Will process Value and update parent object. (We always want to do this on set.)
        this.deepClear(path);
        this.insertValue(path, value);

        for (const [inputPath, input] of Object.entries(this.inputs)) {
            const isWithinChangedPath = path === "" || inputPath === path || inputPath.startsWith(`${path}.`);
            if (isWithinChangedPath && input.data instanceof ArrayDataClass && Array.isArray(input.current)) {
                input.data.onArrayReplaced();
            }
        }

        this.triggerRerender(path);
    }

    public getDefault<P extends Paths<T>>(path: P): PathValue<T, P> {
        if (!path) {
            return this.defaults as PathValue<T, P>;
        }
        const sections = path.split(".");
        let current: unknown = this.defaults;
        while(sections.length) {
            if (!current || typeof current !== "object") {
                return undefined as unknown as PathValue<T, P>;
            }
            current = (current as Record<string, unknown>)[sections.shift()!]
        }
        return current as PathValue<T, P>;
    }

    public setDefault<P extends Paths<T>>(path: P, value: PathValue<T, P>): void {
        if (!path) {
            this.defaults = value as T;
        }
        const sections = path.split(".");
        if (typeof this.defaults !== "object") {
            this.defaults = {} as T;
        }
        let current: unknown = this.defaults;
        while(sections.length > 1) {
            if (!current || typeof current !== "object") {
                throw new Error("Unable to set Default value.");
            }
            const key = sections.shift()!;
            if (!(key in current)) {
                current = ((current as Record<string, unknown>)[key] = {});
            }
            if (typeof (current as Record<string, unknown>)[key] !== "object") {
                (current as Record<string, unknown>)[key] = {} as T;
            }
            current = (current as Record<string, unknown>)[key];
        }
        (current as Record<string, unknown>)[sections[0]!] = value;
    }

    public remove<P extends Paths<T>>(path: P): void {
        this.set(path, undefined as PathValue<T, P>);
    }

    public reset<P extends Paths<T>>(path: P): void {
        this.set(path, this.getDefault(path));
    }
}

export function useData<T>(init: T): DataNode<T> {
    const controller = useRef<RootData<T>>(null);
    if (!controller.current) {
        controller.current = new RootData(init);
    }
    return controller.current.getData("") as DataNode<T>;
}
