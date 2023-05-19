import { countBy, Dictionary, groupBy, omit, uniqBy } from 'lodash'
import { type IObject, type Noop, get, has, clone, merge, Bind, } from '@arcaelas/utils'

export type Operator = keyof typeof alias
export type Simplify<T> = T extends infer S ? S : never
export type Inmutables = string | number | bigint | boolean | null
export type OneOf<T> = { [K in keyof T]-?: Partial<Record<Exclude<keyof T, K>, never>> & Record<K, T[K]> }[keyof T]
export interface QueryTypes {
    $eq: Inmutables
    $exists: boolean
    $exp: RegExp | { pattern: string, flags?: string }
    $gt: number
    $gte: number
    $in: Inmutables[]
    $includes: Inmutables
    $lt: number
    $lte: number
    $not: Inmutables | Query | OneOf<Omit<QueryTypes, '$not'>>
}
export type Query = Partial<Record<keyof QueryTypes, never>> & {
    [K in string]-?: Inmutables | RegExp | Query | OneOf<QueryTypes>
}

export interface QueryConstructor extends Function, Simplify<{
    [K in keyof QueryTypes]: Noop<[ref: string, value: QueryTypes[K]], Noop<[item: any], boolean>>
}> {
    new(query: Query, ref: string): void
    (item: any): boolean
}

export class QueryConstructor extends Function {

    private readonly filters: any[] = []
    constructor(query: Query, ref: string = "") {
        super("item", "return this.filters.every(fn=>fn(item))")
        for (const key in query) {
            let _ref = (ref && ref + '.') + key,
                value = query[key] instanceof Date ? new Date(query[key] as string).toISOString() : query[key]
            if (value instanceof RegExp) {
                const [, pattern, flags = ''] = String(value).match(/^(.*)?\/([a-z]+)?$/) || []
                if (!pattern) throw new ReferenceError(`RegExp with syntax: ${value}`)
                value = { $exp: { pattern, flags } }
            }
            if (typeof QueryConstructor[key] === 'function') {
                this.filters.splice(0, this.filters.length)
                this.filters.push(QueryConstructor[key](ref, value))
                break
            }
            else if (typeof (value ?? false) === 'object')
                this.filters.push(new QueryConstructor(value as Query, _ref))
            else
                this.filters.push(QueryConstructor.$eq(_ref, value as Inmutables))
        }
        return this.bind(this)
    }

    /**
     * @description
     * The $eq operator matches documents where the value of a field equals the specified value.
     * @example
     * {
     *  age: 18
     * }
     * @example
     * {
     *  age: {
     *      $eq: 18
     *  } 
     * }
     */
    static $eq(ref: string, value: QueryTypes['$eq']) {
        return (item: any) => get(item, ref) === value
    }

    /**
     * @description
     * The $not operator matches documents where the value of a field not equals the specified value.
     * @example
     * { $not: { age: 18 } }
     * { age: { $not: 18 } }
     * { age: { $not: { $eq: 18 } } }
     */
    static $not(ref: string, value: QueryTypes['$not']) {
        value = value instanceof QueryConstructor ? value : (
            typeof (value ?? 0) === 'object' ? new QueryConstructor(value as Query, ref) : value
        ) as Inmutables
        return (item: any) => !(value instanceof QueryConstructor ? value(item) : get(item, ref) === value)
    }

    /**
     * @description
     * Matches documents where field value is matched with RegExp or RegExp ON (RegExp Object Notation)
     */
    static $exp(ref: string, value: QueryTypes['$exp']) {
        if (!(value instanceof RegExp)) {
            if (value.pattern) value = new RegExp(value.pattern, value.flags ?? '')
            else {
                const [, pattern, flags = ''] = String(value).match(/^(.*)?\/([a-z]+)?$/) || []
                if (!pattern) throw new ReferenceError(`ErrorType: RegExp with syntax ${value}`)
                value = new RegExp(pattern, flags)
            }
        }
        return (item: any) => (value as RegExp).test(get(item, ref))
    }

    /**
     * @description
     * Verify if field value is greater than (i.e. >) the specified value.
     */
    static $gt(ref: string, value: QueryTypes['$gt']) {
        return (item: any) => get(item, ref, 0) > Number(value)
    }

    /**
     * @description
     * Verify if field value is less than (i.e. <) the specified value.
     */
    static $lt(ref: string, value: QueryTypes['$lt']) {
        return (item: any) => get(item, ref, 0) < Number(value)
    }

