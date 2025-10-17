# Transformation Methods

Methods for transforming, sorting, and restructuring collection data. These methods modify the structure or order of elements in the collection.

## Overview

Transformation methods are divided into two categories:

**Immutable Methods** (return new Collection):
- `map()` - Transform elements
- `unique()` - Filter duplicates
- `collect()` - Clone collection
- `chunk()` - Divide into groups

**Mutating Methods** (modify original Collection):
- `sort()` - Reorder elements
- `forget()` - Remove properties from elements

**Navigation Methods**:
- `paginate()` - Extract page slice with metadata

## map()

### `map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?): U[]`

Transforms each element using a mapping function. Inherits native Array.map() behavior.

**Type Parameters:**

- `U` - Type of transformed elements

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `callbackfn` | `(value: T, index: number, array: T[]) => U` | Yes | Function to transform each element |
| `thisArg` | `any` | No | Value to use as `this` when executing callback |

**Returns:** `U[]` - New array of transformed elements

**Example - Transform to different structure:**

```typescript
interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

const users = new Collection<User>([
  { id: 1, firstName: "John", lastName: "Doe", age: 30 },
  { id: 2, firstName: "Jane", lastName: "Smith", age: 25 }
]);

const displayNames = users.map(user =>
  `${user.firstName} ${user.lastName} (${user.age})`
);
// ["John Doe (30)", "Jane Smith (25)"]
```

**Example - Extract single property:**

```typescript
const emails = users.map(user => user.email);
// ["john@example.com", "jane@example.com"]
```

**Example - Transform with index:**

```typescript
const numbered = users.map((user, index) => ({
  ...user,
  position: index + 1
}));
// [{ id: 1, ..., position: 1 }, { id: 2, ..., position: 2 }]
```

**Note:** This method does not return a Collection instance. Use `.collect()` after map if you need Collection methods:

```typescript
const transformed = users
  .map(user => ({ ...user, displayName: `${user.firstName} ${user.lastName}` }))
  .collect()
  .filter({ age: { $gte: 18 } });
```

---

## sort()

### `sort(): this`
### `sort(key: string, direction?: 'asc' | 'desc'): this`
### `sort(compareFn: (a: T, b: T) => number): this`

Sorts elements in place. This method **mutates** the collection.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | `string` | - | Field key to sort by (supports dot notation) |
| `direction` | `'asc' \| 'desc'` | `'asc'` | Sort direction |
| `compareFn` | `(a: T, b: T) => number` | - | Custom comparator function |

**Returns:** `this` - The mutated collection (for chaining)

**Example - Sort by key ascending:**

```typescript
const products = new Collection([
  { name: "Laptop", price: 1200 },
  { name: "Mouse", price: 25 },
  { name: "Keyboard", price: 75 }
]);

products.sort('price');
// [{ name: "Mouse", price: 25 }, { name: "Keyboard", price: 75 }, { name: "Laptop", price: 1200 }]
```

**Example - Sort by key descending:**

```typescript
products.sort('price', 'desc');
// [{ name: "Laptop", price: 1200 }, { name: "Keyboard", price: 75 }, { name: "Mouse", price: 25 }]
```

**Example - Sort with dot notation:**

```typescript
const users = new Collection([
  { name: "Alice", profile: { score: 95 } },
  { name: "Bob", profile: { score: 87 } }
]);

users.sort('profile.score', 'desc');
// [{ name: "Alice", profile: { score: 95 } }, { name: "Bob", profile: { score: 87 } }]
```

**Example - Custom comparator:**

```typescript
products.sort((a, b) => {
  // Sort by price, then by name
  if (a.price !== b.price) {
    return a.price - b.price;
  }
  return a.name.localeCompare(b.name);
});
```

**Example - Sort with undefined handling:**

```typescript
const items = new Collection([
  { id: 1, priority: 10 },
  { id: 2, priority: undefined },
  { id: 3, priority: 5 }
]);

items.sort('priority', 'asc');
// Undefined values are pushed to end in ascending, start in descending
```

