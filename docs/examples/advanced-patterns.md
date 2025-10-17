# Advanced Patterns

Advanced patterns and real-world techniques for using `@arcaelas/collection` in production applications.

## Complex Queries

### Multi-Level Nested Queries

Combine multiple operators and nested conditions for complex data filtering:

```typescript
interface User {
  id: number;
  name: string;
  profile: {
    age: number;
    verified: boolean;
    subscription: {
      tier: string;
      expiresAt: Date;
    };
  };
  permissions: string[];
  metadata: Record<string, any>;
}

const users = new Collection<User>([...]);

// Find premium users with specific criteria
const eligibleUsers = users.filter({
  // Profile validations
  'profile.verified': true,
  'profile.age': { $gte: 18, $lte: 65 },

  // Subscription checks
  'profile.subscription.tier': { $in: ['premium', 'enterprise'] },
  'profile.subscription.expiresAt': { $gt: Date.now() },

  // Permission requirements
  permissions: {
    $contains: 'access:dashboard',
    $not: { $contains: 'restricted' }
  },

  // Metadata filtering
  'metadata.region': { $regex: /^(US|EU|UK)$/ },
  'metadata.lastLogin': { $exists: true }
});
```

### Dynamic Query Building

Build queries programmatically based on runtime conditions:

```typescript
function buildUserQuery(filters: {
  age?: { min?: number; max?: number };
  verified?: boolean;
  roles?: string[];
  search?: string;
}) {
  const query: any = {};

  if (filters.age) {
    query['profile.age'] = {};
    if (filters.age.min !== undefined) {
      query['profile.age'].$gte = filters.age.min;
    }
    if (filters.age.max !== undefined) {
      query['profile.age'].$lte = filters.age.max;
    }
  }

  if (filters.verified !== undefined) {
    query['profile.verified'] = filters.verified;
  }

  if (filters.roles && filters.roles.length > 0) {
    query.roles = { $in: filters.roles };
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: new RegExp(filters.search, 'i') } },
      { email: { $regex: new RegExp(filters.search, 'i') } }
    ];
  }

  return query;
}

// Usage
const query = buildUserQuery({
  age: { min: 21, max: 65 },
  verified: true,
  roles: ['admin', 'moderator'],
  search: 'john'
});

const results = users.filter(query);
```

### Computed Filters

Combine queries with computed functions for complex business logic:

```typescript
const activeOrders = orders.filter(order => {
  // Complex date logic
  const daysSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const isRecent = daysSinceOrder <= 30;

  // Complex calculation
  const totalWithTax = order.items.reduce((sum, item) =>
    sum + (item.price * item.quantity * (1 + item.taxRate)), 0
  );
  const isSignificant = totalWithTax >= 1000;

  // Business rules
  const hasValidStatus = ['pending', 'processing', 'shipped'].includes(order.status);
  const customerTier = order.customer.tier;

  return isRecent && isSignificant && hasValidStatus &&
         (customerTier === 'premium' || totalWithTax >= 2000);
});
```

## Custom Macros

### Repository Pattern

Create a custom repository with domain-specific methods:

```typescript
class UserRepository extends Collection<User> {
  constructor(users: User[]) {
    super(users);

    // Add domain-specific macros
    this.macro('active', function() {
      return this.filter({ active: true, deletedAt: { $exists: false } });
    });

    this.macro('admins', function() {
      return this.filter({ roles: { $contains: 'admin' } });
    });

    this.macro('verified', function() {
      return this.filter({ emailVerified: true, phoneVerified: true });
    });

    this.macro('byTier', function(tier: string) {
      return this.filter({ 'subscription.tier': tier });
    });

    this.macro('recentlyActive', function(days: number = 7) {
      const threshold = Date.now() - (days * 24 * 60 * 60 * 1000);
      return this.filter({ lastActivityAt: { $gte: threshold } });
    });
  }

  // Additional methods
  findByEmail(email: string): User | undefined {
    return this.first({ email });
  }

  findById(id: number): User | undefined {
    return this.first({ id });
  }

  getTierDistribution() {
    return this.countBy('subscription.tier');
  }
}

// Usage
const userRepo = new UserRepository(await db.users.findAll());

const premiumActiveUsers = userRepo
  .active()
  .verified()
  .byTier('premium')
  .recentlyActive(30);

const admin = userRepo.findByEmail('admin@example.com');
```

