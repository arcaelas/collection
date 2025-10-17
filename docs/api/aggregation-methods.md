# Aggregation Methods

Methods for calculating statistics and grouping data. Aggregation methods typically return primitive values or plain objects rather than Collection instances, terminating the method chain.

## Overview

Aggregation methods fall into two categories:

**Statistical Aggregations** (return numbers):
- `sum()` - Calculate total
- `max()` - Find maximum value
- `min()` - Find minimum value

**Grouping Aggregations** (return objects):
- `countBy()` - Count occurrences by group
- `groupBy()` - Group elements into collections

All aggregation methods terminate the chain by returning non-Collection values.

## sum()

### `sum(key: string): number`
### `sum(iterator: (item: T, index: number, arr: T[]) => number): number`

Calculates the sum of numeric values for a given key or function result.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key to sum (supports dot notation) |
| `iterator` | `(item: T, index: number, arr: T[]) => number` | Function returning numeric value to sum |

**Returns:** `number` - Sum of all numeric values (non-numeric values ignored, defaults to 0)

**Example - Sum by key:**

```typescript
const orders = new Collection([
  { id: 1, total: 100 },
  { id: 2, total: 250 },
  { id: 3, total: 75 }
]);

const revenue = orders.sum('total');
// 425
```

**Example - Sum with dot notation:**

```typescript
const users = new Collection([
  { name: 'Alice', stats: { points: 150 } },
  { name: 'Bob', stats: { points: 200 } },
  { name: 'Charlie', stats: { points: 175 } }
]);

const totalPoints = users.sum('stats.points');
// 525
```

**Example - Sum with function:**

```typescript
const cart = new Collection([
  { product: 'Laptop', price: 1200, quantity: 1 },
  { product: 'Mouse', price: 25, quantity: 2 },
  { product: 'Keyboard', price: 75, quantity: 1 }
]);

const totalCost = cart.sum(item =>
  item.price * item.quantity
);
// 1200 + 50 + 75 = 1325
```

**Example - Sum with tax calculation:**

```typescript
const subtotal = orders.sum('amount');
const tax = orders.sum(order =>
  order.amount * order.taxRate
);
const total = subtotal + tax;
```

**Example - Conditional sum:**

```typescript
// Sum only completed orders
const completedRevenue = orders
  .filter({ status: 'completed' })
  .sum('amount');
```

**Edge Cases:**

```typescript
// Non-numeric values are filtered out
const mixed = new Collection([
  { value: 10 },
  { value: 'not a number' },
  { value: null },
  { value: 20 }
]);

mixed.sum('value');  // 30 (ignores non-numeric)

// Empty collection returns 0
new Collection([]).sum('price');  // 0

// Missing key returns 0
new Collection([{ other: 10 }]).sum('price');  // 0
```

**Note:** This method terminates the chain. To continue chaining after calculation, store result in variable:

```typescript
const total = orders.sum('amount');
const count = orders.length;
const average = total / count;
```

---

## max()

### `max(key: string): number`

Returns the maximum numeric value for a given key.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key to find maximum (supports dot notation) |

**Returns:** `number` - Maximum value found (or `-Infinity` if no valid numbers)

**Throws:** `Error('type/string')` if key is not a string

**Example - Basic maximum:**

```typescript
const products = new Collection([
  { name: 'Laptop', price: 1200 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 75 }
]);

const maxPrice = products.max('price');
// 1200
```

**Example - Maximum with dot notation:**

```typescript
const users = new Collection([
  { name: 'Alice', profile: { score: 95 } },
  { name: 'Bob', profile: { score: 87 } },
  { name: 'Charlie', profile: { score: 92 } }
]);

const highScore = users.max('profile.score');
// 95
```

**Example - Find highest stock:**

```typescript
const inventory = new Collection([
  { product: 'A', stock: 150 },
  { product: 'B', stock: 75 },
  { product: 'C', stock: 200 }
]);

const maxStock = inventory.max('stock');
// 200
```

**Example - Combined with filtering:**

```typescript
// Find highest price among active products
const maxActivePrice = products
  .filter({ active: true })
  .max('price');
```

**Example - Find element with maximum value:**

```typescript
const maxPrice = products.max('price');
const mostExpensive = products.first({ price: maxPrice });
// { name: 'Laptop', price: 1200 }
```

**Edge Cases:**

