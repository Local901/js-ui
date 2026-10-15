import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        dir: "tests",
        coverage: {
            include: ["src"],
        },
    },
});