### Query Builder Macro

Create a fluent query builder using macros:

```typescript
Collection.macro('query', function() {
  return new QueryBuilder(this);
});

class QueryBuilder<T> {
  private collection: Collection<T>;
  private conditions: any[] = [];

  constructor(collection: Collection<T>) {
    this.collection = collection;
  }

  where(field: string, operator: string, value: any) {
    this.conditions.push({ field, operator, value });
    return this;
  }

  orWhere(field: string, operator: string, value: any) {
    // Implementation for OR conditions
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.collection = this.collection.sort(field, direction);
    return this;
  }

  limit(count: number) {
    this.collection = this.collection.slice(0, count) as Collection<T>;
    return this;
  }

  execute(): Collection<T> {
    // Build final query from conditions
    const query = this.conditions.reduce((acc, cond) => {
      acc[cond.field] = { [`$${cond.operator}`]: cond.value };
      return acc;
    }, {});

    return this.collection.filter(query);
  }
}

// Usage
const results = users
  .query()
  .where('age', 'gte', 18)
  .where('status', 'eq', 'active')
  .orderBy('created_at', 'desc')
  .limit(50)
  .execute();
```

## Performance Optimization

### Lazy Evaluation

Defer expensive operations until results are needed:

```typescript
class LazyCollection<T> {
  private data: T[];
  private operations: Array<(data: T[]) => T[]> = [];

  constructor(data: T[]) {
    this.data = data;
  }

  filter(predicate: (item: T) => boolean) {
    this.operations.push(data => data.filter(predicate));
    return this;
  }

  map<U>(mapper: (item: T) => U): LazyCollection<U> {
    this.operations.push(data => data.map(mapper) as any);
    return this as any;
  }

  take(count: number) {
    this.operations.push(data => data.slice(0, count));
    return this;
  }

  execute(): T[] {
    return this.operations.reduce((data, op) => op(data), this.data);
  }
}

// Execute only when needed
const result = new LazyCollection(largeDataset)
  .filter(x => x.active)
  .map(x => ({ ...x, computed: heavyComputation(x) }))
  .take(10)
  .execute();  // Only processes first 10 active items
```

### Memoization

Cache expensive query results:

```typescript
class MemoizedCollection<T> extends Collection<T> {
  private cache = new Map<string, any>();

  filter(query: any): Collection<T> {
    const key = JSON.stringify(query);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = super.filter(query);
    this.cache.set(key, result);
    return result;
  }

  clearCache() {
    this.cache.clear();
  }
}

// Subsequent calls use cached results
const users = new MemoizedCollection(data);
users.filter({ active: true });  // Computed
users.filter({ active: true });  // Cached
```

### Batch Processing

Process large datasets in chunks to avoid memory issues:

```typescript
async function processBatched<T, R>(
  collection: Collection<T>,
  batchSize: number,
  processor: (batch: T[]) => Promise<R>
): Promise<R[]> {
  const chunks = collection.chunk(batchSize);
  const results: R[] = [];

  for (const chunk of chunks) {
    const result = await processor(chunk);
    results.push(result);

    // Optional: Yield to event loop
    await new Promise(resolve => setImmediate(resolve));
  }

  return results;
}

// Process 1M records in batches
const users = new Collection(millionUsers);

await processBatched(users, 1000, async (batch) => {
  await sendEmails(batch);
  return { sent: batch.length };
});
```

### Index-Based Lookups

Create indices for fast lookups on large collections:

```typescript
class IndexedCollection<T> extends Collection<T> {
  private indices = new Map<string, Map<any, T[]>>();

  createIndex(key: string) {
    const index = new Map<any, T[]>();

    this.forEach(item => {
      const value = (item as any)[key];
      if (!index.has(value)) {
        index.set(value, []);
      }
      index.get(value)!.push(item);
    });

    this.indices.set(key, index);
  }

  findByIndex(key: string, value: any): T[] {
    const index = this.indices.get(key);
    if (!index) {
      throw new Error(`Index '${key}' not found`);
    }
    return index.get(value) || [];
  }
}

// O(1) lookups instead of O(n)
const users = new IndexedCollection(millionUsers);
users.createIndex('email');
users.createIndex('country');

const user = users.findByIndex('email', 'john@example.com')[0];  // Instant
const usUsers = users.findByIndex('country', 'US');  // Instant
```