```typescript
// Handles negative numbers
const temps = new Collection([
  { city: 'A', temp: -5 },
  { city: 'B', temp: -15 },
  { city: 'C', temp: 3 }
]);
temps.max('temp');  // 3

// Missing values default to 0
const items = new Collection([
  { value: 10 },
  { value: -13 },
  { value: 12 },
  { noValue: true }  // Missing 'value' key treated as 0
]);
items.max('value');  // 12

// Empty collection returns -Infinity
new Collection([]).max('price');  // -Infinity
```

**Type Safety:**

```typescript
// TypeScript enforces string key
products.max(123);  // Error: Argument must be string
products.max();     // Error: Missing required parameter
```

---

## min()

### `min(key: string): number`

Returns the minimum numeric value for a given key.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key to find minimum (supports dot notation) |

**Returns:** `number` - Minimum value found (or `Infinity` if no valid numbers)

**Throws:** `Error('type/string')` if key is not a string

**Example - Basic minimum:**

```typescript
const products = new Collection([
  { name: 'Laptop', price: 1200 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 75 }
]);

const minPrice = products.min('price');
// 25
```

**Example - Minimum with dot notation:**

```typescript
const users = new Collection([
  { name: 'Alice', profile: { score: 95 } },
  { name: 'Bob', profile: { score: 87 } },
  { name: 'Charlie', profile: { score: 92 } }
]);

const lowScore = users.min('profile.score');
// 87
```

**Example - Find lowest temperature:**

```typescript
const readings = new Collection([
  { time: '08:00', temp: 18.5 },
  { time: '12:00', temp: 24.3 },
  { time: '16:00', temp: 22.1 },
  { time: '20:00', temp: 19.8 }
]);

const minTemp = readings.min('temp');
// 18.5
```

**Example - Find cheapest option:**

```typescript
const available = products
  .filter({ inStock: true })
  .min('price');

console.log(`Cheapest available: $${available}`);
```

**Example - Find element with minimum value:**

```typescript
const minPrice = products.min('price');
const cheapest = products.first({ price: minPrice });
// { name: 'Mouse', price: 25 }
```

**Edge Cases:**

```typescript
// Handles negative numbers
const values = new Collection([
  { value: 10 },
  { value: -13 },
  { value: 12 }
]);
values.min('value');  // -13

// Missing values default to 0
const items = new Collection([
  { value: 10 },
  { value: -5 },
  { noValue: true }  // Treated as 0
]);
items.min('value');  // -5 (0 is not minimum)

// Empty collection returns Infinity
new Collection([]).min('price');  // Infinity
```

**Comparison with max():**

```typescript
const prices = products.map(p => p.price);
const range = {
  min: products.min('price'),  // 25
  max: products.max('price'),  // 1200
  spread: products.max('price') - products.min('price')  // 1175
};
```

---

## countBy()

### `countBy(key: string): Record<string, number>`
### `countBy(iterator: (value: T, index: number, arr: T[]) => string | number): Record<string, number>`

Groups items by key or function result and counts occurrences in each group.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key to group by (supports dot notation) |
| `iterator` | `(value: T, index: number, arr: T[]) => string \| number` | Function returning group identifier |

**Returns:** `Record<string, number>` - Object mapping group identifiers to counts

**Example - Count by key:**

```typescript
const orders = new Collection([
  { id: 1, status: 'pending' },
  { id: 2, status: 'completed' },
  { id: 3, status: 'pending' },
  { id: 4, status: 'completed' },
  { id: 5, status: 'cancelled' }
]);

const statusCounts = orders.countBy('status');
// {
//   pending: 2,
//   completed: 2,
//   cancelled: 1
// }
```

**Example - Count with dot notation:**

```typescript
const users = new Collection([
  { name: 'Alice', address: { country: 'USA' } },
  { name: 'Bob', address: { country: 'Canada' } },
  { name: 'Charlie', address: { country: 'USA' } },
  { name: 'Diana', address: { country: 'UK' } }
]);

const byCountry = users.countBy('address.country');
// {
//   USA: 2,
//   Canada: 1,
//   UK: 1
// }
```

**Example - Count with function:**

```typescript
const products = new Collection([
  { name: 'Laptop', price: 1200 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 75 },
  { name: 'Monitor', price: 350 }
]);

const priceRanges = products.countBy(product => {
  if (product.price < 50) return 'budget';
  if (product.price < 500) return 'mid-range';
  return 'premium';
});
// {
//   budget: 1,
//   'mid-range': 2,
//   premium: 1
// }
```

**Example - Age distribution:**

