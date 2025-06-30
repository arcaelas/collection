![Arcaelas Insiders Banner](https://raw.githubusercontent.com/arcaelas/dist/main/banner/svg/dark.svg#gh-dark-mode-only)

![Arcaelas Insiders Banner](https://raw.githubusercontent.com/arcaelas/dist/main/banner/svg/light.svg#gh-light-mode-only)

# Welcome to Arcaelas Insiders!

Hello, if this is your first time reading the **[Arcaelas Insiders](https://github.com/arcaelas)** **documentation**, let me tell you that you have found a good place to learn.

**Our team** and _community_ are happy to write and make methods simple to implement and understand, but I think you already know that.

> The documentation for this tool is open to edits and suggestions.

Let's start with the basic implementation steps.

```bash
> npm i --save @arcaelas/collection
> yarn add --save @arcaelas/collection
```

## Implementation

```javascript
// Class Import Statement
import Collection from "@arcaelas/Collection";

// Function import statement
import { Collection } from "@arcaelas/collection";

// EsModule
const Collection = require("@arcaelas/collection");
```

## Motivation

In object-oriented programming we find common situations, such as those where we want to order, filter and modify elements of a list, however the "Array Prototypes" are not very complete in some cases, for these situations the **Arcaelas Insiders** team has designed useful tools that allow these actions within "Collections".

### Curiosities

As an interesting part of this tool, we have the B-JSON notation that Atlas implements in its MongoDB database engine, only some of them are implemented here, but we will explain how to extend them and create your own validators.

## Get Started

```typescript
import Collection from "@arcaelas/collection"

const collection = new Collection([ ... ])
```

## Method Reference and Use Cases

### `filter()`

> Filters elements by a callback or Query expression.

```ts
collection.filter((item) => item.age >= 18);
collection.filter({ age: { $gte: 18 } });
collection.filter({
  name: /Alejandro/,
  skills: { $contains: "Liberty" },
  gender: { $not: { $in: ["animal", "fruit"] } },
  work: { $not: { $in: ["work", "without", "coffee"] } },
});
```

### `not()`

> Returns elements that do NOT match the expression.

```ts
collection.not({ online: false });
```

### `first()` / `last()`

> Returns the first or last element that matches a Query or function.

```ts
collection.first({ age: { $gte: 18 } });
collection.last((item) => item.name === "Joe");
```

### `where()` / `whereNot()`

> Shorthand for querying with operator and value.

```ts
collection.where("online", false);
collection.where("age", ">=", 21);
collection.whereNot("role", "admin");
collection.whereNot("price", "<", 100);
```

### `update()`

> Updates elements based on query or globally.

```ts
collection.update({ online: false }, { deletedAt: new Date() });
collection.update({ email: /gmail\.com$/ }, (item) => ({
  prevEmail: item.email,
  email: null,
}));
collection.update((item) => ({ name: item.name.toUpperCase() }));
```

### `delete()`

> Removes matched elements. **Mutates** collection.

```ts
collection.delete({ deletedAt: { $exists: true } });
```

### `collect()`

> Creates a new `Collection` instance preserving prototype.

```ts
collection.collect([ ... ]);
```

### `dd()` / `dump()`

> Debug methods to print and exit or continue.

```ts
collection.dump();
collection.dd();
```

### `max()` / `min()` / `sum()`

> Performs aggregate calculations by key or function.

```ts
collection.max("score");
collection.min("price");
collection.sum("amount");
collection.sum((item) => item.price * 1.18);
```

### `random()` / `shuffle()`

> Returns or mutates with random order.

```ts
collection.random(2);
collection.shuffle();
```

### `chunk()` / `paginate()`

> Splits into chunks or paginates.

```ts
collection.chunk(100);
collection.paginate(1, 50);
```

### `countBy()` / `groupBy()`

> Aggregates by key or iterator.

```ts
collection.countBy("type");
collection.countBy((item) => item.group);
collection.groupBy("status");
collection.groupBy((item) => item.role);
```

### `each()`

> Iterates over elements. `return false` to break.

```ts
collection.each((item) => {
  if (!item.active) return false;
});
```

### `forget()`

> Removes specific fields from each item.

```ts
collection.forget("password", "token");
```

### `unique()`

> Filters to unique values by key or callback.

```ts
collection.unique("email");
collection.unique((item) => item.id);
```

### `macro()` / `Collection.macro()`

> Adds custom methods.

```ts
Collection.macro("pluck", function (key) {
  return this.map((item) => item[key]);
});
collection.pluck("name");
```

### `sort()`

> Sorts the collection by key, direction or comparator function.

```ts
collection.sort("age", "asc");
collection.sort("name", "desc");
collection.sort((a, b) => a.score - b.score);
```

### `every()`

> Verifies that all elements satisfy the expression.

```ts
collection.every("active");
collection.every("score", ">", 0);
collection.every({ verified: true });
collection.every((item) => item.age >= 18);
```

### `stringify()`

> Converts collection to JSON string.

```ts
collection.stringify();
collection.stringify(null, 2);
```

### Native methods preserved

- `concat`, `map`, `pop`, `slice`, `splice`, `shift`, `unshift` are fully supported.

## Collection TypeScript Signature

```ts
Collection<T, V>;
// T = item type
// V = shape for query validation
```

This ensures type-safe autocompletion and query shape consistency.

## Query DSL Aliases

| Alias      | Mongo DSL   | Meaning                     |
| ---------- | ----------- | --------------------------- |
| `=`        | `$eq`       | equal                       |
| `!=`       | `$not`      | not equal                   |
| `>`        | `$gt`       | greater than                |
| `<`        | `$lt`       | less than                   |
| `>=`       | `$gte`      | greater or equal            |
| `<=`       | `$lte`      | less or equal               |
| `in`       | `$in`       | included in array           |
| `includes` | `$includes` | contains substring or value |

## Performance and Best Practices

- Underlying logic delegates to native `Array` methods.
- Query filtering is optimized using precompiled functions.
- Avoid frequent mutation in large collections; prefer `.collect()` clones.
- For secure randomness, override `random()` with your own comparator.

## Contribution Guide

1. Fork and clone this repo.
2. Run `npm install`.
3. Run tests: `npm run test`.
4. Follow conventional commits.

### Available Scripts

| Script          | Description             |
| --------------- | ----------------------- |
| `npm run build` | Compile TS and bundle   |
| `npm run test`  | Run unit tests          |
| `npm run lint`  | Run ESLint and Prettier |

## Roadmap

- [ ] LazyCollection using generators
- [ ] AsyncCollection support for promises/streams
- [ ] Drop lodash dependency
- [ ] YAML/CSV serialization

## License

MIT © 2025 Miguel Alejandro (Miguel Guevara) [miguel.guevara@arcaelas.com](mailto:miguel.guevara@arcaelas.com)

---

<div  style="text-align:center;margin-top:50px;">
	<p  align="center">
		<img  src="https://raw.githubusercontent.com/arcaelas/dist/main/logo/svg/64.svg"  height="32px">
	<p>

Want to discuss any of my open source projects, or something else? Send me a direct message on [Twitter](https://twitter.com/arcaelas).<br> If you already use these libraries and want to support us to continue development, you can sponsor us at [Github Sponsors](https://github.com/sponsors/arcaelas).

</div>
