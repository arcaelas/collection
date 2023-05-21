import items from './items.json'
import { Collection } from "../src"

let collection: Collection<typeof items[0]>

beforeAll(() => {
    collection = new Collection(items)
})

test('macro', () => {
    collection.macro('test', () => 12)
    expect(collection.test()).toEqual(12)
})
test('macroStatic', () => {
    Collection.macro('testStatic', () => 12)
    expect(collection.testStatic()).toEqual(12)
})
test('collect', () => {
    expect(collection.collect([]).test()).toEqual(12)
})
test('chunk', () => {
    const chunk = collection.chunk(4)
    expect(chunk.length).toEqual(Math.ceil(items.length / 4))
    expect(chunk[0][0]).toMatchObject(items[0])
    expect(chunk[chunk.length - 1].pop()).toMatchObject(items[items.length - 1])
})
test('countBy', () => {
    expect(collection.countBy('gender').female)
        .toEqual(4)
})
test('delete', () => {
    const e = collection.first({ index: 0 }) as any
    collection.delete({ index: 0 })
    expect(collection.at(0)?.index).toEqual(1)
    collection.unshift(e)
    expect(collection.at(0)?.index).toEqual(0)
})
test('dump', () => {
    expect(collection.dump()).toEqual(collection)
})
test('each', () => {
    let i = 0
    collection.each(item => (i += item.index) < 7)
    expect(i).toEqual(10)
})
test('every', () => {
    expect(collection.every('_id')).toEqual(true)
    expect(collection.every('index', 0)).toEqual(false)
    expect(collection.every('index', '>=', 0)).toEqual(true)
    expect(collection.every({ age: { $gt: 0 } })).toEqual(true)
})
test('filter', () => {
    expect(collection.filter(i => i.index > 0).length).toEqual(6)
    expect(collection.filter({ index: { $gte: 1 } }).length).toEqual(6)
})
test("first", () => {
    expect(collection.first()).toMatchObject(items[0])
    expect(collection.first({ email: "greerfisher@zentime.com" })).toMatchObject(items[1])
    expect(collection.first({ email: { $eq: "greerfisher@zentime.com" } })).toMatchObject(items[1])
    expect(collection.first({ tags: { $includes: "proident" } })).toMatchObject(items[1])
})
test("map", () => {
    expect(collection.map(item => item.name).join(','))
        .toEqual(items.map(item => item.name).join(","))
})
