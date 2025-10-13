# Core Concepts

Learn the fundamental concepts behind `@arcaelas/collection`.

## Collections as Enhanced Arrays

Collections extend native JavaScript arrays with powerful methods:

```typescript
const collection = new Collection([1, 2, 3]);
// Has all Array methods plus Collection methods
```

## Type Safety

Use TypeScript generics for type-safe collections:

```typescript
interface User {
  id: number;
  name: string;
}

const users = new Collection<User>([...]);
```

## Query Language

Collections support MongoDB-style queries:

```typescript
collection.filter({
  age: { $gte: 18 },
  status: { $in: ['active', 'pending'] }
});
```

## Immutability

Most methods return new collections:

```typescript
const original = new Collection([1, 2, 3]);
const filtered = original.filter(n => n > 1);
// original unchanged
```

## Method Chaining

Chain methods for fluent syntax:

```typescript
collection
  .filter({ active: true })
  .sort('age', 'desc')
  .slice(0, 10);
```

Next: [Query Operators](query-operators.md)