    /**
     * @description
     * Verify if field value is greater than or equal (i.e. >=) the specified value.
     */
    static $gte(ref: string, value: QueryTypes['$gte']) {
        return (item: any) => get(item, ref, 0) >= Number(value)
    }

    /**
     * @description
     * Verify if field value is less than or equal (i.e. <=) the specified value.
     */
    static $lte(ref: string, value: QueryTypes['$lte']) {
        return (item: any) => get(item, ref, 0) <= Number(value)
    }

    /**
     * @description
     * Check if document have a field specified.
     */
    static $exists(ref: string, value: QueryTypes['$exists']) {
        return (item: any) => has(item, ref) === value
    }

    /**
     * @description
     * Use $in operator to validate if field value exist in a specific array element
     */
    static $in(ref: string, value: QueryTypes['$in']) {
        return (item: any) => value.includes(get(item, ref))
    }

    /**
     * @description
     * Check if field value contain a value specified
     */
    static $includes(ref: string, value: QueryTypes['$includes']) {
        return (item: any) => {
            const arr = get(item, ref, []);
            return Array.isArray(arr) && arr.includes(value)
        }
    }

}

export enum alias {
    "=" = "$eq",
    "!=" = "$not",
    ">" = "$gt",
    "<" = "$lt",
    ">=" = "$gte",
    "<=" = "$lte",
    in = "$in",
    includes = "$includes",
}

export default class Collection<I extends IObject = IObject> {
    [K: string]: any
    protected items: I[] = []

    /**
     * @description
     * Start a new collection from a list of items.
     * @example
     * const items = new Collection()
     * const collection = new Collection([
     *  {
     *      name: "Arcaelas Insiders",
     *      team: 105,
     *      location: 'San Antonio, Valparaíso - Chile'
     *  }
     * ])
     */
    constructor(items: Collection | I | I[] = []) {
        this.items = items instanceof Collection ? items.all() as I[] : [].concat(items as any).map(clone) as I[]
    }

    /**
     * @description
     * Gets the length of the array.
     * @description
     * This is a number one higher than the highest index in the array.
     */
    public get length() { return this.items.length }

    /**
     * @description
     * Clone this Collection instance with all macro added in current instance.
     * @example
     * const clone = items.collect([])
     */
    collect<T extends IObject>(items?: T[]): Collection<T> {
        const c = new Collection(items);
        Object.setPrototypeOf(c, Object.getPrototypeOf(this));
        return c;
    }

    /**
     * @description
     * Add a custom callback to the collection to use it.
     * @example
     * collection.macro("some", function(cb){
     *  return this.items.some(cb);
     * });
     * 
     * collection.some(item=> item.id);
     */
    macro(key: string, handler: Bind<this, Noop<any[], any>>): this {
        return Collection.macro.call(this, key, handler as any) as this
    }

    /**
     * @description
     * Add custom callback to all new instances of Collection.
     * @example
     * Collection.macro('some', handler=>{
     *  return this.items.some(handler)
     * })
     * 
     * const collection = new Eloquen([ ... ])
     * const someItem: boolean = collection.some(e=> e.age >= 18)
     */
    static macro<T extends Collection = Collection>(key: string, value: Bind<T, Noop<any[], any>>) {
        const target = this.prototype || this['__proto__'] as unknown as T
        if (typeof key !== "string") throw new Error("The key-name must be a string")
        if (typeof value !== "function") throw new Error("Handler must be function")
        Object.defineProperty(target, key, { value, enumerable: false, })
        return target as T
    }

    /**
     * @description
     * The concat method is used to merge two or more collections/arrays/objects:
     * You can also concat() an array of objects, or a multidimensional array.
     * @example
     * const collection = collect([ { name: 'Arcaelas Insiders' } ]);
     * let concatenated = collection.concat({ name: 'Arcaelas Groupd, LLC' });
     * 
     * concatenated.all();
     * 
     * // [
     *  { name: 'Arcaelas Insiders' },
     *  { name: 'Arcaelas Groupd, LLC' }
     * ]
     */
    concat<T extends I>(...items: Array<T | T[]>): Collection<T | I> {
        return this.collect(this.items.concat(items.flat(Infinity) as any));
    }