**Mutability Note:**

```typescript
const original = new Collection([3, 1, 2]);
const sorted = original.sort();

console.log(original);  // [1, 2, 3] - MODIFIED
console.log(sorted === original);  // true - Same instance
```

To sort without mutation:

```typescript
const sorted = original.collect().sort();  // Clone first
console.log(original);  // [3, 1, 2] - Unchanged
```

---

## unique()

### `unique(key: string): Collection<T, V>`
### `unique(iterator: (item: T, index: number, arr: V[]) => any): Collection<T, V>`

Returns a new collection with only unique elements based on key or function. This method is **immutable**.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key to determine uniqueness (supports dot notation) |
| `iterator` | `(item: T, index: number, arr: V[]) => any` | Function returning unique identifier |

**Returns:** `Collection<T, V>` - New collection with unique elements

**Example - Unique by key:**

```typescript
const products = new Collection([
  { name: 'iPhone 6', brand: 'Apple', type: 'phone' },
  { name: 'iPhone 5', brand: 'Apple', type: 'phone' },
  { name: 'Apple Watch', brand: 'Apple', type: 'watch' },
  { name: 'Galaxy S6', brand: 'Samsung', type: 'phone' },
  { name: 'Galaxy Gear', brand: 'Samsung', type: 'watch' }
]);

const uniqueBrands = products.unique('brand');
// [
//   { name: 'iPhone 6', brand: 'Apple', type: 'phone' },
//   { name: 'Galaxy S6', brand: 'Samsung', type: 'phone' }
// ]
```

**Example - Unique by function:**

```typescript
const uniqueByType = products.unique(item => item.type);
// [
//   { name: 'iPhone 6', brand: 'Apple', type: 'phone' },
//   { name: 'Apple Watch', brand: 'Apple', type: 'watch' }
// ]
```

**Example - Unique by composite key:**

```typescript
const uniqueByBrandType = products.unique(item =>
  `${item.brand}-${item.type}`
);
// All 4 items (Apple-phone, Apple-watch, Samsung-phone, Samsung-watch)
```

**Example - Unique emails (case-insensitive):**

```typescript
const users = new Collection([
  { email: 'JOHN@EXAMPLE.COM' },
  { email: 'john@example.com' },
  { email: 'jane@example.com' }
]);

const uniqueUsers = users.unique(user =>
  user.email.toLowerCase()
);
// 2 items (duplicate emails removed)
```

**Immutability Note:**

```typescript
const original = new Collection([1, 2, 2, 3]);
const unique = original.unique(x => x);

console.log(original.length);  // 4 - Unchanged
console.log(unique.length);    // 3 - New collection
```

---

## forget()

### `forget(...keys: string[]): this`

Removes specific fields from each element in the collection. This method **mutates** the collection.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `keys` | `string[]` | Field keys to remove (supports dot notation) |

**Returns:** `this` - The mutated collection (for chaining)

**Example - Remove single field:**

```typescript
const users = new Collection([
  { id: 1, name: 'Alice', password: 'secret123', token: 'abc' },
  { id: 2, name: 'Bob', password: 'pass456', token: 'def' }
]);

users.forget('password');
// [
//   { id: 1, name: 'Alice', token: 'abc' },
//   { id: 2, name: 'Bob', token: 'def' }
// ]
```

**Example - Remove multiple fields:**

```typescript
users.forget('password', 'token', 'internal_id');
// Only keeps: id, name
```

**Example - Remove nested fields:**

```typescript
const data = new Collection([
  {
    name: 'Alice',
    profile: {
      email: 'alice@example.com',
      secret: 'hidden',
      phone: '123-456'
    }
  }
]);

data.forget('profile.secret');
// Removes only profile.secret, keeps profile.email and profile.phone
```

**Example - Sanitize for API response:**

```typescript
const sanitized = users
  .filter({ active: true })
  .forget('password', 'token', 'ssn', 'credit_card');

return sanitized;  // Safe to send to client
```

**Mutability Note:**

