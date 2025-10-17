# Utility Methods

Utility methods for updating, deleting, debugging, and other collection operations. These methods provide practical functionality for data manipulation and development workflows.

## Overview

Utility methods fall into four categories:

**Mutation Methods** (modify collection):
- `update()` - Update matching elements
- `delete()` - Remove matching elements
- `shuffle()` - Randomize order

**Iteration Methods**:
- `each()` - Iterate with early exit

**Randomization Methods**:
- `random()` - Get random elements

**Debugging Methods**:
- `dump()` - Print and continue
- `dd()` - Print and exit
- `stringify()` - Convert to JSON

## update()

### `update(set: T): number`
### `update(where: Query<V>, set: T): number`

Updates elements that match criteria. This method **mutates** the collection.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `where` | `Query<V>` | Query object to match elements (optional - if omitted, updates all) |
| `set` | `T` | Object with fields to update (supports template strings) |

**Returns:** `number` - Count of updated elements

**Example - Update all elements:**

```typescript
const users = new Collection([
  { id: 1, name: 'Alice', status: 'pending' },
  { id: 2, name: 'Bob', status: 'pending' }
]);

const count = users.update({ status: 'active' });
// count = 2
// All users now have status: 'active'
```

**Example - Update matching elements:**

```typescript
const orders = new Collection([
  { id: 1, status: 'pending', total: 100 },
  { id: 2, status: 'pending', total: 200 },
  { id: 3, status: 'completed', total: 150 }
]);

const updated = orders.update(
  { status: 'pending' },
  { status: 'processing', processedAt: new Date() }
);
// updated = 2 (only pending orders updated)
```

**Example - Template strings for field references:**

```typescript
const users = new Collection([
  { id: 1, email: 'old@example.com', name: 'Alice' }
]);

users.update(
  { email: /old@example\.com/ },
  {
    email: 'new@example.com',
    prevEmail: '${email}'  // Template: saves old email value
  }
);
// Result: { id: 1, email: 'new@example.com', prevEmail: 'old@example.com', name: 'Alice' }
```

**Example - Conditional updates:**

```typescript
const products = new Collection([
  { id: 1, price: 100, discount: 0 },
  { id: 2, price: 200, discount: 0 },
  { id: 3, price: 50, discount: 0 }
]);

// Apply discount to expensive items
products.update(
  { price: { $gte: 100 } },
  { discount: 0.15 }
);
```

**Example - Bulk status change:**

```typescript
// Mark all inactive users as deleted
const deletedCount = users.update(
  { active: false },
  { deleted: true, deletedAt: new Date() }
);

console.log(`Marked ${deletedCount} users as deleted`);
```

**Example - Complex query updates:**

```typescript
// Update users with expired subscriptions
const expiredCount = users.update(
  {
    subscription: { $exists: true },
    'subscription.expiresAt': { $lt: Date.now() }
  },
  {
    'subscription.status': 'expired',
    'subscription.expiredAt': Date.now()
  }
);
```

**Mutability Note:**

```typescript
const original = new Collection([
  { id: 1, status: 'pending' }
]);

original.update({ status: 'active' });

console.log(original);
// [{ id: 1, status: 'active' }] - Modified in place
```

To update without mutation:

```typescript
const updated = original.collect().update({ status: 'active' });
console.log(original);  // Unchanged
```

---

## delete()

### `delete(where: Query<V>): number`

Removes elements that match query criteria. This method **mutates** the collection.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `where` | `Query<V>` | Query object to match elements for deletion |

**Returns:** `number` - Count of deleted elements

**Example - Delete matching elements:**

```typescript
const users = new Collection([
  { id: 1, name: 'Alice', deleted: false },
  { id: 2, name: 'Bob', deleted: true },
  { id: 3, name: 'Charlie', deleted: false }
]);

const removedCount = users.delete({ deleted: true });
// removedCount = 1
// users now has 2 items (Bob removed)
```

**Example - Delete with complex query:**

```typescript
const products = new Collection([
  { id: 1, stock: 0, discontinued: true },
  { id: 2, stock: 10, discontinued: false },
  { id: 3, stock: 0, discontinued: false }
]);

// Remove discontinued items with no stock
const removed = products.delete({
  stock: 0,
  discontinued: true
});
// removed = 1
```

**Example - Delete by date:**

```typescript
const sessions = new Collection([
  { id: 1, expiresAt: new Date('2024-01-01') },
  { id: 2, expiresAt: new Date('2025-01-01') },
  { id: 3, expiresAt: new Date('2024-06-01') }
]);

// Delete expired sessions
const expired = sessions.delete({
  expiresAt: { $lt: Date.now() }
});
```