    /**
     * @description
     * Converts this Collection to a JavaScript Object Notation (JSON) string.
     * @param replacer A function that transforms the results.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    stringify(replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
    stringify(...args: any[]) {
        return JSON.stringify(this.items, ...args)
    }

    /**
     * @description The join method joins the collection's values with a string.
     * @example
     * collection.join('name', ',', 'and');
     * // 'Arcaelas Insiders, Collection Item Name and Other Item name.'
     */
    join(key: string | ((item: I, index: number, arr: I[]) => any)): string;
    join(key: string, glue: string, union?: string): string;
    join(key: string, ...props: any[]) {
        const [glue = ",", union = glue] = props
        return this.items.map(
            typeof key === "string" ? item => get(item, key) : key
        ).reduce((str, value, _index, arr) => str + (_index ? (_index === arr.length - 1 ? `${glue} ` : ` ${union} `) : "") + value, "")
    }

    /**
     * @description The map method iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items
     * @example
     * collection.map(item=> item.name.toUpperCase());
     * // ["Alejandro","Reyes","Arcaelas"]
     */
    map<H extends (item: I, index: number, arr: I[]) => any>(handler: H): ReturnType<H>[] {
        return this.items.map(handler);
    }

    /**
     * @description
     * Removes the last element from an collection and returns it.
     * If the collection is empty, undefined is returned and the collection is not modified.
     */
    pop(): I | undefined {
        return this.items.pop();
    }

    /**
     * @description
     * Appends new elements to the end of an collection, and returns the new length of the collection.
     */
    push(...items: I[]): number {
        return this.items.push(...items);
    }

    /**
     * @description Calls the specified callback function for all the elements in an collection. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the collection.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an collection value.
     */
    reduce<H extends ((current?: C, item?: I, index?: number) => any), C extends any>(callbackfn: H, initialValue: C): C {
        return this.items.reduce(callbackfn, initialValue) as C;
    }

    /**
     * @description Removes the first element from an collection and returns it.
     * @description If the collection is empty, undefined is returned and the collection is not modified.
     */
    shift(): undefined | I {
        return this.items.shift();
    }

    /**
     * @description
     * Returns a copy of a section of an collection.
     * For both start and end, a negative index can be used to indicate an offset from the end of the collection.
     * For example, -2 refers to the second to last element of the collection.
     * @param start The beginning index of the specified portion of the collection.
     * If start is undefined, then the slice begins at index 0.
     * @param end The end index of the specified portion of the collection. This is exclusive of the element at the index 'end'.
     * If end is undefined, then the slice extends to the end of the collection.
     */
    slice(start: number, end: number = Infinity): Collection<I> {
        return this.collect(this.items.slice(start, end));
    }

    /**
     * @description
     * Sort the elements of the collection (This method mutates the collection).
     */
    sort(key: string, direction?: "asc" | "desc"): Collection<I>
    sort(iterator: (a: I, b: I) => number): Collection<I>
    sort(handler, ...dir): Collection<I> {
        return this.collect(
            this.items.sort(typeof handler === "function" ? handler : (current, next) => {
                next = get(next, handler, undefined) as any;
                current = get(current, handler, undefined) as any;
                return current === undefined ? 0 : (next === undefined ? (dir[0] === "asc" ? 1 : -1) : (
                    (current > next ? 1 : -1) * (dir[0] === 'asc' ? 1 : -1)
                ));
            })
        )
    }

    /**
     * @description
     * Removes elements from an collection and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An collection containing the elements that were deleted.
     */
    splice(start: number, deleteCount: number, ...items: IObject[]): Collection<I> {
        return this.collect(this.items.splice(start, deleteCount, ...items as any))
    }

    /**
     * @description
     * Inserts new elements at the start of an collection, and returns the new length of the collection.
     */
    unshift(...items: I[]): number {
        return this.items.unshift(...items);
    }

    /**
     * @description
     * Return all items into collection.
     */
    all(): I[] {
        return this.items.filter(Boolean) as any;
    }

    /**
     * @description
     * Count items length into collection.
     */
    count(): number {
        return Math.max(this.items.length, 0)
    }

    /**
    * @description
    * Print collection and exit.
    */
    dd(): void | never {
        this.dump();
        if (typeof process !== 'undefined')
            process.exit(1);
    }

    /**
    * @description Print collection and continue.
    */
    dump(): this {
        console.log(this);
        return this;
    }

