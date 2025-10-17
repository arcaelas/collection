# AsyncCollection Class

Complete API reference for the AsyncCollection class - a deferred query builder for creating abstractions over any data source.

## Import

```typescript
import AsyncCollection from "@arcaelas/collection/async";
```

## Constructor

### `new AsyncCollection<T, V>(executor, validators?)`

Creates a new AsyncCollection instance with a custom executor function.

**Type Parameters:**

- `T` - Type of elements in the collection
- `V` - Type of custom validators (optional)

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `executor` | `Executor<T, V>` | Yes | Function that processes operations and returns results |
| `validators` | `V` | No | Custom validators for extending query operators |

**Example:**

```typescript
const users = new AsyncCollection<User>(
  async ({ operations, validators, metadata }) => {
    console.log(`Processing ${metadata.operation_count} operations`);
    return await processOperations(operations);
  }
);
```

## Type Definitions

### `Executor<T, V>`

Function type for the executor that processes the context.

```typescript
type Executor<T = any, V = any> = (
  context: ExecutorContext<T, V>
) => T | T[] | Promise<T | T[]>;
```

**Parameters:**

- `context` - ExecutorContext containing operations, validators, and metadata

**Returns:**

- Single item `T`, array of items `T[]`, or Promise of either

### `ExecutorContext<T, V>`

Context object passed to the executor function.

```typescript
interface ExecutorContext<T = any, V = any> {
  operations: [string, ...any[]][];
  validators?: V;
  metadata: {
    created_at: Date;
    operation_count: number;
    chain_depth: number;
  };
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `operations` | `[string, ...any[]][]` | Array of registered operations in format `[method_name, ...args]` |
| `validators` | `V` | Custom validators provided in constructor |
| `metadata.created_at` | `Date` | Timestamp when context was created |
| `metadata.operation_count` | `Number` | Total number of registered operations |
| `metadata.chain_depth` | `Number` | Depth of method chain (same as operation_count) |

## Thenable Implementation

AsyncCollection implements the Thenable interface, making it awaitable.

### `then(onfulfilled?, onrejected?)`

Implements Promise.then() for async execution.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `onfulfilled` | `(value: any) => TResult1` | Optional callback when resolved |
| `onrejected` | `(reason: any) => TResult2` | Optional callback when rejected |

**Returns:** `Promise<TResult1 | TResult2>`

**Example:**

```typescript
users
  .where('active', true)
  .then(results => console.log(results))
  .catch(error => console.error(error));

// Or with await
const results = await users.where('active', true);
```

### `catch(onrejected?)`

Implements Promise.catch() for error handling.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `onrejected` | `(reason: any) => TResult` | Optional error handler |

**Returns:** `Promise<TResult>`

**Example:**

```typescript
users
  .where('age', '>=', 18)
  .catch(error => {
    console.error('Query failed:', error);
    return [];
  });
```

### `finally(onfinally?)`

Implements Promise.finally() for cleanup.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `onfinally` | `() => void` | Optional cleanup callback |

**Returns:** `Promise<any>`

**Example:**

```typescript
users
  .where('active', true)
  .finally(() => {
    console.log('Query completed');
  });
```

## Filtering Methods

### `where(key, value)`
### `where(key, operator, value)`

Filters collection using where operator with comparisons.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key to compare (supports dot notation) |
| `operator` | `string` | Optional comparison operator: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `includes` |
| `value` | `any` | Value to compare against |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.where('age', '>=', 18)
users.where('status', 'active')  // operator '=' by default
users.where('user.profile.verified', true)
```

### `whereNot(key, value)`
### `whereNot(key, operator, value)`

Inverse filter - excludes matching items.

**Parameters:** Same as `where()`

**Returns:** `this` (chainable)

**Example:**

```typescript
users.whereNot('deleted', true)
users.whereNot('age', '<', 18)
```

### `filter(handler)`

Filters elements using a function or Query object.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Filter function or query object |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.filter(user => user.age >= 18)
users.filter({ age: { $gte: 18 }, status: 'active' })
```

### `not(handler)`

Inverse filter - excludes matching items.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Filter function or query object |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.not(user => user.deleted)
users.not({ deleted: true })
```

## Finding Methods

### `first(handler?)`

Gets the first element matching the criteria.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Optional filter function or query object |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.where('age', '>=', 18).first()
users.first(user => user.active)
users.first({ status: 'active' })
```

### `last(handler?)`

Gets the last element matching the criteria.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Optional filter function or query object |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.where('age', '>=', 18).last()
users.last(user => user.active)
```

### `find(handler)`

Finds first element matching criteria (alias for `first()`).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Filter function or query object |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.find(user => user.email === 'test@example.com')
users.find({ email: 'test@example.com' })
```

### `every(handler, value?)`

Verifies all elements meet the criteria.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `Function \| Object \| string` | Validation function, query object, or key string |
| `value` | `any` | Optional value to compare (when handler is string) |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.every(user => user.age >= 18)
users.every({ active: true })
users.every('status', 'active')
```

## Transformation Methods

### `map(handler)`

Transforms each element using a mapping function.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `(item: T, index: number, arr: T[]) => any` | Transformation function |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.map(user => ({ ...user, displayName: `${user.name} (${user.age})` }))
users.map(user => user.email)
```

### `each(fn)`

Iterates over each element executing a callback.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(item: T, index: number, arr: T[]) => any` | Callback for each element (return `false` to stop) |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.each((user, index) => {
  console.log(user);
  if (index >= 10) return false; // Stop after 10
})
```

### `forget(...keys)`

Removes specific fields from each element.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `keys` | `string[]` | Field keys to remove |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.forget('password', 'token')
users.forget('secret', 'internal_id')
```