**Example - Cleanup pattern:**

```typescript
// Remove test data and inactive users
const cleaned = users
  .delete({ email: { $regex: /@test\.com$/ } })  // Remove test emails
  + users.delete({ lastLogin: { $exists: false } });  // Remove never logged in

console.log(`Cleaned ${cleaned} users`);
```

**Example - Conditional deletion:**

```typescript
const tasks = new Collection([
  { id: 1, status: 'completed', completedAt: new Date('2024-01-01') },
  { id: 2, status: 'completed', completedAt: new Date('2024-12-01') },
  { id: 3, status: 'pending', completedAt: null }
]);

// Delete old completed tasks (> 6 months)
const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
tasks.delete({
  status: 'completed',
  completedAt: { $lt: sixMonthsAgo }
});
```

**Mutability Note:**

```typescript
const original = new Collection([1, 2, 3, 4, 5]);

original.delete({ $gte: 3 });

console.log(original);
// [1, 2] - Elements >= 3 removed from original
```

To delete without mutation:

```typescript
const filtered = original.not({ $gte: 3 });  // Use not() instead
console.log(original);  // Unchanged
```

**Difference from filter():**

```typescript
const items = new Collection([1, 2, 3, 4, 5]);

// filter() - immutable, returns new collection
const filtered = items.filter({ $lt: 3 });
console.log(items.length);     // 5 (unchanged)
console.log(filtered.length);  // 2

// delete() - mutable, modifies original
const deleted = items.delete({ $gte: 3 });
console.log(items.length);     // 2 (modified)
console.log(deleted);          // 3 (count of deleted)
```

---

## each()

### `each(fn: (item: T, index: number, arr: this) => any): this`

Iterates over collection executing callback for each element. Return `false` to stop iteration early.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(item: T, index: number, arr: this) => any` | Callback executed for each element |

**Returns:** `this` - The collection (for chaining)

**Example - Basic iteration:**

```typescript
const users = new Collection([
  { name: 'Alice', score: 95 },
  { name: 'Bob', score: 87 },
  { name: 'Charlie', score: 92 }
]);

users.each((user, index) => {
  console.log(`${index + 1}. ${user.name}: ${user.score}`);
});
// 1. Alice: 95
// 2. Bob: 87
// 3. Charlie: 92
```

**Example - Early exit:**

```typescript
let sum = 0;

users.each((user, index) => {
  if (user.score < 90) {
    return false;  // Stop iteration
  }
  sum += user.score;
});
// Stops at Bob (score 87), sum = 95 (only Alice)
```

**Example - Process until condition:**

```typescript
const orders = new Collection([...]);

let total = 0;
const limit = 1000;

orders.each(order => {
  if (total >= limit) {
    return false;  // Stop when limit reached
  }
  total += order.amount;
});

console.log(`Processed $${total}`);
```

**Example - Find first match:**

```typescript
let found: User | undefined;

users.each(user => {
  if (user.email === 'target@example.com') {
    found = user;
    return false;  // Stop when found
  }
});
```

**Example - Side effects with chaining:**

```typescript
users
  .filter({ active: true })
  .each(user => {
    sendEmail(user.email);
  })
  .each((user, index) => {
    console.log(`Sent email ${index + 1} of ${users.length}`);
  });
```

**Difference from forEach():**

```typescript
// forEach() - cannot stop early
users.forEach(user => {
  console.log(user);
  // No way to break
});

// each() - can stop early
users.each(user => {
  console.log(user);
  if (condition) return false;  // Stops iteration
});
```

**Note:** Returns collection for chaining:

```typescript
const result = users
  .each(user => trackView(user))
  .filter({ verified: true })
  .sort('name', 'asc');
```

---

## random()

### `random(length?: number): T[]`

Returns random elements from the collection. Does **not** mutate the collection.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `length` | `number` | `Infinity` | Number of random elements to return |

**Returns:** `T[]` - Array of random elements (plain array, not Collection)

**Example - Get single random element:**

```typescript
const users = new Collection([...100 users...]);

const randomUser = users.random(1)[0];
console.log(randomUser);
```

**Example - Get multiple random elements:**

```typescript
const products = new Collection([...50 products...]);

const featured = products.random(5);
// Returns 5 random products
```

**Example - Get all in random order:**

```typescript
const items = new Collection([1, 2, 3, 4, 5]);

