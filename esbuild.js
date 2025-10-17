#! ts-node
const { join } = require("path")
const { readdirSync, existsSync } = require("fs")
const { build } = require("esbuild")

// Build test files if test directory exists
const testDir = join(__dirname, 'test');
if (existsSync(testDir)) {
    build({
        entryPoints: readdirSync(testDir)
            .filter(name => name.match(/\.ts$/))
            .map(name => join('test', name)),
        outdir: "test",
        bundle: true,
        minify: true,
        platform: "node",
        format: "cjs",
    })
}

build({
    entryPoints: ['src/index.ts'],
    outdir: "build",
    sourcemap: true,
    bundle: false,
    minify: true,
    platform: "node",
    format: "cjs",
})