# Macros

Extend Collection and AsyncCollection with custom methods using macros. Macros allow you to add reusable functionality to collections without modifying the class.

## What are Macros?

Macros are a way to dynamically add custom methods to Collection instances. This is useful for:

- **Creating domain-specific methods** tailored to your application
- **Encapsulating complex queries** into reusable methods
- **Adding utility functions** specific to your data model
- **Building fluent APIs** that match your business logic

## Overview

There are two types of macros:

**Static Macros** - Added to all Collection instances:
```typescript
Collection.macro('methodName', handler);
// Available on ALL collections
```

**Instance Macros** - Added to specific collection instance:
```typescript
collection.macro('methodName', handler);
// Available only on THIS collection
```

## Static Macros

### `Collection.macro(key, value)`

Adds a method to the Collection prototype, making it available to all new and existing instances.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Name of the custom method |
| `value` | `Bind<Collection, Function>` | Function implementation (receives collection as `this`) |

**Returns:** `Collection` - The Collection class (for chaining)

**Example - Simple helper:**

```typescript
Collection.macro('pluck', function(key: string) {
  return this.map(item => item[key]);
});

const users = new Collection([
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 }
]);

const names = users.pluck('name');
// ['Alice', 'Bob']
```

**Example - Complex query:**

```typescript
interface User {
  id: number;
  name: string;
  roles: string[];
  active: boolean;
}

Collection.macro('activeAdmins', function() {
  return this.filter({
    active: true,
    roles: { $contains: 'admin' }
  });
});

const users = new Collection<User>([...]);
const admins = users.activeAdmins();
```

**Example - Chainable transformation:**

```typescript
Collection.macro('toKeyValue', function(keyField: string, valueField: string) {
  return this.reduce((acc, item) => {
    acc[item[keyField]] = item[valueField];
    return acc;
  }, {} as Record<string, any>);
});

const settings = new Collection([
  { key: 'theme', value: 'dark' },
  { key: 'lang', value: 'en' }
]);

const config = settings.toKeyValue('key', 'value');
// { theme: 'dark', lang: 'en' }
```

**Example - Statistical helper:**

```typescript
Collection.macro('average', function(key: string) {
  const total = this.sum(key);
  return total / this.length;
});

const scores = new Collection([
  { student: 'Alice', score: 95 },
  { student: 'Bob', score: 87 },
  { student: 'Charlie', score: 92 }
]);

const avgScore = scores.average('score');
// 91.33
```

**Example - Business logic:**

```typescript
interface Order {
  id: number;
  total: number;
  status: string;
  customerId: number;
}

Collection.macro('revenue', function() {
  return this
    .filter({ status: 'completed' })
    .sum('total');
});

Collection.macro('byCustomer', function(customerId: number) {
  return this.filter({ customerId });
});

const orders = new Collection<Order>([...]);

const totalRevenue = orders.revenue();
const customerOrders = orders.byCustomer(123);
```

## Instance Macros

### `collection.macro(key, handler)`

Adds a method to a specific collection instance only.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Name of the custom method |
| `handler` | `Bind<this, Function>` | Function implementation |

**Returns:** `this` - The collection instance (for chaining)

**Example - Instance-specific logic:**

```typescript
const products = new Collection([...]);

products.macro('inStock', function() {
  return this.filter({ stock: { $gt: 0 } });
});

products.macro('featured', function() {
  return this.filter({ featured: true }).sort('priority', 'desc');
});

const available = products.inStock();
const highlights = products.featured();

// These methods ONLY exist on 'products' collection
const otherProducts = new Collection([...]);
otherProducts.inStock();  // ❌ Error: method doesn't exist
```

**Example - Temporary helper:**

```typescript
const temp = new Collection(data);

temp.macro('process', function() {
  return this
    .filter({ valid: true })
    .unique('id')
    .sort('timestamp', 'desc');
});

const result = temp.process();
// Method only exists during this scope
```

## TypeScript Support

Extend the Collection interface to get type safety:

**Declaration Merging:**

```typescript
declare module '@arcaelas/collection' {
  interface Collection<T> {
    activeOnly(): Collection<T>;
    pluck<K extends keyof T>(key: K): T[K][];
    average(key: keyof T): number;
  }
}

Collection.macro('activeOnly', function() {
  return this.filter({ active: true });
});

Collection.macro('pluck', function<K extends keyof T>(key: K) {
  return this.map(item => item[key]);
});

Collection.macro('average', function(key: keyof T) {
  return this.sum(key as string) / this.length;
});

// Now TypeScript knows about these methods
const users = new Collection<User>([...]);
const emails = users.activeOnly().pluck('email');  // ✅ Type-safe
```

