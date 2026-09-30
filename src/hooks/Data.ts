import { useReducer, useRef, type ActionDispatch } from "react";
import { useEffect } from "./Effect.js";

type Primitive = string | number | boolean | bigint | symbol | null | undefined | Date | URL | Uint8Array | File;

type IsTuple<T> =
    T extends readonly unknown[]
        ? number extends T['length']
            ? false
            : true
        : false;

type IsPlainObject<T> =
    T extends object
        ? T extends unknown[]
            ? IsTuple<T> extends true
                ? true
                : false
            : T extends Function
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

type DataNode<T> = Data<T>;
// T extends unknown[]
//     ? ArrayData<T>
//     : Data<T>;

export interface Data<T> {
    use(): T;
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

type AssertArrayDataItems<T> = T extends [infer I, ...infer rest]
    ? [ArrayDataItem<I>, ...AssertArrayDataItems<rest>]
    : never;

type AssertArrayDataItem<T, K extends string | number> = T extends unknown[]
    ? K extends number
        ? ArrayDataItem<T[K]>
        : ArrayDataItem<T[number]>
    : never;

export interface ArrayData<T> extends Data<T> {
    useItems(): AssertArrayDataItems<T>[];
    getItems(): AssertArrayDataItems<T>[];
    useItem<K extends string | number>(keyOrIndex: K): AssertArrayDataItem<T, K>;
    getItem<K extends string | number>(keyOrIndex: K): AssertArrayDataItem<T, K>;

    move(key: string, index: number): void;
    add(item: T): void;
    insert(item: T, index: number): void;
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
    public use(): T {
        const [_value, reducer] = useReducer((prev) => ++prev, 0);

        useEffect(() => {
            const index = this.reducers.length;
            this.reducers.push(reducer);

            return () => this.reducers.splice(index, 1);
        }, [reducer])

        return this.get("") as T;
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

type InternalData = {
    data?: DataNode<unknown>;
    current: unknown;
}

class RootData<T> {
    private inputs: Record<string, InternalData> = {};

    public constructor(private defaults: T) {
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
        let currentValue = this.processValue(path, value);

        // Walk down to create objects.
        const parts = path.split(".");
        const numberMatch = parts[parts.length - 1]?.match(/\d+/)
        const tupleIndex = numberMatch ? parts.length - 1 : -1;
        for (let end = parts.length - 1; end > 0; end--) {
            const subPath = parts.slice(0, end).join(".");
            const data = this.inputs[subPath];
            if (!data?.current) {
                currentValue = end === tupleIndex
                    ? (() => {
                        const a = [];
                        a[Number.parseInt(numberMatch![0])] = currentValue;
                        return a;
                    })()
                    : { [parts[end - 1] as string]: currentValue };
                this.inputs[subPath] ??= {
                    current: currentValue,
                };
                this.inputs[subPath].current = currentValue;
                continue;
            }
            if (end === tupleIndex) {
                if (!Array.isArray(data.current)) {
                    throw new Error(`Expected tuple type at ${subPath}`);
                }
                data.current[Number.parseInt(numberMatch![0])] = currentValue;

                // No need to go deeper.
                break;
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
        if (path in this.inputs) {
            return this.inputs[path];
        }

        // tuple fallback. (expect no record object in tuple)
        const match = path.match(/[\.^]-?\d+$/);
        if (match) {
            const tuplePath = path.substring(0, match.index);
            if (!(tuplePath in this.inputs)) {
                // Undefined for now as we can create the relations on set.
                return undefined;
            }
            const tuple = this.inputs[tuplePath];
            if (!tuple) {
                // Undefined for now as we can create the relations on set.
                return undefined;
            }
            if (!Array.isArray(tuple.current)) {
                throw new Error(`Parent of ${path} has to be a tuple.`);
            }
            // Add relation since it already exists in the tuple.
            this.inputs[path] = {
                current: tuple.current.at(Number.parseInt(match[0].replace(".", ""))),
            }
        }

        return undefined;
    }

    private triggerRerender(path: string): void {
        const keys = Object.keys(this.inputs)
            .filter((k) => path === "" || (k.startsWith(path) && (k.length === path.length || k[path.length] === ".")) || path.startsWith(`${k}.`))
            .sort((k1, k2) => k1.length - k2.length);
        for (const key of keys){
            this.getDataInternal(key)?.data?.rerender();
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
        return this.inputs[path].data as DataNode<PathValue<T, P>>;
    }
    public get<P extends Paths<T>>(path: P): PathValue<T, P> {
        return this.getDataInternal(path)?.current as PathValue<T, P>;
    }

    public set<P extends Paths<T>>(path: P, value: PathValue<T, P>): void {
        // Will process Value and update parent object. (We always want to do this on set.)
        this.deepClear(path);
        this.insertValue(path, value);

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

class ArrayDataClass<ROOT, T> extends DataClass<ROOT, T> implements ArrayData<T> {
    private order: string[] = [];
    private roots: Record<string, RootData<T>> = {};

    private assertArray(data: T): asserts data is T & unknown[] {
        if (Array.isArray(data)) {
            return;
        }
        throw new Error("Array data functions can only be used when the data is an array.");
    }

    public useItems(): AssertArrayDataItems<T> {
        throw new Error("Method not implemented.");
    }
    public getItems(): AssertArrayDataItems<T> {
        throw new Error("Method not implemented.");
    }
    public useItem<K extends string | number>(keyOrIndex: K): AssertArrayDataItem<T, K> {
        void keyOrIndex;
        throw new Error("Method not implemented.");
    }
    public getItem<K extends string | number>(keyOrIndex: K): AssertArrayDataItem<T, K> {
        void keyOrIndex;
        throw new Error("Method not implemented.");
    }
    public move(key: string, index: number): void {
        const data = this.get() as T;
        this.assertArray(data);

        void key;
        void index;
        throw new Error("Method not implemented.");
    }
    public add(item: T): void {
        const data = this.get() as T;
        this.assertArray(data);

        void item;
        throw new Error("Method not implemented.");
    }
    public insert(item: T, index: number): void {
        const data = this.get() as T;
        this.assertArray(data);

        void item;
        void index;
        throw new Error("Method not implemented.");
    }
    public remove(key: string): void {
        const data = this.get() as T;
        this.assertArray(data);

        const index = this.order.indexOf(key);
        if (index < 0) {
            return;
        }
        delete this.roots[key];
        this.order.splice(index, 1);
        data.splice(index, 1);
        this.rerender();
    }
}

export function useData<T>(init: T): DataNode<T> {
    const controller = useRef<RootData<T>>(null);
    if (!controller.current) {
        controller.current = new RootData(init);
    }
    return controller.current.getData("") as DataNode<T>;
}