```typescript
const users = new Collection([
  { name: 'Alice', age: 17 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 16 },
  { name: 'Diana', age: 30 }
]);

const ageGroups = users.countBy(user =>
  user.age >= 18 ? 'adult' : 'minor'
);
// { adult: 2, minor: 2 }
```

**Example - Date grouping:**

```typescript
const events = new Collection([
  { title: 'Event 1', date: new Date('2024-01-15') },
  { title: 'Event 2', date: new Date('2024-01-20') },
  { title: 'Event 3', date: new Date('2024-02-05') },
  { title: 'Event 4', date: new Date('2024-02-10') }
]);

const byMonth = events.countBy(event =>
  event.date.toISOString().slice(0, 7)  // 'YYYY-MM'
);
// { '2024-01': 2, '2024-02': 2 }
```

**Example - Combined with filtering:**

```typescript
// Count active users by country
const activeCounts = users
  .filter({ active: true })
  .countBy('country');
```

**Example - Display statistics:**

```typescript
const counts = orders.countBy('status');

Object.entries(counts).forEach(([status, count]) => {
  console.log(`${status}: ${count} orders`);
});
// pending: 2 orders
// completed: 2 orders
// cancelled: 1 orders
```

**Edge Cases:**

```typescript
// Empty collection
new Collection([]).countBy('status');
// {}

// Missing keys default to undefined string
const items = new Collection([
  { status: 'active' },
  { /* no status */ },
  { status: 'active' }
]);
items.countBy('status');
// { active: 2, undefined: 1 }

// Numeric keys converted to strings
const numbers = new Collection([
  { value: 1 }, { value: 2 }, { value: 1 }
]);
numbers.countBy('value');
// { '1': 2, '2': 1 }
```

---

## groupBy()

### `groupBy(key: string): Dictionary<T[]>`
### `groupBy(iterator: (item: T, index: number, arr: T[]) => string | number): Dictionary<T[]>`

Groups collection items into a dictionary of arrays based on key or function result.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Field key to group by (supports dot notation) |
| `iterator` | `(item: T, index: number, arr: T[]) => string \| number` | Function returning group identifier |

**Returns:** `Dictionary<T[]>` - Object mapping group identifiers to arrays of items

**Example - Group by key:**

```typescript
const products = new Collection([
  { id: 100, product: 'Chair', manufacturer: 'IKEA', price: 1490 },
  { id: 150, product: 'Desk', manufacturer: 'IKEA', price: 900 },
  { id: 200, product: 'Chair', manufacturer: 'Herman Miller', price: 9990 }
]);

const byManufacturer = products.groupBy('manufacturer');
// {
//   IKEA: [
//     { id: 100, product: 'Chair', manufacturer: 'IKEA', price: 1490 },
//     { id: 150, product: 'Desk', manufacturer: 'IKEA', price: 900 }
//   ],
//   'Herman Miller': [
//     { id: 200, product: 'Chair', manufacturer: 'Herman Miller', price: 9990 }
//   ]
// }
```

**Example - Group with function:**

```typescript
const grouped = products.groupBy(item =>
  item.manufacturer.substring(0, 3)
);
// {
//   IKE: [
//     { id: 100, product: 'Chair', manufacturer: 'IKEA', ... },
//     { id: 150, product: 'Desk', manufacturer: 'IKEA', ... }
//   ],
//   Her: [
//     { id: 200, product: 'Chair', manufacturer: 'Herman Miller', ... }
//   ]
// }
```

**Example - Group by price range:**

```typescript
const byPriceRange = products.groupBy(product => {
  if (product.price < 1000) return 'budget';
  if (product.price < 5000) return 'mid-range';
  return 'premium';
});
// {
//   budget: [{ ..., price: 900 }],
//   'mid-range': [{ ..., price: 1490 }],
//   premium: [{ ..., price: 9990 }]
// }
```

**Example - Group by date:**

```typescript
const orders = new Collection([
  { id: 1, date: new Date('2024-01-15'), amount: 100 },
  { id: 2, date: new Date('2024-01-20'), amount: 200 },
  { id: 3, date: new Date('2024-02-05'), amount: 150 }
]);

const byMonth = orders.groupBy(order =>
  order.date.toISOString().slice(0, 7)
);
// {
//   '2024-01': [
//     { id: 1, date: ..., amount: 100 },
//     { id: 2, date: ..., amount: 200 }
//   ],
//   '2024-02': [
//     { id: 3, date: ..., amount: 150 }
//   ]
// }
```

**Example - Nested grouping:**