```typescript
const original = new Collection([
  { name: 'Alice', password: 'secret' }
]);

original.forget('password');

console.log(original);
// [{ name: 'Alice' }] - password removed from original
```

To forget without mutation:

```typescript
const sanitized = original.collect().forget('password');
console.log(original);  // Still has password field
```

---

## collect()

### `collect<I extends T>(items?: T[]): Collection<T, V>`

Clones the collection instance, preserving all custom macros. Optionally initializes with new items. This method is **immutable**.

**Type Parameters:**

- `I extends T` - Type constraint for new items

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `items` | `T[]` | `[]` | Optional array of items for new collection |

**Returns:** `Collection<T, V>` - New collection instance with same prototype

**Example - Clone empty:**

```typescript
const users = new Collection([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

const empty = users.collect();
console.log(empty.length);  // 0
```

**Example - Clone with new items:**

```typescript
const newUsers = users.collect([
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Diana' }
]);

console.log(newUsers.length);  // 2
console.log(users.length);     // 2 - Original unchanged
```

**Example - Preserve macros:**

```typescript
users.macro('activeOnly', function() {
  return this.filter({ active: true });
});

const clone = users.collect();
clone.activeOnly();  // Macro available on clone
```

**Example - Safe mutation pattern:**

```typescript
// Want to mutate but keep original
const processed = users
  .collect()              // Clone first
  .forget('password')     // Now safe to mutate
  .delete({ inactive: true });

console.log(users.length);      // Original unchanged
console.log(processed.length);  // Modified clone
```

**Use Cases:**

1. **After Array methods** - Restore Collection interface:
   ```typescript
   const transformed = users
     .map(user => ({ ...user, displayName: user.name }))
     .collect()           // Convert array back to Collection
     .filter({ age: { $gte: 18 } });
   ```

2. **Clone before mutation**:
   ```typescript
   const sorted = users.collect().sort('name');
   // users remains unsorted
   ```

3. **Create related collection**:
   ```typescript
   const activeUsers = users.collect(
     users.filter({ active: true })
   );
   ```

---

## chunk()

### `chunk(size: number): T[][]`

Breaks the collection into multiple smaller arrays of a given size. Returns a plain array (not Collection).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `size` | `number` | Size of each chunk (must be > 0) |

**Returns:** `T[][]` - Array of arrays, each containing `size` elements (last chunk may be smaller)

**Example - Basic chunking:**

```typescript
const numbers = new Collection([1, 2, 3, 4, 5, 6, 7]);

const chunks = numbers.chunk(3);
// [[1, 2, 3], [4, 5, 6], [7]]
```

**Example - Process in batches:**

```typescript
const users = new Collection(/* 1000 users */);

const batches = users.chunk(100);

for (const batch of batches) {
  await processBatch(batch);  // Process 100 at a time
}
```

**Example - Paginate display:**

```typescript
const products = new Collection(/* 50 products */);

const pages = products.chunk(10);

pages.forEach((page, index) => {
  console.log(`Page ${index + 1}:`, page);
});
```

**Example - Chunk by column layout:**

```typescript
const items = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9]);

const columns = items.chunk(3);
// Column 1: [1, 2, 3]
// Column 2: [4, 5, 6]
// Column 3: [7, 8, 9]
```

**Example - Split work across workers:**

```typescript
const tasks = new Collection(/* large task list */);
const workerCount = 4;
const chunkSize = Math.ceil(tasks.length / workerCount);

const workloads = tasks.chunk(chunkSize);

workloads.forEach((workload, i) => {
  workers[i].postMessage(workload);
});
```

**Edge Cases:**

```typescript
// Empty collection
new Collection([]).chunk(5);  // []

// Chunk size larger than collection
new Collection([1, 2]).chunk(10);  // [[1, 2]]

// Chunk size of 1
new Collection([1, 2, 3]).chunk(1);  // [[1], [2], [3]]
```

**Note:** Returns plain arrays, not Collection instances. To get Collections:

```typescript
const chunks = items.chunk(3).map(chunk => new Collection(chunk));
```

---

## paginate()

