# Getting Started

Welcome to the getting started guide for `@arcaelas/collection`! This guide will walk you through the basics and help you become productive quickly.

## Your First Collection

Let's create your first collection:

```typescript
import Collection from "@arcaelas/collection";

const numbers = new Collection([1, 2, 3, 4, 5]);

console.log(numbers.length); // 5
console.log(numbers.first()); // 1
console.log(numbers.last()); // 5
```

## Working with Objects

Collections really shine when working with objects:

```typescript
interface User {
  id: number;
  name: string;
  age: number;
  active: boolean;
}

const users = new Collection<User>([
  { id: 1, name: "Alice", age: 25, active: true },
  { id: 2, name: "Bob", age: 30, active: false },
  { id: 3, name: "Charlie", age: 35, active: true }
]);
```

## Basic Filtering

Filter collections using callbacks:

```typescript
// Get active users
const activeUsers = users.filter(user => user.active);

// Get users over 25
const adults = users.filter(user => user.age > 25);
```

Or use query objects:

```typescript
// Same results with query syntax
const activeUsers = users.filter({ active: true });
const adults = users.filter({ age: { $gt: 25 } });
```

## Finding Elements

Find specific elements:

```typescript
// Get first active user
const firstActive = users.first({ active: true });

// Get last user over 30
const lastAdult = users.last(user => user.age > 30);
```

## Transforming Data

Transform collections with `map()`:

```typescript
// Get array of names
const names = users.map(user => user.name);
// ["Alice", "Bob", "Charlie"]

// Create display labels
const labels = users.map(user => `${user.name} (${user.age})`);
// ["Alice (25)", "Bob (30)", "Charlie (35)"]
```

## Sorting

Sort collections easily:

```typescript
// Sort by age ascending
users.sort("age", "asc");

// Sort by name descending
users.sort("name", "desc");

// Custom sorting
users.sort((a, b) => a.age - b.age);
```

## Method Chaining

Combine multiple operations:

```typescript
const result = users
  .filter({ active: true })
  .where("age", ">=", 25)
  .sort("age", "desc")
  .map(user => user.name);

console.log(result); // ["Charlie", "Alice"]
```

## Aggregation

Calculate aggregate values:

```typescript
// Total age of all users
const totalAge = users.sum("age");

// Maximum age
const maxAge = users.max("age");

// Minimum age
const minAge = users.min("age");

// Average age
const avgAge = users.sum("age") / users.length;
```

## Grouping Data

Group elements by a key:

```typescript
const products = new Collection([
  { name: "Laptop", category: "electronics", price: 1000 },
  { name: "Mouse", category: "electronics", price: 20 },
  { name: "Desk", category: "furniture", price: 300 }
]);

const byCategory = products.groupBy("category");
// {
//   electronics: [...],
//   furniture: [...]
// }
```

## Pagination

Paginate large collections:

```typescript
const page1 = users.paginate(1, 10);
// {
//   items: [...], // First 10 users
//   prev: false,
//   next: 2
// }
```

## Unique Values

Get unique elements:

```typescript
const items = new Collection([1, 2, 2, 3, 3, 3, 4]);
const unique = items.unique(x => x);
// [1, 2, 3, 4]

// With objects
const uniqueUsers = users.unique("email");
```

## Updating Elements

Update elements that match a condition:

```typescript
// Deactivate all users over 30
users.update(
  { age: { $gt: 30 } },
  { active: false }
);

// Update with callback
users.update(
  { active: false },
  user => ({ ...user, deletedAt: new Date() })
);
```

## Removing Fields

Remove sensitive fields:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  token: string;
}

const users = new Collection<User>([...]);

// Remove password and token
users.forget("password", "token");
```

## Debugging

Use debug methods:

```typescript
// Print and continue
users
  .filter({ active: true })
  .dump()  // Prints to console
  .sort("age", "desc");

// Print and exit (in Node.js)
users.dd();  // Dumps and exits
```

## Next Steps

Now that you understand the basics:

1. Learn about [Core Concepts](core-concepts.md)
2. Explore [Query Operators](query-operators.md)
3. Check out [Examples](../examples/basic-usage.md)
4. Read the [API Reference](../api/collection-class.md)

## Common Patterns

### Filter and Sort

```typescript
const topUsers = users
  .filter({ verified: true })
  .sort("score", "desc")
  .slice(0, 10);
```

### Transform and Group

```typescript
const grouped = products
  .map(p => ({ ...p, discounted: p.price * 0.9 }))
  .groupBy("category");
```

### Clean and Dedupe

```typescript
const clean = users
  .forget("password", "token")
  .unique("email")
  .filter({ verified: true });
```

## Tips

1. **Use TypeScript** for type safety and autocompletion
2. **Chain methods** for readable, concise code
3. **Use query objects** for complex filtering
4. **Leverage operators** like `$gt`, `$in`, `$contains`
5. **Prefer immutable operations** - use `collect()` to clone

## Help & Support

- **Documentation**: [Full API Reference](../api/collection-class.md)
- **Examples**: [More Examples](../examples/basic-usage.md)
- **Issues**: [GitHub Issues](https://github.com/arcaelas/collection/issues)