## Sorting Methods

### `sort(handler?, direction?)`

Sorts elements by key or comparator function.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `string \| ((a: T, b: T) => number)` | Field key or comparator function |
| `direction` | `'asc' \| 'desc'` | Sort direction (when handler is string) |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.sort('price', 'desc')
users.sort((a, b) => a.price - b.price)
```

### `reverse()`

Reverses the order of elements.

**Returns:** `this` (chainable)

**Example:**

```typescript
users.reverse()
```

### `shuffle()`

Randomly shuffles elements.

**Returns:** `this` (chainable)

**Example:**

```typescript
users.shuffle()
```

### `random(length?)`

Gets random elements from the collection.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `length` | `number` | `Infinity` | Number of random elements to get |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.random(5)  // Get 5 random users
users.random()   // Get all in random order
```

## Slicing & Chunking Methods

### `slice(start, end?)`

Gets a slice of the collection.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `start` | `number` | Start index |
| `end` | `number` | Optional end index |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.slice(0, 10)   // First 10
users.slice(10, 20)  // Items 10-20
users.slice(5)       // From index 5 to end
```

### `chunk(size)`

Divides collection into chunks of specified size.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `size` | `number` | Size of each chunk |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.chunk(10)  // Divide into groups of 10
```

### `paginate(page?, perPage?)`

Paginates results.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-indexed) |
| `perPage` | `number` | `20` | Items per page |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.paginate(1, 20)  // First page, 20 items
users.paginate(2, 50)  // Second page, 50 items
```

## Aggregation Methods

### `sum(handler)`

Sums values of a key or function.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => number)` | Field key or function returning numeric value |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.sum('price')
users.sum(user => user.price * user.quantity)
```

### `max(key)`

Gets maximum value of a key.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.max('age')
users.max('score')
```

### `min(key)`

Gets minimum value of a key.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.min('age')
users.min('price')
```

### `groupBy(handler)`

Groups elements by key or function.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => string \| number)` | Field key or grouping function |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.groupBy('category')
users.groupBy(user => user.date.getFullYear())
```

### `countBy(handler)`

Counts elements grouped by key or function.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => string \| number)` | Field key or grouping function |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.countBy('status')  // { active: 10, inactive: 5 }
users.countBy(user => user.age >= 18 ? 'adult' : 'minor')
```

## Utility Methods

### `unique(handler)`

Gets only unique elements by key or function.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => any)` | Field key or function returning unique identifier |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.unique('email')
users.unique(user => user.user_id)
```

### `update(where, set?)`

Updates elements matching criteria.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `where` | `Object \| Function` | Query object or filter function (optional) |
| `set` | `Object \| Function` | Fields to update or update function |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.update({ active: false }, { deletedAt: new Date() })
users.update({ deletedAt: new Date() })  // Update all
```

### `delete(where)`

Deletes elements matching criteria.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `where` | `Object \| Function` | Query object or filter function |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.delete({ deleted: true })
users.delete(user => user.inactive)
```

### `collect(items?)`

Clones current context with optional items.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `items` | `T[]` | Optional items for new collection |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.collect([...newData])
users.collect()  // Clone without items
```

## Debugging Methods

### `dump()`

Prints collection to console for debugging.

**Returns:** `this` (chainable)

**Example:**

```typescript
users
  .filter({ active: true })
  .dump()  // Prints to console
  .sort('age', 'desc');
```

### `dd()`

Dumps collection and exits process (Node.js only).

**Returns:** `this` (chainable)

**Example:**

```typescript
users.dd();  // Dumps and exits
```

### `stringify(replacer?, space?)`

Converts collection to JSON string.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `replacer` | `(key: string, value: any) => any` | Optional JSON replacer function |
| `space` | `string \| number` | Optional spacing for formatting |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.stringify(null, 2)  // Pretty printed JSON
users.stringify()         // Compact JSON
```

## Extension Methods

### `macro(key, handler)`

Registers a custom macro (method extension).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Name of custom method |
| `handler` | `Function` | Custom method implementation |

**Returns:** `this` (chainable)

**Example:**

```typescript
users.macro('activeOnly', function() {
  return this.where('status', 'active');
})

// Usage
await users.activeOnly();
```

## Usage Examples

### With Prisma

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  const where: any = {};
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, op, val] = args.length === 3 ? args : [args[0], '=', args[1]];
      where[key] = op === '>=' ? { gte: val } : val;
    }
  });
  return await prisma.user.findMany({ where });
});

await users.where('age', '>=', 18);
```

### With TypeORM

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  const qb = getRepository(User).createQueryBuilder('user');
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      qb.andWhere(`user.${args[0]} = :${args[0]}`, { [args[0]]: args[1] });
    }
  });
  return await qb.getMany();
});

await users.where('status', 'active');
```

### With REST API

```typescript
const api = new AsyncCollection(async ({ operations }) => {
  const params = new URLSearchParams();
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      params.append(args[0], args[1]);
    }
  });
  const response = await fetch(`/api/users?${params}`);
  return await response.json();
});

await api.where('status', 'active');
```

## See Also

- [AsyncCollection Guide](../guides/async-collection.md) - Introduction and concepts
- [Usage Examples](../examples/async-collection-usage.md) - Real-world examples
- [TypeScript Usage](../advanced/typescript-usage.md) - Type safety patterns