## Integration Patterns

### Prisma Integration

Use AsyncCollection with Prisma for deferred query execution:

```typescript
import { PrismaClient } from '@prisma/client';
import AsyncCollection from '@arcaelas/collection/async';

const prisma = new PrismaClient();

const users = new AsyncCollection(async ({ operations }) => {
  const where: any = {};
  const orderBy: any[] = [];
  let take: number | undefined;
  let skip: number | undefined;

  operations.forEach(([method, ...args]) => {
    switch (method) {
      case 'where':
        const [key, op, val] = args.length === 3 ? args : [args[0], '=', args[1]];
        if (op === '>=') {
          where[key] = { gte: val };
        } else if (op === '>') {
          where[key] = { gt: val };
        } else {
          where[key] = val;
        }
        break;

      case 'sort':
        orderBy.push({ [args[0]]: args[1] || 'asc' });
        break;

      case 'paginate':
        const [page, perPage] = args;
        skip = (page - 1) * perPage;
        take = perPage;
        break;
    }
  });

  return await prisma.user.findMany({ where, orderBy, take, skip });
});

// Builds and executes Prisma query
const result = await users
  .where('age', '>=', 18)
  .where('verified', true)
  .sort('created_at', 'desc')
  .paginate(1, 20);
```

### GraphQL Resolver

Use Collection to process GraphQL results:

```typescript
const resolvers = {
  Query: {
    users: async (_: any, args: any, context: any) => {
      const allUsers = await context.db.users.findAll();
      const users = new Collection(allUsers);

      let result = users;

      if (args.filter) {
        if (args.filter.role) {
          result = result.filter({ role: args.filter.role });
        }
        if (args.filter.verified !== undefined) {
          result = result.filter({ verified: args.filter.verified });
        }
        if (args.filter.search) {
          result = result.filter(user =>
            user.name.toLowerCase().includes(args.filter.search.toLowerCase())
          );
        }
      }

      if (args.orderBy) {
        const [field, direction] = args.orderBy.split('_');
        result = result.sort(field, direction.toLowerCase());
      }

      if (args.pagination) {
        const { page, perPage } = args.pagination;
        const paginated = result.paginate(page, perPage);

        return {
          items: paginated.items,
          pageInfo: {
            currentPage: page,
            hasNextPage: !!paginated.next,
            hasPreviousPage: !!paginated.prev
          }
        };
      }

      return { items: result, pageInfo: { currentPage: 1, hasNextPage: false, hasPreviousPage: false } };
    }
  }
};
```

### REST API Middleware

Create Express middleware for collection-based filtering:

```typescript
import express from 'express';

function collectionMiddleware<T>(
  dataFetcher: () => Promise<T[]>
) {
  return async (req: express.Request, res: express.Response) => {
    const data = await dataFetcher();
    let collection = new Collection(data);

    // Apply filters from query params
    if (req.query.filter) {
      const filters = JSON.parse(req.query.filter as string);
      collection = collection.filter(filters);
    }

    // Apply sorting
    if (req.query.sort) {
      const [field, direction] = (req.query.sort as string).split(':');
      collection = collection.sort(field, direction as 'asc' | 'desc');
    }

    // Apply pagination
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 20;
    const paginated = collection.paginate(page, perPage);

    res.json({
      data: paginated.items,
      meta: {
        total: collection.length,
        page,
        perPage,
        hasMore: !!paginated.next
      }
    });
  };
}

// Usage
app.get('/api/users', collectionMiddleware(async () =>
  await db.users.findAll()
));
```

## Data Processing Pipelines

### ETL Pipeline

Extract, transform, and load data using Collection:

```typescript
async function etlPipeline() {
  // Extract
  const rawData = await fetchFromApi();

  // Transform
  const processed = new Collection(rawData)
    // Validation
    .filter(item => item.id && item.name && item.email)

    // Normalize
    .map(item => ({
      ...item,
      email: item.email.toLowerCase().trim(),
      name: item.name.trim(),
      createdAt: new Date(item.createdAt)
    }))

    // Deduplicate
    .unique('email')

    // Enrich
    .map(item => ({
      ...item,
      domain: item.email.split('@')[1],
      accountAge: Date.now() - item.createdAt.getTime()
    }))

    // Filter
    .filter({ active: true })
    .filter(item => item.accountAge > 0)

    // Sort
    .sort('createdAt', 'desc');

  // Load
  await Promise.all(
    processed.chunk(100).map(batch =>
      db.users.insertMany(batch)
    )
  );

  return {
    total: rawData.length,
    processed: processed.length,
    rejected: rawData.length - processed.length
  };
}
```

