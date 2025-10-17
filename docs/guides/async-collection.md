# AsyncCollection Guide

Welcome to the AsyncCollection guide! This guide introduces the deferred query builder pattern for creating abstractions over any data source including ORMs, REST APIs, GraphQL, and more.

## What is AsyncCollection?

AsyncCollection implements a Query Builder Pattern that constructs a "query plan" (array of operations) that executes when the promise resolves. This allows creating powerful abstractions over any data source by transforming operations into the specific format required by your ORM or API.

### Key Features

- **Deferred Execution**: Operations are registered but not executed until you await or call `.then()`
- **ORM Agnostic**: Works with Prisma, TypeORM, Sequelize, Mongoose, or any data source
- **Type Safe**: Full TypeScript support with generics
- **Chainable**: Fluent interface for building complex queries
- **Flexible**: Transform operations to match your data source format

## When to Use AsyncCollection

Use AsyncCollection when you need to:

- Create abstractions over database ORMs
- Build reusable query interfaces for REST APIs
- Implement custom data access layers
- Unify different data sources under a common interface
- Defer query execution until all filters are applied

## Basic Concepts

### The Executor Function

The executor is the core of AsyncCollection. It receives a context containing all operations and returns the results:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

const executor = async ({ operations, validators, metadata }) => {
  // operations: Array of [method_name, ...args]
  // validators: Custom validators (optional)
  // metadata: Query info (created_at, operation_count, chain_depth)

  console.log(`Processing ${metadata.operation_count} operations`);

  // Transform operations to your format
  // Execute query
  // Return results

  return results;
};

const collection = new AsyncCollection(executor);
```

### Operation Registration

When you chain methods, they're registered as operations:

```typescript
const users = new AsyncCollection(executor);

// These register operations but DON'T execute yet
users
  .where('age', '>=', 18)
  .where('status', 'active')
  .sort('name', 'asc');

// Execution happens here (when promise resolves)
const results = await users;
```

### ExecutorContext

The context passed to your executor contains:

```typescript
interface ExecutorContext<T, V> {
  // Array of operations: [method_name, ...args]
  operations: [string, ...any[]][];

  // Custom validators for query()
  validators?: V;

  // Metadata about the query
  metadata: {
    created_at: Date;
    operation_count: number;
    chain_depth: number;
  };
}
```

## Simple Example: In-Memory Array

Let's start with a simple example using an in-memory array:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

// In-memory data
const data = [
  { id: 1, name: "Alice", age: 25, status: "active" },
  { id: 2, name: "Bob", age: 30, status: "inactive" },
  { id: 3, name: "Charlie", age: 35, status: "active" }
];

// Simple executor
const users = new AsyncCollection(async ({ operations }) => {
  let results = [...data];

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      results = results.filter(item => {
        if (operator === '>=') return item[key] >= value;
        if (operator === '=') return item[key] === value;
        return true;
      });
    }

    if (method === 'first') {
      results = [results[0]];
    }
  });

  return results;
});

// Use it
const active = await users.where('status', 'active');
// [{ id: 1, ... }, { id: 3, ... }]

const firstAdult = await users.where('age', '>=', 25).first();
// { id: 1, name: "Alice", ... }
```

## Working with Prisma

Transform operations to Prisma queries:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = new AsyncCollection(async ({ operations }) => {
  const where: any = {};
  let orderBy: any = undefined;
  let take: number | undefined;

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      if (operator === '>=') where[key] = { gte: value };
      else if (operator === '>') where[key] = { gt: value };
      else if (operator === '=') where[key] = value;
    }

    if (method === 'sort') {
      const [key, direction] = args;
      orderBy = { [key]: direction || 'asc' };
    }
  });

  const lastOp = operations[operations.length - 1];
  if (lastOp && lastOp[0] === 'first') {
    return await prisma.user.findFirst({ where, orderBy });
  }

  return await prisma.user.findMany({ where, orderBy, take });
});

// Use it like Collection
const active = await users
  .where('age', '>=', 18)
  .where('verified', true)
  .sort('createdAt', 'desc');

const firstUser = await users
  .where('status', 'active')
  .first();
```

## Working with TypeORM

Build TypeORM QueryBuilder from operations:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { getRepository } from "typeorm";
import { User } from "./entities/User";

const users = new AsyncCollection(async ({ operations }) => {
  const qb = getRepository(User).createQueryBuilder('user');

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const paramKey = `${key}_${Math.random()}`;

      if (operator === '>=') {
        qb.andWhere(`user.${key} >= :${paramKey}`, { [paramKey]: value });
      } else if (operator === '=') {
        qb.andWhere(`user.${key} = :${paramKey}`, { [paramKey]: value });
      }
    }

    if (method === 'sort') {
      const [key, direction] = args;
      qb.orderBy(`user.${key}`, direction?.toUpperCase() || 'ASC');
    }
  });

  const lastOp = operations[operations.length - 1];
  if (lastOp && lastOp[0] === 'first') {
    return await qb.getOne();
  }

  return await qb.getMany();
});

// Chain operations
const result = await users
  .where('age', '>=', 21)
  .where('status', 'active')
  .sort('name', 'asc');
```

## Custom Validators

Extend query capabilities with custom validators:

```typescript
const customValidators = {
  // Check if date is in the past
  $isPast(ref: string, value: boolean) {
    return (item: any) => {
      const date = new Date(item[ref]);
      const isPast = date < new Date();
      return value ? isPast : !isPast;
    };
  },

  // Check if value is within range
  $between(ref: string, range: [number, number]) {
    return (item: any) => {
      const val = item[ref];
      return val >= range[0] && val <= range[1];
    };
  }
};

const items = new AsyncCollection(
  async ({ operations, validators }) => {
    // Use validators to process operations
    // Transform to your data source format
    return processData(operations, validators);
  },
  customValidators
);

// Use custom validators
await items.filter({
  eventDate: { $isPast: true },
  score: { $between: [50, 100] }
});
```

## Method Chaining

Chain multiple operations fluently:

```typescript
const users = new AsyncCollection(executor);

const result = await users
  .where('age', '>=', 18)
  .where('status', 'active')
  .not({ deleted: true })
  .sort('createdAt', 'desc')
  .slice(0, 10)
  .map(user => ({
    id: user.id,
    name: user.name,
    displayName: `${user.name} (${user.age})`
  }));
```

## Supported Operations

AsyncCollection supports all Collection methods:

### Filtering
- `where(key, value)` or `where(key, operator, value)`
- `whereNot(key, value)` or `whereNot(key, operator, value)`
- `filter(handler)` - Function or query object
- `not(handler)` - Inverse filter

### Finding
- `first(handler?)` - First matching element
- `last(handler?)` - Last matching element
- `find(handler)` - Alias for first

### Transformation
- `map(handler)` - Transform elements
- `each(handler)` - Iterate elements
- `forget(...keys)` - Remove fields

### Sorting & Ordering
- `sort(key, direction)` or `sort(compareFunction)`
- `reverse()` - Reverse order
- `shuffle()` - Random order

### Slicing & Pagination
- `slice(start, end?)` - Array slice
- `chunk(size)` - Divide into chunks
- `paginate(page, perPage)` - Paginate results

### Aggregation
- `sum(key)` - Sum values
- `max(key)` - Maximum value
- `min(key)` - Minimum value
- `groupBy(key)` - Group by key
- `countBy(key)` - Count by key

### Utility
- `unique(key)` - Unique elements
- `random(count?)` - Random elements
- `every(handler)` - Validate all
- `collect(items?)` - Clone context

### Debugging
- `dump()` - Print to console
- `dd()` - Dump and die (Node.js)
- `stringify(replacer?, space?)` - Convert to JSON

## Error Handling

Handle errors in your executor:

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  try {
    // Build and execute query
    const results = await executeQuery(operations);
    return results;
  } catch (error) {
    console.error('Query failed:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
});

// Handle errors when awaiting
try {
  const results = await users.where('age', '>=', 18);
} catch (error) {
  console.error('Error:', error);
}

// Or with .catch()
users
  .where('age', '>=', 18)
  .then(results => console.log(results))
  .catch(error => console.error(error));
```

## Best Practices

### 1. Validate Operations

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  // Validate operations before executing
  const hasInvalidOp = operations.some(([method]) =>
    !['where', 'sort', 'first'].includes(method)
  );

  if (hasInvalidOp) {
    throw new Error('Unsupported operation');
  }

  return processOperations(operations);
});
```

### 2. Handle Terminal Operations

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  const lastOp = operations[operations.length - 1];

  // Check for terminal operations
  if (lastOp && lastOp[0] === 'first') {
    return await findFirst(operations.slice(0, -1));
  }

  if (lastOp && lastOp[0] === 'last') {
    return await findLast(operations.slice(0, -1));
  }

  return await findMany(operations);
});
```

### 3. Optimize Query Building

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  // Group operations by type for efficient processing
  const where_ops = operations.filter(([m]) => m === 'where');
  const sort_ops = operations.filter(([m]) => m === 'sort');

  // Build optimized query
  const query = buildQuery({ where_ops, sort_ops });

  return await executeQuery(query);
});
```

## Next Steps

- Check out [API Reference](../api/async-collection-class.md) for complete method documentation
- See [Usage Examples](../examples/async-collection-usage.md) for real-world patterns
- Learn about [TypeScript Usage](../advanced/typescript-usage.md) for type safety

## Common Patterns

### REST API Wrapper

```typescript
const api = new AsyncCollection(async ({ operations }) => {
  const params = new URLSearchParams();

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, value] = args.length === 2 ? args : [args[0], args[2]];
      params.append(key, value);
    }
  });

  const response = await fetch(`/api/users?${params}`);
  return await response.json();
});

const users = await api.where('status', 'active');
```

### GraphQL Builder

```typescript
const gql = new AsyncCollection(async ({ operations }) => {
  const filters = operations
    .filter(([m]) => m === 'where')
    .map(([_, key, value]) => `${key}: "${value}"`);

  const query = `
    query {
      users(where: { ${filters.join(', ')} }) {
        id name email
      }
    }
  `;

  const response = await graphqlClient.query(query);
  return response.data.users;
});
```

## Tips

1. **Keep executors focused** - One responsibility per AsyncCollection
2. **Validate operations** - Reject unsupported operations early
3. **Handle edge cases** - Check for terminal operations like first/last
4. **Type everything** - Use TypeScript generics for type safety
5. **Test thoroughly** - Unit test your executor with different operation chains