    /**
     * @description
     * The max method returns the maximum value of a given key:
     * @example
     * const collection = new Collection([
     *   { value: 10 },
     *   { value: -13 },
     *   { value: 12 },
     *   { unicorn: false, },
     * ]);
     * 
     * const max = collection.max('value'); // 12
     */
    max(key: string): number {
        if (typeof key !== 'string') throw new Error("type/string");
        return Math.max(...this.items.map(item => get(item, key, 0)));
    }

    /**
     * @description
     * The min method returns the minimum value of a given key:
     * @example
     * const collection = new Collection([
     *   { value: 10 },
     *   { value: -13 },
     *   { value: 12 },
     *   { unicorn: false, },
     * ]);
     * 
     * const max = collection.min('value'); // -13
     */
    min(key: string): number {
        if (typeof key !== 'string') throw new Error("type/string");
        return Math.min(...this.items.map(item => get(item, key, 0)));
    }

    /**
     * @description
     * Get random elements, with the argument "length" the number of elements is indicated.
     */
    random(length: number = Infinity): I[] {
        return this.items.sort(() => Math.floor(Math.random() * 0.5)).slice(0, length);
    }

    /**
     * @description
     * This method set items order as random.
     * This method mutate collection, if you wan't mutate collection, must be call {@link Collection.random}
     */
    shuffle(): this {
        this.items = this.items.sort(() => Math.floor(Math.random() * 0.5))
        return this;
    }

    /**
     * @description Sum the elements according to a specific key.
     * @example
     * collection.sum("price");
     * collection.sum(item=> item.price * 0.16);
     */
    sum(key: string): number;
    sum<H extends (item: I, index: number, arr: I[]) => number>(iterator: H): number;
    sum(handler) {
        return this.items.map(typeof handler === "function" ? handler : item => get(item, handler))
            .filter((e: any) => !isNaN(e))
            .reduce((a, b: any) => a + b, 0)
    }

    /**
     * @description
     * The chunk method breaks the collection into multiple, smaller collections of a given size.
     * @example
     * const collection = collect([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.chunk(4);
     * chunks.all(); // [[1, 2, 3, 4], [5, 6, 7]]
     */
    chunk(size: number): Array<I[]> {
        const chunks: I[][] = [];
        for (let i = 0; i < Math.ceil(this.items.length / size); i++)
            chunks.push(this.items.slice(i * size, (i + 1) * size))
        return chunks;
    }

    /**
     * @description
     * Group Items By key and count.
     *
     * @example
     * countBy("key.optionalChained")
     * return {
     *  optionalChainedValue:1
     * }
     */
    countBy(key: string): Record<string, number>
    countBy(executor: (value: I, index: number, arr: I[]) => (string | number | symbol)): Record<string, number>
    countBy(iterator) {
        if (!['function', 'string'].includes(typeof iterator))
            throw new Error("Handler must be string or Function Iterator");
        return countBy(this.items, iterator)
    }

    /**
     * @description
     * The each method iterates over the items in the collection and passes each item to a callback,
     * If you would like to stop iterating through the items, you may return false from your callback.
     * @example
     * let sum = 0;
     * shopCart.each(item => {
     *   sum += item.price;
     * });
     * 
     * @description
     * If you would like to stop iterating through the items, you may return false from your callback:
     * @example
     * let sum = 0
     * shopCart.each((item) => {
     *   if (item.stock <= 0) {
     *     return false;
     *   }
     *   sum += item.price;
     * });
     */
    each(fn: (item: I, index: number, arr: I[]) => any): this {
        for (let index = 0, stop = false; index < this.items.length && !stop; index += 1)
            stop = fn(this.items[index], index, this.items) === false;
        return this;
    }