const shuffled = items.random();
// Returns all items in random order, e.g., [3, 1, 5, 2, 4]
```

**Example - Random sampling:**

```typescript
// Get 10% sample for testing
const sampleSize = Math.ceil(users.length * 0.1);
const sample = users.random(sampleSize);
```

**Example - Random winners:**

```typescript
const entries = new Collection([...contest entries...]);

const winners = entries
  .filter({ eligible: true })
  .random(3);

console.log('Winners:', winners);
```

**Edge Cases:**

```typescript
// Empty collection
new Collection([]).random(5);  // []

// Length greater than collection
new Collection([1, 2, 3]).random(10);  // [1, 2, 3] (all items)

// Length of 0
items.random(0);  // []
```

**Immutability Note:**

```typescript
const original = new Collection([1, 2, 3, 4, 5]);
const randomItems = original.random(3);

console.log(original.length);  // 5 (unchanged)
console.log(randomItems.length);  // 3
```

**Difference from shuffle():**

```typescript
// random() - immutable, returns array
const randomItems = items.random(3);
console.log(items);  // Unchanged

// shuffle() - mutable, returns collection
items.shuffle();
console.log(items);  // Reordered in place
```

---

## shuffle()

### `shuffle(): this`

Randomly reorders elements in the collection. This method **mutates** the collection.

**Returns:** `this` - The shuffled collection (for chaining)

**Example - Basic shuffle:**

```typescript
const deck = new Collection([
  '♠A', '♠2', '♠3', '♠4', '♠5',
  '♥A', '♥2', '♥3', '♥4', '♥5'
]);

deck.shuffle();
// deck is now randomly ordered, e.g., ['♥3', '♠A', '♠5', '♥2', ...]
```

**Example - Shuffle and deal:**

```typescript
const cards = new Collection([...52 cards...]);

cards.shuffle();

const player1 = cards.slice(0, 5);
const player2 = cards.slice(5, 10);
const player3 = cards.slice(10, 15);
```

**Example - Random quiz questions:**

```typescript
const questions = new Collection([...quiz questions...]);

questions
  .shuffle()
  .slice(0, 10)
  .each((question, index) => {
    console.log(`Q${index + 1}: ${question.text}`);
  });
```

**Mutability Note:**

```typescript
const original = new Collection([1, 2, 3, 4, 5]);

original.shuffle();

console.log(original);
// [3, 1, 5, 2, 4] - Reordered in place
```

To shuffle without mutation:

```typescript
const shuffled = original.random();  // Use random() instead
console.log(original);  // [1, 2, 3, 4, 5] - Unchanged
```

**Chaining:**

```typescript
const result = items
  .filter({ available: true })
  .shuffle()
  .slice(0, 5);
// Get 5 random available items
```

---

## dump()

### `dump(): this`

Prints the collection to console and continues execution. Useful for debugging chains.

**Returns:** `this` - The collection (for chaining)

**Example - Debug in chain:**

```typescript
const result = users
  .filter({ active: true })
  .dump()  // Prints active users
  .sort('name', 'asc')
  .dump()  // Prints sorted active users
  .paginate(1, 20);
```

**Example - Inspect transformation:**

```typescript
const processed = orders
  .filter({ status: 'completed' })
  .dump()  // See what's being processed
  .map(order => ({
    id: order.id,
    total: order.items.reduce((sum, item) => sum + item.price, 0)
  }))
  .dump();  // See final result
```

**Example - Checkpoint debugging:**

```typescript
const data = new Collection(rawData)
  .dump()  // Checkpoint 1: raw data
  .filter({ valid: true })
  .dump()  // Checkpoint 2: after filter
  .unique('email')
  .dump()  // Checkpoint 3: after unique
  .sort('created_at', 'desc');
```

**Output format:**

```typescript
users.dump();
// Logs to console:
// Collection(3) [
//   { id: 1, name: 'Alice' },
//   { id: 2, name: 'Bob' },
//   { id: 3, name: 'Charlie' }
// ]
```

---

## dd()

### `dd(): never`

"Dump and Die" - prints collection to console and exits the process (Node.js only). Useful for debugging.

**Returns:** Never returns (exits process)

**Example - Debug and stop:**

```typescript
users
  .filter({ role: 'admin' })
  .dd();  // Prints admins and exits

// Code after this never executes
console.log('This will not run');
```

**Example - Inspect at specific point:**

```typescript
const result = orders
  .filter({ status: 'pending' })
  .where('total', '>=', 1000);

if (result.length > 100) {
  result.dd();  // Investigate why so many large pending orders
}
```

**Note:** Only works in Node.js:

```typescript
// In Node.js
users.dd();  // Prints and calls process.exit(1)