## Practical Examples

### URL Builder

```typescript
interface ApiEndpoint {
  path: string;
  params: Record<string, any>;
}

Collection.macro('buildUrls', function(baseUrl: string) {
  return this.map(endpoint => {
    const url = new URL(endpoint.path, baseUrl);
    Object.entries(endpoint.params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    return url.toString();
  });
});

const endpoints = new Collection<ApiEndpoint>([
  { path: '/users', params: { page: 1, limit: 20 } },
  { path: '/posts', params: { author: 'alice' } }
]);

const urls = endpoints.buildUrls('https://api.example.com');
// [
//   'https://api.example.com/users?page=1&limit=20',
//   'https://api.example.com/posts?author=alice'
// ]
```

### Data Validation

```typescript
Collection.macro('validate', function(schema: any) {
  const errors: any[] = [];

  this.each((item, index) => {
    Object.keys(schema).forEach(key => {
      const rule = schema[key];
      const value = item[key];

      if (rule.required && value === undefined) {
        errors.push({ index, key, error: 'Required field missing' });
      }

      if (rule.type && typeof value !== rule.type) {
        errors.push({ index, key, error: `Expected ${rule.type}` });
      }
    });
  });

  return { valid: errors.length === 0, errors };
});

const data = new Collection([...]);
const validation = data.validate({
  email: { required: true, type: 'string' },
  age: { required: true, type: 'number' }
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Batch Operations

```typescript
Collection.macro('batch', function<R>(
  size: number,
  handler: (batch: T[]) => R | Promise<R>
) {
  const chunks = this.chunk(size);
  return Promise.all(chunks.map(chunk => handler(chunk)));
});

const users = new Collection([...1000 users...]);

await users.batch(100, async (batch) => {
  await sendEmailBatch(batch);
  console.log(`Sent emails to ${batch.length} users`);
});
```

### Pivot Table

```typescript
Collection.macro('pivot', function(
  rowKey: string,
  colKey: string,
  valueKey: string
) {
  const pivot: Record<string, Record<string, any>> = {};

  this.each(item => {
    const row = item[rowKey];
    const col = item[colKey];
    const value = item[valueKey];

    if (!pivot[row]) pivot[row] = {};
    pivot[row][col] = value;
  });

  return pivot;
});

const sales = new Collection([
  { product: 'Laptop', region: 'North', amount: 1000 },
  { product: 'Laptop', region: 'South', amount: 1500 },
  { product: 'Mouse', region: 'North', amount: 500 }
]);

const pivoted = sales.pivot('product', 'region', 'amount');
// {
//   Laptop: { North: 1000, South: 1500 },
//   Mouse: { North: 500 }
// }
```

### Fuzzy Search

```typescript
Collection.macro('fuzzySearch', function(key: string, query: string) {
  const lowerQuery = query.toLowerCase();

  return this.filter(item => {
    const value = String(item[key]).toLowerCase();
    return value.includes(lowerQuery);
  }).sort((a, b) => {
    const aVal = String(a[key]).toLowerCase();
    const bVal = String(b[key]).toLowerCase();

    // Prioritize matches at start
    const aIndex = aVal.indexOf(lowerQuery);
    const bIndex = bVal.indexOf(lowerQuery);

    return aIndex - bIndex;
  });
});

const products = new Collection([...]);
const matches = products.fuzzySearch('name', 'lap');
// Returns products with "lap" in name, sorted by match position
```

## Use Cases

### Domain-Specific Queries

```typescript
// E-commerce
Collection.macro('inPriceRange', function(min: number, max: number) {
  return this.filter({
    price: { $gte: min, $lte: max }
  });
});

Collection.macro('onSale', function() {
  return this.filter({ discount: { $gt: 0 } });
});

// Analytics
Collection.macro('last7Days', function() {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return this.filter({
    timestamp: { $gte: weekAgo }
  });
});