    /**
     * @description
     * The every method may be used to verify that all elements of a collection pass a given truth test:
     * @example
     * collection.every('name') // Check if all items have "name" property
     * 
     * collection.every('name', 'value') // Check if all items have "name" property with "value" value.
     * collection.every('name', /^Arcaelas/) // Check if all items have "name" property started as "Arcaelas"
     * 
     * collection.every(item=>{
     *  return item.stock > 0  // Check if all items have "stock" property > 0
     * })
     */
    every(key: string): boolean
    every(query: Query): boolean
    every(handler: Noop<[item: I, index: number, arr: I[]], boolean>): boolean
    every(key: string, value: any): boolean
    every(key: string, operator: Operator, value: any): boolean
    every(...args: any[]) {
        switch (args.length) {
            case 1:
                switch (typeof (args[0] ?? 0)) {
                    case 'function':
                        return this.items.every(args[0])
                    case 'string':
                        return this.items.every(o => has(o, args[0]))
                    case 'object':
                        return this.find(args[0]).count() === this.items.length
                }
                break
            case 2:
                return this.items.every(o => get(o, args[0]) === args[1])
            case 3:
                if (!alias[args[1]])
                    throw new TypeError(args[0] + ` is not a valid operator, use: ` + Object.keys(alias))
                return this.items.every(
                    QueryConstructor[args[1]](args[0], args[2])
                )
        }
        throw new Error('Some argument is invalid, "key" must be a valid function iterator or string.')
    }

    /**
     * @description
     * The forget method removes a specific fields from each element in the collection.
     * @example
     * const collection = new Collection({
     *   name: 'Arcaelas Insiders',
     *   number: 27,
     * });
     * 
     * collection.forget('number');
     * 
     * collection.all();
     * 
     * // {
     * //   name: 'Arcaelas Insiders',
     * // }
    */
    forget(...keys: string[] | string[][]): Collection {
        this.items = this.items.map(item => omit(item, ...keys)) as any[]
        return this
    }

    /**
     * @description
     * The groupBy method groups the collection's items into multiple collections by a given key:
     * @example
     * const collection = new Collection([
     *   {
     *     product: 'Chair',
     *     manufacturer: 'IKEA',
     *   },
     *   {
     *     product: 'Desk',
     *     manufacturer: 'IKEA',
     *   },
     *   {
     *     product: 'Chair',
     *     manufacturer: 'Herman Miller',
     *   },
     * ]);
     * 
     * const grouped = collection.groupBy('manufacturer');
     * 
     * grouped.all();
     * 
     * // {
     * //   IKEA: Collection {
     * //     items: [
     * //        {
     * //          id: 100,
     * //          product: 'Chair',
     * //          manufacturer: 'IKEA',
     * //          price: '1490 NOK',
     * //        },
     * //        {
     * //          id: 150,
     * //          product: 'Desk',
     * //          manufacturer: 'IKEA',
     * //          price: '900 NOK',
     * //        },
     * //      ],
     * //   },
     * //   'Herman Miller': Collection {
     * //     items: [
     * //       {
     * //         id: 200,
     * //         product: 'Chair',
     * //         manufacturer: 'Herman Miller',
     * //         price: '9990 NOK',
     * //       },
     * //     ],
     * //   },
     * // }
     * 
     * @description
     * In addition to passing a string key, you may also pass a callback. The callback should return the value you wish to key the group by:
     * @example
     * const collection = new Collection([
     *   {
     *     product: 'Chair',
     *     manufacturer: 'IKEA',
     *   },
     *   {
     *     product: 'Desk',
     *     manufacturer: 'IKEA',
     *   },
     *   {
     *     product: 'Chair',
     *     manufacturer: 'Herman Miller',
     *   },
     * ]);
     * 
     * const grouped = collection.groupBy((item, key) => item.manufacturer.substring(0, 3));
     * 
     * grouped.all();
     * 
     * // {
     * //   IKE: Collection {
     * //     items: [
     * //       {
     * //         id: 100,
     * //         product: 'Chair',
     * //         manufacturer: 'IKEA',
     * //         price: '1490 NOK',
     * //       },
     * //       {
     * //         id: 150,
     * //         product: 'Desk',
     * //         manufacturer: 'IKEA',
     * //         price: '900 NOK',
     * //       },
     * //     ],
     * //   },
     * //   Her: Collection {
     * //     items: [
     * //       {
     * //         id: 200,
     * //         product: 'Chair',
     * //         manufacturer: 'Herman Miller',
     * //         price: '9990 NOK',
     * //       },
     * //     ],
     * //   },
     * // }
     * 
     */
    groupBy(key: string): Dictionary<I[]>
    groupBy(iterator: ((item: I, index: number, arr: I[]) => (string | number))): Dictionary<I[]>
    groupBy(handler: any) {
        return groupBy<I>(this.items, handler);
    }

