import type { IObject } from "@arcaelas/utils"
import { Collection } from "../src"
import items from './items.json'

let collection: Collection<typeof items extends [infer T] ? T : IObject>

beforeAll(() => {
    collection = new Collection<typeof items extends [infer T, ...any] ? T : IObject>(items as [])
})

test("Collection created!", () => {
    expect(collection).toBeInstanceOf(Collection)
})

test("join", () => {
    expect(collection.join("name", ",", "and")).toMatch(/\w+,/g)
    expect(collection.join("name", ",", "and")).toMatch(/ and \w+/g)
})

test("map", () => {
    expect(collection.map(item => item.name).join(",")).toEqual(items.map(item => item.name).join(","))
})

test("pop", () => {
    expect(collection.pop()).toEqual(items[items.length - 1])
})

test("first", () => {
    expect(collection.first()).toMatchObject(items[0])
})

test("firstQuery", () => {
    expect(collection.first({ email: "greerfisher@zentime.com" })).toMatchObject(items[1])
    expect(collection.first({ email: { $eq: "greerfisher@zentime.com" } })).toMatchObject(items[1])
    expect(collection.first({ tags: { $includes: "proident" } })).toMatchObject(items[1])
})

test("notQuery", () => {
    expect(collection.first({ email: { $not: "greerfisher@zentime.com" } })).toMatchObject(items[0])
    expect(collection.first({ email: { $not: "greerfisher@zentime.com" } })).toMatchObject(items[0])
})