// User Management
Collection.macro('verified', function() {
  return this.filter({ emailVerified: true, phoneVerified: true });
});
```

### Data Transformation

```typescript
Collection.macro('toCsv', function(headers: string[]) {
  const rows = this.map(item =>
    headers.map(key => item[key]).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
});

Collection.macro('normalize', function(key: string) {
  const values = this.map(item => item[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return this.map(item => ({
    ...item,
    [key]: (item[key] - min) / (max - min)
  }));
});
```

### Aggregation Helpers

```typescript
Collection.macro('stats', function(key: string) {
  const sorted = this.sort(key);
  const mid = Math.floor(sorted.length / 2);

  return {
    count: this.length,
    sum: this.sum(key),
    avg: this.sum(key) / this.length,
    min: this.min(key),
    max: this.max(key),
    median: sorted.length % 2 === 0
      ? (sorted[mid - 1][key] + sorted[mid][key]) / 2
      : sorted[mid][key]
  };
});

const scores = new Collection([...]);
const statistics = scores.stats('score');
// { count, sum, avg, min, max, median }
```

## Best Practices

### 1. Descriptive Names

```typescript
// ✅ Good: Clear, descriptive names
Collection.macro('activeUsers', ...);
Collection.macro('completedOrders', ...);

// ❌ Bad: Vague names
Collection.macro('data', ...);
Collection.macro('get', ...);
```

### 2. Return Collections for Chaining

```typescript
// ✅ Good: Returns collection for chaining
Collection.macro('featured', function() {
  return this.filter({ featured: true });
});

users.featured().sort('name').paginate(1, 10);

// ⚠️ Caution: Returning non-collection terminates chain
Collection.macro('toJson', function() {
  return JSON.stringify(this);
});

users.toJson().filter(...);  // ❌ Error: can't chain after
```

### 3. Document Your Macros

```typescript
/**
 * Filters collection to only active users with admin role.
 * @returns {Collection<User>} Collection of admin users
 * @example
 * const admins = users.activeAdmins();
 */
Collection.macro('activeAdmins', function() {
  return this.filter({
    active: true,
    roles: { $contains: 'admin' }
  });
});
```

### 4. Use TypeScript Declaration Merging

```typescript
// types.d.ts
import '@arcaelas/collection';

declare module '@arcaelas/collection' {
  interface Collection<T> {
    /** Filters to active items only */
    activeOnly(): Collection<T>;
  }
}
```

### 5. Avoid Name Collisions

```typescript
// ❌ Bad: Overwriting existing methods
Collection.macro('filter', ...);  // Overwrites built-in filter()

// ✅ Good: Use unique names
Collection.macro('customFilter', ...);
```

### 6. Keep Macros Focused

```typescript
// ✅ Good: Single responsibility
Collection.macro('activeUsers', function() {
  return this.filter({ active: true });
});

Collection.macro('sortByName', function() {
  return this.sort('name', 'asc');
});

// ❌ Bad: Too much in one macro
Collection.macro('processUsers', function() {
  return this.filter(...).sort(...).map(...).groupBy(...);
  // Hard to reuse, test, and maintain
});
```

## Limitations

### 1. No Access to Private Members

```typescript
// Macros cannot access private Collection properties
Collection.macro('getQuery', function() {
  return this.query;  // ❌ Error: query is private
});
```

### 2. Type Safety Requires Declaration Merging

```typescript
// Without declaration merging
Collection.macro('custom', ...);
collection.custom();  // ⚠️ TypeScript error (method unknown)

// With declaration merging
declare module '@arcaelas/collection' {
  interface Collection<T> {
    custom(): Collection<T>;
  }
}
collection.custom();  // ✅ TypeScript knows about it
```

### 3. Static Macros Affect All Instances

```typescript
Collection.macro('test', ...);

const c1 = new Collection([1, 2, 3]);
const c2 = new Collection([4, 5, 6]);

c1.test();  // Available
c2.test();  // Also available

// Use instance macros for instance-specific methods
```

## AsyncCollection Macros

Macros work the same way with AsyncCollection:

```typescript
AsyncCollection.macro('activeOnly', function() {
  return this.where('active', true);
});

const users = new AsyncCollection<User>(async ({ operations }) => {
  // ... executor implementation
});

await users.activeOnly();  // Chainable, awaitable
```

## See Also

- [Collection Class](collection-class.md) - Core Collection API
- [AsyncCollection Class](async-collection-class.md) - Async query builder
- [Extending Collection](../advanced/extending-collection.md) - Advanced extension patterns
- [TypeScript Usage](../advanced/typescript-usage.md) - Type safety patterns
