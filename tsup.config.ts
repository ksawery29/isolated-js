import type { Options } from "tsup";

export const tsup: Options = {
    splitting: true,
    clean: true,
    dts: true,
    format: ["cjs", "esm"],
    minify: true,
    bundle: true,
    skipNodeModulesBundle: true,
    watch: false,
    target: "es2015",
    outDir: "dist",
    entry: ["src/**/*.ts"],
};