// In browser
users.dd();  // Only prints (no process.exit)
```

**Difference from dump():**

```typescript
// dump() - continues execution
users.dump().sort('name');  // Prints, then sorts

// dd() - stops execution
users.dd().sort('name');  // Prints and exits, sort never runs
```

---

## stringify()

### `stringify(replacer?: (key: string, value: any) => any, space?: string | number): string`

Converts collection to JSON string. Wrapper around JSON.stringify with collection context.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `replacer` | `(key: string, value: any) => any` | Optional function to transform values |
| `space` | `string \| number` | Optional spacing for pretty-printing |

**Returns:** `string` - JSON string representation

**Example - Basic stringify:**

```typescript
const users = new Collection([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

const json = users.stringify();
// '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]'
```

**Example - Pretty print:**

```typescript
const json = users.stringify(null, 2);
// [
//   {
//     "id": 1,
//     "name": "Alice"
//   },
//   {
//     "id": 2,
//     "name": "Bob"
//   }
// ]
```

**Example - Custom replacer:**

```typescript
const json = users.stringify((key, value) => {
  if (key === 'password') return undefined;  // Exclude passwords
  if (typeof value === 'string') return value.toUpperCase();
  return value;
});
```

**Example - Save to file:**

```typescript
import { writeFileSync } from 'fs';

const data = users
  .filter({ active: true })
  .stringify(null, 2);

writeFileSync('users.json', data);
```

**Example - API response:**

```typescript
app.get('/api/users', (req, res) => {
  const users = new Collection(await db.users.findAll());

  res.setHeader('Content-Type', 'application/json');
  res.send(users.stringify());
});
```

**Example - Filtering sensitive data:**

```typescript
const safeJson = users.stringify((key, value) => {
  const sensitive = ['password', 'ssn', 'credit_card'];
  return sensitive.includes(key) ? '[REDACTED]' : value;
});
```

**Edge Cases:**

```typescript
// Empty collection
new Collection([]).stringify();  // '[]'

// With Date objects
const events = new Collection([
  { name: 'Event', date: new Date() }
]);
events.stringify(null, 2);
// Date is converted to ISO string
```

## Method Chaining

Utility methods integrate seamlessly into method chains:

```typescript
const result = users
  .filter({ verified: true })
  .update({ status: 'active' })  // Update verified users
  .dump()                         // Debug: see updated users
  .shuffle()                      // Randomize order
  .slice(0, 10);                  // Take first 10

// Delete inactive, log action
const deleted = users.delete({ active: false });
console.log(`Removed ${deleted} inactive users`);

// Process with early exit
users.each(user => {
  processUser(user);
  if (shouldStop()) return false;
});
```

## Mutability Reference

**Mutating Methods** (modify original):
- `update()` - Modifies matching elements in place
- `delete()` - Removes matching elements from collection
- `shuffle()` - Reorders elements randomly in place

**Immutable Methods** (do not modify):
- `each()` - Only iterates, doesn't modify
- `random()` - Returns array, original unchanged
- `dump()` - Only logs, doesn't modify
- `dd()` - Only logs, doesn't modify
- `stringify()` - Returns string, doesn't modify

**Safe Mutation Pattern:**

```typescript
// Clone first to avoid mutating original
const processed = users
  .collect()                // Clone
  .update({ verified: true })  // Safe to mutate clone
  .delete({ spam: true })      // Safe to mutate clone
  .shuffle();                  // Safe to mutate clone

// Original unchanged
console.log(users);  // Unmodified
```

## Performance Considerations

**update() and delete() optimization:**

```typescript
// ❌ Bad: Multiple passes
users.update({ type: 'A' }, { status: 'active' });
users.update({ type: 'B' }, { status: 'pending' });

// ✅ Good: Single pass with complex query
users.update({ type: { $in: ['A', 'B'] } }, data => ({
  status: data.type === 'A' ? 'active' : 'pending'
}));
```

**each() vs forEach():**

```typescript
// each() allows early exit (more efficient for large collections)
users.each(user => {
  if (found) return false;  // Stop early
  if (user.id === targetId) found = user;
});

// forEach() always iterates all elements
users.forEach(user => {
  if (found) return;  // Still continues iteration
  if (user.id === targetId) found = user;
});
```

## See Also

- [Transformation Methods](transformation-methods.md) - Data transformation
- [Filtering Methods](filtering-methods.md) - Query and filter data
- [Aggregation Methods](aggregation-methods.md) - Calculate statistics
- [Best Practices](../guides/best-practices.md) - Usage patterns and optimization