    /**
     * @description
     * Wrap element in X number of items and return specific page.
     * @example
     * collection.paginate(1, 20);
     * 
     * {
     *  items: [],
     *  prev: false, // Previous Page Number
     *  next: 2 // Number of next page
     * }
     */
    paginate(page: number = 1, perPage: number = 20): { items: I[], prev: number | false, next: number | false } {
        const chunks = this.chunk(perPage)
        const pageIndex = Math.max(0, page - 1)
        return {
            items: chunks[pageIndex] || [],
            prev: pageIndex <= 0 ? false : pageIndex,
            next: chunks.length > pageIndex + 1 ? pageIndex + 2 : false,
        };
    }

    /**
     * @description
     * Filter the elements and leave only the elements that contain the indicated unique key.
     * @example
     * const collection = collect([
     *   { name: 'iPhone 6', brand: 'Apple', type: 'phone' },
     *   { name: 'iPhone 5', brand: 'Apple', type: 'phone' },
     *   { name: 'Apple Watch', brand: 'Apple', type: 'watch' },
     *   { name: 'Galaxy S6', brand: 'Samsung', type: 'phone' },
     *   { name: 'Galaxy Gear', brand: 'Samsung', type: 'watch' },
     * ]);
     * const unique = collection.unique('brand');
     * const unique = unique.unique(item=> item.brand);
     * unique.all();
     * // [
     * //   { name: 'iPhone 6', brand: 'Apple', type: 'phone' },
     * //   { name: 'Galaxy S6', brand: 'Samsung', type: 'phone' },
     * // ]
     */
    unique(key: string): Collection<I>
    unique(iterator: (item: I, index: number, arr: I[]) => any): Collection<I>
    unique(handler: any) {
        return this.collect(uniqBy(this.items, handler));
    }

    /**
     * @description
     * The first method returns the first element in the collection that passes a given truth test:
     * @example
     * collection.first((item, index, array)=>{
     *  return item.value || index => 1
     * })
     * @description
     * You may also call the first method with no arguments to get the first element in the collection. If the collection is empty, null is returned:
     * @example
     * collection.first() // {}
     */
    first(): I | null
    first(query: Query): I | null
    first(iterator: (item: I, index: number, arr: I[]) => boolean): I | null
    first(handler?: any) {
        return (handler === undefined ? this.items : this.find(handler).all())[0] as I
    }

    /**
     * @description The last method returns the last element in the collection that passes a given truth test:
     * @example
     * collection.last() // Last item
     * collection.last(function (item) {
     *     return item.timestamp > Date.now(); // Last item
     * });
     */
    last(): I | null
    last(query: Query): I | null
    last(iterator: (item: I, index: number, arr: I[]) => boolean): I | null
    last(handler?: any) {
        return handler === undefined ? this.items[this.items.length - 1] : (
            typeof handler === 'function' ? this.items.findLast(handler) : (
                typeof (handler ?? 0) === 'object' ? this.find(handler as Query).all().pop() : null
            )
        )
    }

    /**
     * @description The where method filters the collection by a given key / value pair:
     * @example
     * collection.where('discounted', false);
     * @description When working with nested objects where() method allows dot notated keys.
     * @example
     * // The "where" method also allows for custom comparisons:
     * collection.where('product.category', 'office-supplies')
     * @description Non-identity / strict inequality (!==)
     * @example
     * collection.where('price', '!==', 100);
     * @description Less than operator (<)
     * @example
     * collection.where('price', '<', 100);
     * @description Less than or equal operator (<=)
     * @example
     * collection.where('price', '<=', 100);
     * @description Greater than operator (>)
     * @example
     * collection.where('price', '>', 100);
     * @description Greater or equal than operator (>)
     * @example
     * collection.where('price', '>=', 100);
     */
    where(key: string, value: Inmutables): Collection<I>;
    where(key: string, operator: Operator, value: Inmutables): Collection<I>;
    where(...props: any[]): Collection<I> {
        let [key, operator, value] = props;
        value = props.length >= 3 ? value : operator
        operator = props.length >= 3 ? operator : "$eq"
        if (!(operator in alias))
            throw new Error("Unexpected value for the search operator.")
        return this.find({ [key]: { [operator]: value } } as any)
    }

