# Best Practices

Best practices and recommendations for using `@arcaelas/collection` effectively in production applications.

## Use TypeScript

### Leverage Generic Types

Always specify generic types for type safety and autocompletion:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

// ✅ Good: Type-safe collection
const users = new Collection<User>([
  { id: 1, name: "Alice", email: "alice@example.com", active: true }
]);

users.first()?.email; // TypeScript knows this is string | undefined

// ❌ Avoid: No type safety
const untyped = new Collection([...]);
untyped.first()?.email; // TypeScript doesn't know the type
```

### Use Custom Validators

Define custom validators for complex query operations:

```typescript
interface Product {
  price: number;
  inStock: boolean;
  category: string;
}

interface ProductValidator {
  isPremium?: boolean;
  isAffordable?: boolean;
}

const products = new Collection<Product, ProductValidator>(
  [...],
  {
    isPremium: (product) => product.price > 100,
    isAffordable: (product) => product.price <= 50
  }
);

// Use custom validators in queries
products.filter({ isPremium: true });
```

## Chain Methods

### Keep Chains Readable

Break long chains into logical sections with comments:

```typescript
const result = users
  // Filtering phase
  .filter({ verified: true })
  .whereNot('banned', true)

  // Transformation phase
  .unique('email')
  .forget('password', 'token')

  // Sorting & limiting phase
  .sort('created_at', 'desc')
  .paginate(1, 20);
```

### Prefer Method Chaining Over Intermediate Variables

```typescript
// ✅ Good: Fluent chain
const activeAdults = users
  .filter({ active: true })
  .where('age', '>=', 18)
  .sort('name', 'asc');

// ❌ Avoid: Unnecessary intermediate variables
const activeUsers = users.filter({ active: true });
const adults = activeUsers.where('age', '>=', 18);
const sorted = adults.sort('name', 'asc');
```

### Exception: Complex Logic

Break chains when logic becomes complex:

```typescript
// ✅ Good: Split complex logic for readability
const premiumUsers = users.filter({ tier: 'premium' });

const eligibleForDiscount = premiumUsers.filter(user => {
  const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0);
  const memberDays = (Date.now() - user.joinedAt.getTime()) / 86400000;
  return totalSpent > 1000 && memberDays > 365;
});

const result = eligibleForDiscount.sort('totalSpent', 'desc').paginate(1, 10);
```

## Leverage Query Operators

### Use Query DSL for Simple Conditions

```typescript
// ✅ Good: Clean query syntax
users.filter({
  age: { $gte: 18, $lte: 65 },
  email: { $regex: /@company\.com$/ },
  status: { $in: ['active', 'pending'] }
});

// ❌ Avoid: Verbose function filters for simple conditions
users.filter(user =>
  user.age >= 18 &&
  user.age <= 65 &&
  /@company\.com$/.test(user.email) &&
  ['active', 'pending'].includes(user.status)
);
```

### Use Functions for Complex Logic

```typescript
// ✅ Good: Function for complex conditions
users.filter(user => {
  const isEligible = checkComplexEligibility(user);
  const hasPermissions = user.roles.some(r => r.canAccess);
  return isEligible && hasPermissions;
});

// ❌ Avoid: Trying to force complex logic into queries
users.filter({
  /* This won't work for complex multi-step logic */
});
```

### Combine Queries and Functions

```typescript
// ✅ Best of both: Simple conditions in query, complex in function
users
  .filter({ active: true, verified: true }) // Simple query
  .filter(user => {
    // Complex business logic
    return hasValidSubscription(user) && meetsCriteria(user);
  });
```

## Prefer Immutable Operations

### Understand Mutating vs Immutable Methods

**Immutable methods** (return new Collection):
- `filter()`, `where()`, `whereNot()`, `not()`
- `unique()`, `chunk()`
- `first()`, `last()`

**Mutating methods** (modify original Collection):
- `delete()` - removes matching items
- `update()` - modifies matching items
- `forget()` - removes properties from items
- `sort()` - reorders items
- `shuffle()` - randomizes order

```typescript
const original = new Collection([
  { id: 1, name: "Alice", temp: true },
  { id: 2, name: "Bob", temp: false }
]);

// ✅ Immutable: original remains unchanged
const filtered = original.filter({ temp: false });
console.log(original.length); // Still 2

// ⚠️ Mutating: original is modified
original.delete({ temp: true });
console.log(original.length); // Now 1

original.forget('temp'); // Removes 'temp' property from all items
original.sort('name', 'asc'); // Reorders items
```

### When to Use Mutating Methods

Use mutating methods when:
1. You need to save memory (large datasets)
2. You're sure the original data won't be needed
3. Performance is critical (avoid array copies)

```typescript
// ✅ Good use case: Cleanup after processing
users
  .forget('password', 'internal_id') // Remove sensitive data
  .delete({ deleted: true }); // Remove flagged items
