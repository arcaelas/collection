import { Dictionary, groupBy, omit, uniqBy } from 'lodash'
import { type IObject, type Noop, get, has, merge, Bind, Inmutables, Query, query, source, } from '@arcaelas/utils'

type Operator = keyof typeof alias

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


export default class Collection<I, M = {}> extends Array<I> {

    [K: string]: any
    private readonly query: (query: Query<M>) => (item: Partial<I>) => boolean = null as any
    constructor(items?: Collection | I | I[], validator: M = {} as any) {
        super(0)
        Object.defineProperty(this, 'query', {
            enumerable: false,
            value: query(validator)
        })
        super.push(...[].concat(arguments.length ? items : [] as any))
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
    static macro(key: string, value: Bind<Collection, Noop<any[], any>>): Collection {
        (this.prototype ?? this['__proto__'])[key] = value.bind(this as unknown as Collection)
        return this as unknown as Collection
    }

    /**
     * @description
     * The chunk method breaks the collection into multiple, smaller collections of a given size.
     * @example
     * const collection = collect([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.chunk(4);
     * chunks.all(); // [[1, 2, 3, 4], [5, 6, 7]]
     */
    public chunk(size: number) {
        const chunks: I[][] = [];
        for (let i = 0; i < Math.ceil(this.length / size); i++)
            chunks.push(super.slice(i * size, (i + 1) * size))
        return chunks;
    }

    /**
     * @description
     * Clone this Collection instance with all macro added in current instance.
     * @example
     * const clone = items.collect([])
     */
    public collect<T extends IObject = I>(items?: T[]): Collection<T, M> {
        const c = new Collection(items)
        Object.setPrototypeOf(c, Object.getPrototypeOf(this));
        return c as any;
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
    public countBy(key: string): Record<string, number>
    public countBy(executor: (value: I, index: number, arr: I[]) => (string | number)): Record<string, number>
    public countBy(iterator) {
        let handler = iterator
        if (typeof iterator === 'string') handler = i => get(i, iterator)
        const counts = {} as Record<string, number>
        this.forEach((v, i, a) => {
            const key = handler(v, i, a) as string;
            counts[key] ??= 0
            counts[key] += 1
        })
        return counts
    }

    /**
    * @description
    * Print collection and exit.
    */
    public dd() {
        this.dump();
        if (typeof process !== 'undefined')
            process.exit(1);
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
    public delete(where: Query<M>) {
        let length = this.length,
            items = this.not(where)
        super.splice(0, length)
        super.push(...items)
        return length - this.length
    }

    /**
    * @description Print collection and continue.
    */
    public dump() {
        console.log(this);
        return this;
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
    public each(fn: (item: I, index: number, arr: I[]) => any): this {
        for (let index = 0, stop = false; index < this.length && !stop; index += 1)
            stop = fn(this[index], index, this) === false;
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
    public every(key: string): boolean
    public every(query: Query<M>): boolean
    public every(handler: Noop<[item: I, index: number, arr: I[]], boolean>): boolean
    public every(key: string, value: any): boolean
    public every(key: string, operator: Operator, value: any): boolean
    public every(...args: any[]) {
        switch (args.length) {
            case 1:
                switch (typeof (args[0] ?? 0)) {
                    case 'function':
                        return super.every(args[0])
                    case 'string':
                        return super.every(o => has(o, args[0]))
                    case 'object':
                        return this.filter(args[0]).length === this.length
                }
                break
            case 2:
                return super.every(o => get(o, args[0]) === args[1])
            case 3:
                if (!alias[args[1]])
                    throw new TypeError(args[0] + ` is not a valid operator, use: ` + Object.keys(alias))
                return super.every(
                    this.query({ [args[0]]: { [alias[args[1]]]: args[2] } } as any)
                )
        }
        throw new Error('Some argument is invalid, "key" must be a valid function iterator or string.')
    }

    /**
     * @description Filter the elements of the collection using Functions and Queries, some of the examples could be:
     * @description NOTE: It is important to use "$" to refer to a property based query.
     * @example
     * collection.filter(item=>{
     *  return item.age >= 18;
     * });
     * // or
     * collection.filter({
     *  age:{ $gte: 18 }
     * });
     * @example
     * collection.filter({
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
    public filter(query: Query<M>): Collection<I, M>
    public filter(iterator: (item: I, index: number, arr: I[]) => boolean): Collection<I, M>
    public filter(handler: any) {
        return this.collect(super.filter(typeof handler === 'function' ? handler : (
            typeof (handler ?? 0) === 'object' ? this.query(handler) : () => false
        )))
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
    public first(): I | undefined
    public first(query: Query<M>): I | undefined
    public first(iterator: (item: I, index: number, arr: I[]) => boolean): I | undefined
    public first(handler?: any) {
        return super.find(handler === undefined ? () => true : (
            typeof handler === 'function' ? handler : (
                typeof (handler ?? 0) === 'object' ? this.query(handler) : () => false
            )
        ))
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
    public forget(...keys: string[] | string[][]): this {
        const items = super.map(item => omit(item, ...keys)) as any[]
        super.splice(0, this.length)
        super.push(...items)
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
    public groupBy(key: string): Dictionary<I[]>
    public groupBy(iterator: ((item: I, index: number, arr: I[]) => (string | number))): Dictionary<I[]>
    public groupBy(handler: any) {
        return groupBy<I>(this, handler);
    }

    /**
     * @description The last method returns the last element in the collection that passes a given truth test:
     * @example
     * collection.last() // Last item
     * collection.last(function (item) {
     *     return item.timestamp > Date.now(); // Last item
     * });
     */
    public last(): I | undefined
    public last(query: Query<M>): I | undefined
    public last(iterator: (item: I, index: number, arr: I[]) => boolean): I | undefined
    public last(handler?: any) {
        return this.findLast(handler === undefined ? () => true : (
            typeof handler === 'function' ? handler : (
                typeof (handler ?? 0) === 'object' ? this.query(handler) : () => false
            )
        ))
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
    public macro(key: string, handler: Bind<this, Noop<any[], any>>): this {
        return Collection.macro.call(this, key, handler as any) as any
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
    public max(key: string): number {
        if (typeof key !== 'string') throw new Error("type/string");
        return Math.max(...super.map(item => get(item, key, 0)));
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
    public min(key: string): number {
        if (typeof key !== 'string') throw new Error("type/string");
        return Math.min(...super.map(item => get(item, key, 0)));
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
    public not(query: Query<M>): Collection<I, M>
    public not(iterator: (item: I, index: number, arr: I[]) => boolean): Collection<I, M>
    public not(handler: any) {
        return this.collect(super.filter(typeof handler === 'function' ? (...a) => !handler(...a) : (
            typeof (handler ?? 0) === 'object' ? this.query({ $not: handler }) : (() => false)
        )))
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
    public paginate(page: number = 1, perPage: number = 20): { items: I[], prev: number | false, next: number | false } {
        return {
            items: super.slice((page - 1) * perPage, perPage * page),
            prev: page <= 1 ? false : page - 1,
            next: this.length > page * perPage ? page + 1 : false,
        };
    }

    /**
     * @description
     * Get random elements, with the argument "length" the number of elements is indicated.
     */
    public random(length: number = Infinity): I[] {
        return super.sort(() => Math.floor(Math.random() * 0.5)).slice(0, length);
    }

    /**
     * @description
     * This method set items order as random.
     * This method mutate collection, if you wan't mutate collection, must be call {@link Collection.random}
     */
    public shuffle() {
        const items = super.sort(() => Math.floor(Math.random() * 0.5))
        super.splice(0, this.length)
        super.push(...items)
        return this;
    }

    /**
     * @description
     * Sort the elements of the collection (This method mutates the collection).
     */
    public sort(key?: string): this
    public sort(key: string, direction: "asc" | "desc"): this
    public sort(compareFn: ((a: I, b: I) => number)): this
    public sort(...args: any[]) {
        const [handler, ...dir] = args
        return super.sort(typeof handler === 'function' ? handler : (current, next) => {
            next = get(next, handler, undefined) as any;
            current = get(current, handler, undefined) as any;
            return current === undefined ? 0 : (next === undefined ? (dir[0] === "asc" ? 1 : -1) : (
                (current > next ? 1 : -1) * (dir[0] === 'asc' ? 1 : -1)
            ));
        })
    }

    /**
     * @description
     * Converts this Collection to a JavaScript Object Notation (JSON) string.
     * @param replacer A function that transforms the results.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    public stringify(replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
    public stringify(...args: any[]) {
        return JSON.stringify(this, ...args)
    }

    /**
     * @description Sum the elements according to a specific key.
     * @example
     * collection.sum("price");
     * collection.sum(item=> item.price * 0.16);
     */
    public sum(key: string): number;
    public sum<H extends (item: I, index: number, arr: I[]) => number>(iterator: H): number;
    public sum(handler) {
        return super.map(typeof handler === "function" ? handler : item => get(item, handler))
            .filter((e: any) => !isNaN(e))
            .reduce((a, b: any) => a + b, 0)
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
    public unique(key: string): Collection<I, M>
    public unique(iterator: (item: I, index: number, arr: I[]) => any): Collection<I, M>
    public unique(handler: any) {
        return this.collect(uniqBy(this, handler));
    }

    /**
     * @description
     * Updates information for items that match a specific or general filter expression.
     * @example
     * // Simple matches
     * // Update all elements that "online" field is false
     * // Add or replace "deletedAt" field with "new Date()"
     * collection.update({ online: false }, { deletedAt: new Date() })
     * 
     * @example
     * // Most common
     * collect.update({
     *  email: /gmail\.com$/g // all items that email is Gmail Host
     * }, {
     *  email: null, // Set current email to null
     *  prevEmail: "${email}" // Save email in this field
     * })
     */
    public update<T = I>(set: T): number
    public update<T = I>(where: Query<M>, set: T): number
    public update(...args: any[]) {
        let count = 0,
            set = source(args.length === 1 ? args[0] : args[1]),
            where = args.length === 1 ? () => true : this.query(args[0])
        const items = super.map(item => where(item) ? merge(item, set(item), count++) : item)
        super.splice(0, this.length)
        super.push(...items)
        return count
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
    public where(key: string, value: Inmutables): Collection<I, M>;
    public where(key: string, operator: Operator, value: Inmutables): Collection<I, M>;
    public where(...props: any[]) {
        let [key, operator, value] = props;
        value = props.length >= 3 ? value : operator
        operator = props.length >= 3 ? alias[operator] : "$eq"
        if (!operator)
            throw new Error("Unexpected value for the search operator.")
        return this.filter({ [key]: { [operator]: value } } as any)
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
    public whereNot(key: string, value: Inmutables): Collection<I, M>;
    public whereNot(key: string, operator: Operator, value: Inmutables): Collection<I, M>;
    public whereNot(...props: any[]) {
        let [key, operator, value] = props;
        value = props.length >= 3 ? value : operator
        operator = props.length >= 3 ? alias[operator] : "$eq"
        if (!operator)
            throw new Error("Unexpected value for the search operator.")
        return this.filter({ $not: { [key]: { [operator]: value } } } as any)
    }

}


export { Collection }