    /**
     * @description The whereNot method filters the collection that object when not match by a given key / value pair:
     * @example
     * collection.whereNot('discounted', false);
     * @description When working with nested objects whereNot() method allows dot notated keys.
     * @example
     * // The "whereNot" method also allows for custom comparisons:
     * collection.whereNot('product.category', 'office-supplies')
     * @description Non-identity / strict inequality (!=)
     * @example
     * collection.whereNot('price', '!=', 100);
     * @description Less than operator (<)
     * @example
     * collection.whereNot('price', '<', 100);
     * @description Less than or equal operator (<=)
     * @example
     * collection.whereNot('price', '<=', 100);
     * @description Greater than operator (>)
     * @example
     * collection.whereNot('price', '>', 100);
     * @description Greater or equal than operator (>)
     * @example
     * collection.whereNot('price', '>=', 100);
     */
    whereNot(key: string, value: Inmutables): Collection<I>;
    whereNot(key: string, operator: Operator, value: Inmutables): Collection<I>;
    whereNot(...props: any[]): Collection<I> {
        let [key, operator, value] = props;
        value = props.length >= 3 ? value : operator
        operator = props.length >= 3 ? operator : "$eq"
        if (!(operator in alias))
            throw new Error("Unexpected value for the search operator.")
        return this.find({ [key]: { $not: { [operator]: value } } } as any)
    }

    /**
     * @description Filter the elements of the collection using Functions and Queries, some of the examples could be:
     * @description NOTE: It is important to use "$" to refer to a property based query.
     * @example
     * collection.find(item=>{
     *  return item.age >= 18;
     * });
     * // or
     * collection.find({
     *  age:{ $gte: 18 }
     * });
     * @example
     * collection.find({
     *  name: /Alejandro/,
     *  skills:{
     *      $contains: "Liberty"
     *  },
     *  gender:{
     *      $not:{
     *          $in: ['animal','fruit'],
     *      }
     *  },
     *  work:{
     *      $not:{
     *          $in: ["work", "without", "coffe"]
     *      }
     *  }
     * });
     */
    find(query: Query): Collection<I>
    find(iterator: (item: I, index: number, arr: I[]) => boolean): Collection<I>
    find(handler: any) {
        return this.collect(this.items.filter(typeof handler === 'function' ? handler : (
            typeof (handler ?? 0) === 'object' ? new QueryConstructor(handler) : (() => false)
        )))
    }

    /**
     * @description Filter the elements of the collection using Functions and Queries, some of the examples could be:
     * NOTE: It is important to use double "$" ($$) to refer to a property based query.
     * @example
     * // all items with 17 or minor
     * collection.not(item=>{
     *  return item.age >= 18;
     * });
     * // or
     * collection.not({
     *  age:{ $gte: 18 }
     * });
     * 
     * @example
     * collection.not({
     *  name: /Alejandro/,
     *  gender:{
     *      $not:{
     *          $in: ['animal','fruit']
     *      },
     *  },
     *  skills:{
     *      $contains: "Liberty"
     *  },
     *  work:{
     *      $not:{
     *          $in: ["work", "without", "coffe"]
     *      }
     *  }
     * });
     */
    not(query: Query): Collection<I>
    not(iterator: (item: I, index: number, arr: I[]) => boolean): Collection<I>
    not(handler: any) {
        return this.collect(this.items.filter(typeof handler === 'function' ? handler : (
            typeof (handler ?? 0) === 'object' ? new QueryConstructor({ $not: handler } as Query) : (() => false)
        )))
    }

    /**
     * @description
     * Updates information for items that match a specific or general filter expression.
     * @example
     * // set all "item.status" to "false"
     * collection.update({ status: false })
     * 
     * // Filtering
     * collection.update({
     *  expireAt: { 
     *      $lte: new Date() // where expireAt is past
     *  }
     * }, {
     *  online: false // Set online to false
     * })
     */
    update<T = I>(set: T): { before: I, after: I }[]
    update<T = I>(where: Query, set: T): { before: I, after: I }[]
    update(...args: any[]) {
        let output: any[] = [],
            set = args.length === 1 ? args[0] : args[1],
            where = args.length === 1 ? () => true : new QueryConstructor(args[0])
        for (const item of this.items)
            if (where(item))
                output.push({ before: clone(item), after: merge(item, set) })
        return output
    }

    /**
     * @description
     * Remove matched elementos from collection
     * NOTE: This method mutate collection
     * @example
     * collection.delete({ deletedAt: { $exists: true } })
     * 
     * @returns {number} - Deleted elements count.
     */
    delete(where: Query) {
        const length = this.items.length
        this.items = this.not(where).all()
        return length - this.items.length
    }

}

export { Collection }