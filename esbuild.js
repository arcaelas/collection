#! ts-node
const { join } = require("path")
const { readdirSync } = require("fs")
const { build } = require("esbuild")

build({
    entryPoints: readdirSync(join(__dirname, 'test'))
        .filter(name => name.match(/\.ts$/))
        .map(name => join('src/test', name)),
    outdir: "test",
    bundle: true,
    minify: true,
    platform: "node",
    format: "cjs",
})

build({
    entryPoints: ['src/index.ts'],
    outdir: "build",
    bundle: false,
    minify: true,
    platform: "node",
    format: "cjs",
})