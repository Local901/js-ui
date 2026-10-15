// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import type { Data } from "../src/hooks/Data.js";
import { useData } from "../src/hooks/Data.js";
import { ShowData } from "../src/jsx/guards/ShowData.js";

const activeRoots: Root[] = [];

afterEach(() => {
    for (const root of activeRoots.splice(0)) {
        act(() => root.unmount());
    }
});

function createTestContainer() {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const container = document.createElement("div");
    const root = createRoot(container);
    activeRoots.push(root);
    return { container, root };
}

describe("ShowData", () => {
    it("calls the child factory with data when the condition is true", () => {
        const { container, root } = createTestContainer();
        let childFactoryCalls = 0;

        function App() {
            const data = useData("available");
            return (
                <ShowData data={data} when={(value): value is string => value.length > 0}>
                    {(result) => {
                        childFactoryCalls++;
                        return <span>{result.get()}</span>;
                    }}
                </ShowData>
            );
        }

        act(() => root.render(<App />));

        expect(container.textContent).toBe("available");
        expect(childFactoryCalls).toBe(1);
    });

    it("calls the fallback factory when the condition is false", () => {
        const { container, root } = createTestContainer();
        let childFactoryCalls = 0;
        let fallbackFactoryCalls = 0;

        function App() {
            const data = useData("");
            return (
                <ShowData
                    data={data}
                    when={(value): value is string => value.length > 0}
                    fallback={(result) => {
                        fallbackFactoryCalls++;
                        return <span>fallback:{result.get()}</span>;
                    }}
                >
                    {(result) => {
                        childFactoryCalls++;
                        return <span>{result.get()}</span>;
                    }}
                </ShowData>
            );
        }

        act(() => root.render(<App />));

        expect(container.textContent).toBe("fallback:");
        expect(childFactoryCalls).toBe(0);
        expect(fallbackFactoryCalls).toBe(1);
    });

    it("returns null when the condition is false and no fallback is defined", () => {
        const { container, root } = createTestContainer();

        function App() {
            const data = useData("");
            return (
                <ShowData data={data} when={(value): value is string => value.length > 0}>
                    {(result) => <span>{result.get()}</span>}
                </ShowData>
            );
        }

        act(() => root.render(<App />));

        expect(container.textContent).toBe("");
        expect(container.childElementCount).toBe(0);
    });

    it("rerenders only when the condition result changes", () => {
        const { container, root } = createTestContainer();
        let data: ReturnType<typeof useData<string>> | undefined;
        let renderCount = 0;
        let fallbackRenderCount = 0;

        function App() {
            data = useData("first");
            return (
                <ShowData
                    data={data}
                    when={(value): value is string => value.trim().length > 0}
                    fallback={() => {
                        fallbackRenderCount++;
                        return <span>fallback</span>;
                    }}
                >
                    {(result) => {
                        renderCount++;
                        return <span>{result.get()}</span>;
                    }}
                </ShowData>
            );
        }

        act(() => root.render(<App />));
        expect(container.textContent).toBe("first");
        expect(renderCount).toBe(1);

        act(() => data!.set("second"));
        expect(container.textContent).toBe("first");
        expect(renderCount).toBe(1);

        act(() => data!.set(""));
        expect(container.textContent).toBe("fallback");
        expect(fallbackRenderCount).toBe(1);

        act(() => data!.set(" "));
        expect(container.textContent).toBe("fallback");
        expect(fallbackRenderCount).toBe(1);

        expect(renderCount).toBe(1);

        act(() => data!.set("third"));
        expect(container.textContent).toBe("third");
        expect(renderCount).toBe(2);
        expect(fallbackRenderCount).toBe(1);
    });

    it("Defined shows values other than null and undefined", () => {
        const { container, root } = createTestContainer();
        let data: Data<string | null | undefined> | undefined;

        function App() {
            data = useData({ value: undefined as string | null | undefined }).getData("value");
            return (
                <ShowData.Defined
                    data={data}
                    fallback={(value) => <span>fallback:{String(value.get())}</span>}
                >
                    {(value) => <span>{value.get()}</span>}
                </ShowData.Defined>
            );
        }

        act(() => root.render(<App />));
        expect(container.textContent).toBe("fallback:undefined");

        act(() => data!.set("defined"));
        expect(container.textContent).toBe("defined");

        act(() => data!.set(null));
        expect(container.textContent).toBe("fallback:null");
    });

    it("Optional shows null but falls back for undefined", () => {
        const { container, root } = createTestContainer();
        let data: Data<string | null | undefined> | undefined;

        function App() {
            data = useData({ value: undefined as string | null | undefined }).getData("value");
            return (
                <ShowData.Optional
                    data={data}
                    fallback={(value) => <span>fallback:{String(value.get())}</span>}
                >
                    {(value) => <span>{String(value.get())}</span>}
                </ShowData.Optional>
            );
        }

        act(() => root.render(<App />));
        expect(container.textContent).toBe("fallback:undefined");

        act(() => data!.set(null));
        expect(container.textContent).toBe("null");
    });

    it("Nullable shows undefined but falls back for null", () => {
        const { container, root } = createTestContainer();
        let data: Data<string | null | undefined> | undefined;

        function App() {
            data = useData({ value: null as string | null | undefined }).getData("value");
            return (
                <ShowData.Nullable
                    data={data}
                    fallback={(value) => <span>fallback:{String(value.get())}</span>}
                >
                    {(value) => <span>{String(value.get())}</span>}
                </ShowData.Nullable>
            );
        }

        act(() => root.render(<App />));
        expect(container.textContent).toBe("fallback:null");

        act(() => data!.set(undefined));
        expect(container.textContent).toBe("undefined");
    });
});