### `paginate(page?: number, perPage?: number): { items: T[]; prev: number | false; next: number | false }`

Paginates the collection and returns items for a specific page with navigation metadata.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-indexed) |
| `perPage` | `number` | `20` | Items per page |

**Returns:** Object with pagination data:

| Property | Type | Description |
|----------|------|-------------|
| `items` | `T[]` | Items for the requested page |
| `prev` | `number \| false` | Previous page number, or `false` if on first page |
| `next` | `number \| false` | Next page number, or `false` if on last page |

**Example - Basic pagination:**

```typescript
const users = new Collection([
  /* 100 users */
]);

const page1 = users.paginate(1, 20);
// {
//   items: [/* first 20 users */],
//   prev: false,
//   next: 2
// }

const page2 = users.paginate(2, 20);
// {
//   items: [/* users 21-40 */],
//   prev: 1,
//   next: 3
// }
```

**Example - Navigate pages:**

```typescript
let currentPage = 1;
let result = users.paginate(currentPage, 10);

while (result.next) {
  console.log(`Page ${currentPage}:`, result.items);
  currentPage = result.next;
  result = users.paginate(currentPage, 10);
}
```

**Example - API endpoint:**

```typescript
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 20;

  const users = new Collection(await db.users.findAll());
  const paginated = users.paginate(page, perPage);

  res.json({
    data: paginated.items,
    pagination: {
      current_page: page,
      per_page: perPage,
      prev_page: paginated.prev,
      next_page: paginated.next,
      total: users.length
    }
  });
});
```

**Example - Combined with filtering:**

```typescript
const activeUsers = users
  .filter({ active: true })
  .sort('created_at', 'desc')
  .paginate(1, 50);

console.log(activeUsers.items);  // First 50 active users
```

**Example - Check if last page:**

```typescript
const result = users.paginate(5, 20);

if (!result.next) {
  console.log('This is the last page');
}

if (!result.prev) {
  console.log('This is the first page');
}
```

**Edge Cases:**

```typescript
// Empty collection
new Collection([]).paginate(1, 20);
// { items: [], prev: false, next: false }

// Page beyond available
new Collection([1, 2, 3]).paginate(10, 20);
// { items: [], prev: 9, next: false }

// perPage larger than collection
new Collection([1, 2, 3]).paginate(1, 100);
// { items: [1, 2, 3], prev: false, next: false }
```

**Calculating Total Pages:**

```typescript
const perPage = 20;
const totalPages = Math.ceil(users.length / perPage);

const lastPage = users.paginate(totalPages, perPage);
console.log(lastPage.next);  // false
```

## Method Chaining

Transformation methods can be chained for fluent data processing:

```typescript
const result = users
  .filter({ verified: true })    // Filtering
  .unique('email')                // Remove duplicates
  .forget('password', 'token')    // Remove sensitive fields
  .sort('created_at', 'desc')     // Sort newest first
  .paginate(1, 20);               // Get first page

// Process results
result.items.forEach(user => {
  console.log(user);
});
```

## Mutability Reference

**Mutating Methods** (modify original):
- `sort()` - Reorders elements in place
- `forget()` - Removes properties from elements

**Immutable Methods** (return new Collection):
- `map()` - Returns new array (not Collection)
- `unique()` - Returns new Collection
- `collect()` - Returns new Collection instance
- `chunk()` - Returns plain arrays
- `paginate()` - Returns plain object with arrays

**Safe Mutation Pattern:**

```typescript
// Clone first to avoid mutating original
const processed = users
  .collect()              // Clone
  .forget('password')     // Safe to mutate clone
  .sort('name', 'asc');   // Safe to mutate clone

// Original unchanged
console.log(users);  // Still has password, unsorted
```

## See Also

- [Filtering Methods](filtering-methods.md) - Filter and find elements
- [Aggregation Methods](aggregation-methods.md) - Sum, count, group elements
- [Utility Methods](utility-methods.md) - Update, delete, debug
- [Best Practices](../guides/best-practices.md) - Method chaining patterns