```typescript
const users = new Collection([
  { name: 'Alice', country: 'USA', role: 'admin' },
  { name: 'Bob', country: 'USA', role: 'user' },
  { name: 'Charlie', country: 'Canada', role: 'admin' }
]);

// Group by country, then by role
const byCountry = users.groupBy('country');
const nested = Object.entries(byCountry).reduce((acc, [country, items]) => {
  acc[country] = new Collection(items).groupBy('role');
  return acc;
}, {} as any);
// {
//   USA: {
//     admin: [{ name: 'Alice', ... }],
//     user: [{ name: 'Bob', ... }]
//   },
//   Canada: {
//     admin: [{ name: 'Charlie', ... }]
//   }
// }
```

**Example - Process groups:**

```typescript
const grouped = orders.groupBy('status');

Object.entries(grouped).forEach(([status, items]) => {
  console.log(`${status}:`);
  items.forEach(order => {
    console.log(`  - Order #${order.id}: $${order.amount}`);
  });
});
```

**Example - Convert groups to Collections:**

```typescript
const byCategory = products.groupBy('category');

// Convert arrays to Collection instances
const collections = Object.entries(byCategory).reduce((acc, [key, items]) => {
  acc[key] = new Collection(items);
  return acc;
}, {} as Record<string, Collection>);

// Now can use Collection methods on each group
collections.electronics.sum('price');
collections.furniture.filter({ inStock: true });
```

**Example - Group statistics:**

```typescript
const byCategory = products.groupBy('category');

const stats = Object.entries(byCategory).map(([category, items]) => ({
  category,
  count: items.length,
  totalValue: new Collection(items).sum('price'),
  avgPrice: new Collection(items).sum('price') / items.length
}));
// [
//   { category: 'Electronics', count: 5, totalValue: 3500, avgPrice: 700 },
//   { category: 'Furniture', count: 3, totalValue: 1200, avgPrice: 400 }
// ]
```

**Edge Cases:**

```typescript
// Empty collection
new Collection([]).groupBy('category');
// {}

// Missing keys
const items = new Collection([
  { name: 'A', category: 'X' },
  { name: 'B' },  // No category
  { name: 'C', category: 'X' }
]);
items.groupBy('category');
// {
//   X: [{ name: 'A', ... }, { name: 'C', ... }],
//   undefined: [{ name: 'B' }]
// }

// All items in one group
items.groupBy(() => 'all');
// { all: [/* all items */] }
```

**Difference from countBy():**

```typescript
const items = new Collection([...]);

// countBy returns counts
items.countBy('category');
// { electronics: 5, furniture: 3 }

// groupBy returns actual items
items.groupBy('category');
// {
//   electronics: [/* 5 items */],
//   furniture: [/* 3 items */]
// }
```

## Method Chaining

Aggregation methods terminate the chain by returning non-Collection values. Combine with filtering for targeted calculations:

```typescript
// Calculate total revenue from completed orders this month
const monthlyRevenue = orders
  .filter({ status: 'completed' })
  .filter(order => order.date.getMonth() === currentMonth)
  .sum('amount');

// Find highest-scoring active user
const topScore = users
  .filter({ active: true })
  .max('score');

// Group active users by country and count
const activeByCountry = users
  .filter({ active: true })
  .groupBy('country');

const counts = Object.entries(activeByCountry).map(([country, items]) => ({
  country,
  count: items.length
}));
```

## Combining Aggregations

Multiple aggregations can be computed from the same filtered collection:

```typescript
const activeOrders = orders.filter({ status: 'active' });

const stats = {
  count: activeOrders.length,
  total: activeOrders.sum('amount'),
  average: activeOrders.sum('amount') / activeOrders.length,
  min: activeOrders.min('amount'),
  max: activeOrders.max('amount'),
  byStatus: activeOrders.countBy('priority')
};
```

## Performance Considerations

Aggregations iterate the entire collection. For multiple calculations, filter once:

```typescript
// ❌ Bad: Filters collection 3 times
const total = orders.filter({ active: true }).sum('amount');
const count = orders.filter({ active: true }).length;
const max = orders.filter({ active: true }).max('amount');

// ✅ Good: Filter once, then aggregate
const active = orders.filter({ active: true });
const stats = {
  total: active.sum('amount'),
  count: active.length,
  max: active.max('amount')
};
```

## See Also

- [Filtering Methods](filtering-methods.md) - Pre-filter before aggregation
- [Transformation Methods](transformation-methods.md) - Transform before aggregating
- [Utility Methods](utility-methods.md) - Additional collection operations
- [Best Practices](../guides/best-practices.md) - Performance optimization patterns