### Stream Processing

Process data streams with Collection:

```typescript
import { Readable } from 'stream';

class CollectionStream<T> extends Readable {
  private collection: Collection<T>;
  private index = 0;

  constructor(collection: Collection<T>) {
    super({ objectMode: true });
    this.collection = collection;
  }

  _read() {
    if (this.index < this.collection.length) {
      this.push(this.collection[this.index]);
      this.index++;
    } else {
      this.push(null);  // End stream
    }
  }
}

// Usage
const users = new Collection([...]);
const stream = new CollectionStream(users.filter({ active: true }));

stream
  .on('data', async (user) => {
    await processUser(user);
  })
  .on('end', () => {
    console.log('Processing complete');
  });
```

## State Management

### React State Management

Use Collection for complex state operations:

```typescript
import { useState, useCallback } from 'react';

function useCollectionState<T>(initial: T[]) {
  const [data, setData] = useState(() => new Collection(initial));

  const filter = useCallback((query: any) => {
    setData(prev => prev.filter(query));
  }, []);

  const add = useCallback((item: T) => {
    setData(prev => new Collection([...prev, item]));
  }, []);

  const update = useCallback((where: any, values: Partial<T>) => {
    setData(prev => {
      const updated = prev.collect();
      updated.update(where, values);
      return updated;
    });
  }, []);

  const remove = useCallback((where: any) => {
    setData(prev => {
      const updated = prev.collect();
      updated.delete(where);
      return updated;
    });
  }, []);

  return { data, filter, add, update, remove };
}

// Usage in component
function UserList() {
  const { data, filter, add, update, remove } = useCollectionState(users);

  return (
    <div>
      <button onClick={() => filter({ active: true })}>
        Show Active
      </button>
      {data.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onUpdate={(values) => update({ id: user.id }, values)}
          onDelete={() => remove({ id: user.id })}
        />
      ))}
    </div>
  );
}
```

## Testing Patterns

### Test Fixtures

Create reusable test data with Collection:

```typescript
class TestDataFactory {
  static users(count: number = 10) {
    return new Collection(
      Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@test.com`,
        active: i % 2 === 0,
        role: i % 3 === 0 ? 'admin' : 'user'
      }))
    );
  }

  static orders(userId: number, count: number = 5) {
    return new Collection(
      Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        userId,
        total: Math.random() * 1000,
        status: ['pending', 'completed', 'cancelled'][i % 3],
        createdAt: new Date(Date.now() - i * 86400000)
      }))
    );
  }
}

// Usage in tests
describe('UserService', () => {
  it('should filter active users', () => {
    const users = TestDataFactory.users(100);
    const service = new UserService(users);

    const active = service.getActiveUsers();

    expect(active.length).toBe(50);
    expect(active.every({ active: true })).toBe(true);
  });
});
```

### Mock AsyncCollection

Mock async data sources for testing:

```typescript
class MockAsyncCollection<T> extends AsyncCollection<T> {
  private mockData: T[];

  constructor(data: T[]) {
    super(async () => data);
    this.mockData = data;
  }

  // Add test helpers
  reset(data: T[]) {
    this.mockData = data;
  }

  getMockData() {
    return this.mockData;
  }
}

// Usage
describe('API Integration', () => {
  it('should fetch and filter users', async () => {
    const mockUsers = new MockAsyncCollection([
      { id: 1, name: 'Alice', active: true },
      { id: 2, name: 'Bob', active: false }
    ]);

    const result = await mockUsers.where('active', true);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });
});
```

## See Also

- [Core Concepts](../guides/core-concepts.md) - Fundamental principles
- [Best Practices](../guides/best-practices.md) - Coding standards
- [Performance Guide](../advanced/performance.md) - Optimization techniques
- [TypeScript Usage](../advanced/typescript-usage.md) - Type safety patterns