```

### Safe Pattern: Clone First

If you need to mutate but keep original:

```typescript
const processed = users.collect() // Clone collection
  .forget('password')
  .delete({ inactive: true });

// Original 'users' remains unchanged
```

## Performance Considerations

### Avoid Repeated Filtering

```typescript
// ❌ Bad: Filters entire collection 3 times
const result1 = users.filter({ active: true });
const result2 = users.filter({ verified: true });
const result3 = users.filter({ admin: true });

// ✅ Good: Filter once, then refine
const activeUsers = users.filter({ active: true });
const verified = activeUsers.filter({ verified: true });
const admins = verified.filter({ admin: true });

// ✅ Even better: Combine conditions
const adminUsers = users.filter({
  active: true,
  verified: true,
  admin: true
});
```

### Use Appropriate Methods

```typescript
// ❌ Bad: Using filter() just to get first item
const firstActive = users.filter({ active: true })[0];

// ✅ Good: Use first() directly
const firstActive = users.first({ active: true });

// ❌ Bad: Counting with length after filter
const count = users.filter({ active: true }).length;

// ✅ Good: Use countBy if you need counts
const counts = users.countBy('status');
console.log(counts.active); // Direct count
```

### Optimize Query Compilation

Query objects are compiled once per filter call. Reuse queries when possible:

```typescript
// ❌ Inefficient: Query compiled 1000 times
data.forEach(item => {
  users.filter({ id: item.userId }); // New query each time
});

// ✅ Efficient: Use function filter
const userById = (id: number) => (u: User) => u.id === id;
data.forEach(item => {
  users.filter(userById(item.userId));
});

// ✅ Even better: Group operations
const userIds = data.map(i => i.userId);
const relevantUsers = users.filter({ id: { $in: userIds } });
```

### Paginate Large Results

```typescript
// ❌ Bad: Loading all items into memory
const allUsers = await fetchAllUsers(); // 100,000 items
const processed = new Collection(allUsers).filter(...).sort(...);

// ✅ Good: Use pagination
const page = 1, perPage = 100;
const { items, next } = users
  .filter({ active: true })
  .sort('created_at', 'desc')
  .paginate(page, perPage);

// Process in chunks
while (next) {
  const batch = users.paginate(next, perPage);
  processBatch(batch.items);
  next = batch.next;
}
```

### Avoid Expensive Operations in Loops

```typescript
// ❌ Bad: sum() called N times
items.forEach(item => {
  const total = collection.sum('price'); // Recalculates every iteration
  item.percentage = item.price / total;
});

// ✅ Good: Calculate once
const total = collection.sum('price');
items.forEach(item => {
  item.percentage = item.price / total;
});
```

## Error Handling

### Validate Input Data

```typescript
// ✅ Good: Validate before processing
const collection = new Collection(data);

if (collection.length === 0) {
  throw new Error('Empty dataset');
}

const result = collection
  .filter({ active: true })
  .first();

if (!result) {
  console.warn('No active users found');
  return defaultValue;
}
```

### Handle Edge Cases

```typescript
// ✅ Safe: Check before aggregation
const prices = products.filter({ price: { $exists: true } });

if (prices.length === 0) {
  console.log('No prices available');
} else {
  const avgPrice = prices.sum('price') / prices.length;
  console.log(`Average: ${avgPrice}`);
}
```

### Use Type Guards

```typescript
// ✅ Good: Type-safe filtering
const validUsers = users.filter((user): user is ValidUser => {
  return user.email !== undefined &&
         user.name !== undefined &&
         user.age >= 0;
});

// Now TypeScript knows validUsers has all properties
validUsers.forEach(user => {
  console.log(user.email.toLowerCase()); // No undefined error
});
```

## Testing

### Test with Edge Cases

```typescript
describe('UserCollection', () => {
  it('handles empty collections', () => {
    const users = new Collection([]);
    expect(users.first()).toBeUndefined();
    expect(users.sum('age')).toBe(0);
  });

  it('handles invalid data gracefully', () => {
    const users = new Collection([
      { age: 25 },
      { age: null },
      { age: undefined },
      { /* no age */ }
    ]);

    const validAges = users.filter({ age: { $exists: true } });
    expect(validAges.length).toBe(1);
  });
});
```

### Mock Data Sources for AsyncCollection

```typescript
const mockExecutor = jest.fn(async () => [
  { id: 1, name: 'Test User' }
]);

const users = new AsyncCollection(mockExecutor);
await users.where('id', 1);

expect(mockExecutor).toHaveBeenCalledWith(
  expect.objectContaining({
    operations: [['where', 'id', '=', 1]]
  })
);
```

## See Also

- [Core Concepts](core-concepts.md) - Fundamental principles
- [Query Operators](query-operators.md) - Query DSL reference
- [Performance Guide](../advanced/performance.md) - Optimization techniques
- [TypeScript Usage](../advanced/typescript-usage.md) - Advanced type patterns
