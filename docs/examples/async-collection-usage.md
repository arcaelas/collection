# AsyncCollection Usage Examples

Real-world examples of using AsyncCollection with different data sources and patterns.

## Table of Contents

- [Basic In-Memory Example](#basic-in-memory-example)
- [Prisma ORM Integration](#prisma-orm-integration)
- [TypeORM Integration](#typeorm-integration)
- [Sequelize Integration](#sequelize-integration)
- [Mongoose Integration](#mongoose-integration)
- [REST API Wrapper](#rest-api-wrapper)
- [GraphQL Query Builder](#graphql-query-builder)
- [Redis Cache Layer](#redis-cache-layer)
- [Custom Validators](#custom-validators)
- [Complex Query Chains](#complex-query-chains)
- [Error Handling Patterns](#error-handling-patterns)
- [Performance Optimization](#performance-optimization)

## Basic In-Memory Example

Simple executor for filtering in-memory data:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive';
}

const data: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", age: 25, status: "active" },
  { id: 2, name: "Bob", email: "bob@example.com", age: 30, status: "inactive" },
  { id: 3, name: "Charlie", email: "charlie@example.com", age: 35, status: "active" }
];

const users = new AsyncCollection<User>(async ({ operations }) => {
  let results = [...data];

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      results = results.filter(item => {
        const itemValue = item[key as keyof User];

        switch (operator) {
          case '=': return itemValue === value;
          case '!=': return itemValue !== value;
          case '>': return itemValue > value;
          case '<': return itemValue < value;
          case '>=': return itemValue >= value;
          case '<=': return itemValue <= value;
          default: return true;
        }
      });
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      results.sort((a, b) => {
        const aVal = a[key as keyof User];
        const bVal = b[key as keyof User];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      });
    }

    if (method === 'first') {
      results = results.length > 0 ? [results[0]] : [];
    }

    if (method === 'slice') {
      const [start, end] = args;
      results = results.slice(start, end);
    }
  });

  return results;
});

// Usage
const activeUsers = await users.where('status', 'active');
// [{ id: 1, ... }, { id: 3, ... }]

const firstAdult = await users.where('age', '>=', 25).first();
// { id: 1, name: "Alice", ... }

const sorted = await users.sort('age', 'desc');
// [{ id: 3, ... }, { id: 2, ... }, { id: 1, ... }]
```

## Prisma ORM Integration

Complete Prisma integration with advanced query building:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { PrismaClient, User, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const users = new AsyncCollection<User>(async ({ operations, metadata }) => {
  let where: Prisma.UserWhereInput = {};
  let orderBy: Prisma.UserOrderByWithRelationInput | undefined;
  let take: number | undefined;
  let skip: number | undefined;
  let select: Prisma.UserSelect | undefined;

  console.log(`Building Prisma query with ${metadata.operation_count} operations`);

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const condition = buildWhereCondition(key, operator, value);
      where = { ...where, ...condition };
    }

    if (method === 'whereNot') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const condition = buildWhereCondition(key, operator, value);
      where = { ...where, NOT: condition };
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      orderBy = { [key]: direction };
    }

    if (method === 'slice') {
      const [start, end] = args;
      skip = start;
      take = end ? end - start : undefined;
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      skip = (page - 1) * perPage;
      take = perPage;
    }

    if (method === 'forget') {
      // Build select excluding specified fields
      select = buildSelectExcluding(args);
    }
  });

  // Check for terminal operations
  const lastOp = operations[operations.length - 1];

  if (lastOp && lastOp[0] === 'first') {
    const result = await prisma.user.findFirst({
      where,
      orderBy,
      select,
    });
    return result ? [result] : [];
  }

  if (lastOp && lastOp[0] === 'last') {
    const results = await prisma.user.findMany({
      where,
      orderBy: orderBy ? { [Object.keys(orderBy)[0]]: 'desc' } : undefined,
      select,
      take: 1,
    });
    return results;
  }

  return await prisma.user.findMany({
    where,
    orderBy,
    select,
    take,
    skip,
  });
});

function buildWhereCondition(
  key: string,
  operator: string,
  value: any
): Prisma.UserWhereInput {
  switch (operator) {
    case '=':
      return { [key]: value };
    case '!=':
      return { [key]: { not: value } };
    case '>':
      return { [key]: { gt: value } };
    case '<':
      return { [key]: { lt: value } };
    case '>=':
      return { [key]: { gte: value } };
    case '<=':
      return { [key]: { lte: value } };
    case 'in':
      return { [key]: { in: value } };
    case 'includes':
      return { [key]: { contains: value } };
    default:
      return { [key]: value };
  }
}

function buildSelectExcluding(excludeKeys: string[]): Prisma.UserSelect {
  // Get all User fields and exclude specified ones
  const allFields = ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt'];
  const select: any = {};

  allFields.forEach(field => {
    if (!excludeKeys.includes(field)) {
      select[field] = true;
    }
  });

  return select;
}

// Usage examples
const activeVerified = await users
  .where('status', 'active')
  .where('verified', true)
  .where('age', '>=', 18)
  .sort('createdAt', 'desc')
  .slice(0, 10);

const firstUser = await users
  .where('email', 'includes', '@example.com')
  .first();

const page2 = await users
  .where('status', 'active')
  .paginate(2, 50);

const withoutPassword = await users
  .forget('password', 'token')
  .where('active', true);
```

## TypeORM Integration

Building TypeORM QueryBuilder from operations:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { getRepository, SelectQueryBuilder } from "typeorm";
import { User } from "./entities/User";

const users = new AsyncCollection<User>(async ({ operations }) => {
  const qb = getRepository(User).createQueryBuilder('user');
  let paramIndex = 0;

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const paramKey = `param${paramIndex++}`;
      const column = `user.${key}`;

      switch (operator) {
        case '=':
          qb.andWhere(`${column} = :${paramKey}`, { [paramKey]: value });
          break;
        case '!=':
          qb.andWhere(`${column} != :${paramKey}`, { [paramKey]: value });
          break;
        case '>':
          qb.andWhere(`${column} > :${paramKey}`, { [paramKey]: value });
          break;
        case '<':
          qb.andWhere(`${column} < :${paramKey}`, { [paramKey]: value });
          break;
        case '>=':
          qb.andWhere(`${column} >= :${paramKey}`, { [paramKey]: value });
          break;
        case '<=':
          qb.andWhere(`${column} <= :${paramKey}`, { [paramKey]: value });
          break;
        case 'in':
          qb.andWhere(`${column} IN (:...${paramKey})`, { [paramKey]: value });
          break;
        case 'includes':
          qb.andWhere(`${column} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
          break;
      }
    }

    if (method === 'whereNot') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const paramKey = `param${paramIndex++}`;
      const column = `user.${key}`;

      qb.andWhere(`${column} != :${paramKey}`, { [paramKey]: value });
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      qb.orderBy(`user.${key}`, direction.toUpperCase() as 'ASC' | 'DESC');
    }

    if (method === 'slice') {
      const [start, end] = args;
      qb.skip(start);
      if (end !== undefined) qb.take(end - start);
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      qb.skip((page - 1) * perPage);
      qb.take(perPage);
    }

    if (method === 'forget') {
      // Select all except specified fields
      const allColumns = qb.connection.getMetadata(User).columns.map(c => c.propertyName);
      const selectFields = allColumns.filter(col => !args.includes(col));
      qb.select(selectFields.map(f => `user.${f}`));
    }
  });

  // Handle terminal operations
  const lastOp = operations[operations.length - 1];

  if (lastOp && lastOp[0] === 'first') {
    const result = await qb.getOne();
    return result ? [result] : [];
  }

  if (lastOp && lastOp[0] === 'last') {
    // Reverse order and get first
    const orderBy = qb.expressionMap.orderBys[0];
    if (orderBy) {
      const [column, order] = Object.entries(orderBy)[0];
      qb.orderBy(column, order === 'ASC' ? 'DESC' : 'ASC');
    }
    const result = await qb.getOne();
    return result ? [result] : [];
  }

  return await qb.getMany();
});

// Usage
const results = await users
  .where('age', '>=', 21)
  .where('country', 'USA')
  .whereNot('deleted', true)
  .sort('createdAt', 'desc')
  .slice(0, 20);

const firstActive = await users
  .where('status', 'active')
  .first();
```

## Sequelize Integration

Working with Sequelize ORM:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { Op, Model } from "sequelize";
import { User } from "./models/User";

const users = new AsyncCollection<User>(async ({ operations }) => {
  const where: any = {};
  let order: any[] = [];
  let limit: number | undefined;
  let offset: number | undefined;
  let attributes: { exclude?: string[] } | undefined;

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const condition = buildSequelizeCondition(operator, value);

      if (where[key]) {
        where[key] = { [Op.and]: [where[key], condition] };
      } else {
        where[key] = condition;
      }
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      order.push([key, direction.toUpperCase()]);
    }

    if (method === 'slice') {
      const [start, end] = args;
      offset = start;
      limit = end ? end - start : undefined;
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      offset = (page - 1) * perPage;
      limit = perPage;
    }

    if (method === 'forget') {
      attributes = { exclude: args };
    }
  });

  const lastOp = operations[operations.length - 1];

  if (lastOp && lastOp[0] === 'first') {
    const result = await User.findOne({ where, order, attributes });
    return result ? [result] : [];
  }

  if (lastOp && lastOp[0] === 'last') {
    const result = await User.findOne({
      where,
      order: order.map(([col, dir]) => [col, dir === 'ASC' ? 'DESC' : 'ASC']),
      attributes,
    });
    return result ? [result] : [];
  }

  return await User.findAll({
    where,
    order,
    limit,
    offset,
    attributes,
  });
});

function buildSequelizeCondition(operator: string, value: any) {
  switch (operator) {
    case '=': return value;
    case '!=': return { [Op.ne]: value };
    case '>': return { [Op.gt]: value };
    case '<': return { [Op.lt]: value };
    case '>=': return { [Op.gte]: value };
    case '<=': return { [Op.lte]: value };
    case 'in': return { [Op.in]: value };
    case 'includes': return { [Op.like]: `%${value}%` };
    default: return value;
  }
}

// Usage
const results = await users
  .where('status', 'active')
  .where('age', '>=', 18)
  .sort('name', 'asc')
  .paginate(1, 20);
```

## Mongoose Integration

MongoDB queries with Mongoose:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import mongoose, { Model, Query } from "mongoose";
import { IUser, UserModel } from "./models/User";

const users = new AsyncCollection<IUser>(async ({ operations }) => {
  let query = UserModel.find();
  let sortObj: any = {};
  let selectObj: any = {};

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const condition = buildMongoCondition(key, operator, value);
      query = query.where(condition);
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      sortObj[key] = direction === 'desc' ? -1 : 1;
    }

    if (method === 'slice') {
      const [start, end] = args;
      query = query.skip(start);
      if (end) query = query.limit(end - start);
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      query = query.skip((page - 1) * perPage).limit(perPage);
    }

    if (method === 'forget') {
      args.forEach(key => {
        selectObj[key] = 0;
      });
    }
  });

  if (Object.keys(sortObj).length > 0) {
    query = query.sort(sortObj);
  }

  if (Object.keys(selectObj).length > 0) {
    query = query.select(selectObj);
  }

  const lastOp = operations[operations.length - 1];

  if (lastOp && lastOp[0] === 'first') {
    const result = await query.findOne();
    return result ? [result] : [];
  }

  return await query.exec();
});

function buildMongoCondition(key: string, operator: string, value: any) {
  const conditions: any = {};

  switch (operator) {
    case '=':
      conditions[key] = value;
      break;
    case '!=':
      conditions[key] = { $ne: value };
      break;
    case '>':
      conditions[key] = { $gt: value };
      break;
    case '<':
      conditions[key] = { $lt: value };
      break;
    case '>=':
      conditions[key] = { $gte: value };
      break;
    case '<=':
      conditions[key] = { $lte: value };
      break;
    case 'in':
      conditions[key] = { $in: value };
      break;
    case 'includes':
      conditions[key] = { $regex: value, $options: 'i' };
      break;
    default:
      conditions[key] = value;
  }

  return conditions;
}

// Usage
const activeUsers = await users
  .where('status', 'active')
  .where('age', '>=', 18)
  .sort('createdAt', 'desc')
  .forget('password', '__v');
```

## REST API Wrapper

Creating an API client with AsyncCollection:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

interface ApiUser {
  id: number;
  name: string;
  email: string;
}

const apiUsers = new AsyncCollection<ApiUser>(async ({ operations }) => {
  const params = new URLSearchParams();
  let endpoint = '/api/users';

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      if (operator === '=') {
        params.append(key, String(value));
      } else if (operator === 'includes') {
        params.append(`${key}_like`, String(value));
      } else if (operator === '>=') {
        params.append(`${key}_gte`, String(value));
      }
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      params.append('_sort', key);
      params.append('_order', direction);
    }

    if (method === 'slice') {
      const [start, end] = args;
      params.append('_start', String(start));
      if (end) params.append('_end', String(end));
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      params.append('_page', String(page));
      params.append('_limit', String(perPage));
    }
  });

  const url = `${endpoint}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();

  const lastOp = operations[operations.length - 1];
  if (lastOp && lastOp[0] === 'first') {
    return Array.isArray(data) ? [data[0]] : [data];
  }

  return Array.isArray(data) ? data : [data];
});

// Usage
const users = await apiUsers
  .where('status', 'active')
  .where('name', 'includes', 'John')
  .sort('createdAt', 'desc')
  .paginate(1, 20);

const firstUser = await apiUsers
  .where('email', 'john@example.com')
  .first();
```

## GraphQL Query Builder

Building GraphQL queries dynamically:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient('https://api.example.com/graphql');

interface GQLUser {
  id: string;
  name: string;
  email: string;
}

const gqlUsers = new AsyncCollection<GQLUser>(async ({ operations }) => {
  const filters: string[] = [];
  let orderBy: string | undefined;
  let limit: number | undefined;
  let offset: number | undefined;

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const gqlOperator = mapToGQLOperator(operator);
      filters.push(`${key}: { ${gqlOperator}: "${value}" }`);
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      orderBy = `${key}: ${direction.toUpperCase()}`;
    }

    if (method === 'slice') {
      const [start, end] = args;
      offset = start;
      limit = end ? end - start : undefined;
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      offset = (page - 1) * perPage;
      limit = perPage;
    }
  });

  const whereClause = filters.length > 0 ? `where: { ${filters.join(', ')} }` : '';
  const orderClause = orderBy ? `orderBy: { ${orderBy} }` : '';
  const limitClause = limit ? `take: ${limit}` : '';
  const offsetClause = offset ? `skip: ${offset}` : '';

  const args = [whereClause, orderClause, limitClause, offsetClause]
    .filter(Boolean)
    .join(', ');

  const query = `
    query {
      users${args ? `(${args})` : ''} {
        id
        name
        email
        createdAt
      }
    }
  `;

  const response = await client.request<{ users: GQLUser[] }>(query);

  const lastOp = operations[operations.length - 1];
  if (lastOp && lastOp[0] === 'first') {
    return response.users.length > 0 ? [response.users[0]] : [];
  }

  return response.users;
});

function mapToGQLOperator(operator: string): string {
  const mapping: Record<string, string> = {
    '=': 'equals',
    '!=': 'not',
    '>': 'gt',
    '<': 'lt',
    '>=': 'gte',
    '<=': 'lte',
    'in': 'in',
    'includes': 'contains',
  };
  return mapping[operator] || 'equals';
}

// Usage
const users = await gqlUsers
  .where('status', 'active')
  .where('age', '>=', 18)
  .sort('name', 'asc')
  .paginate(1, 10);
```

## Redis Cache Layer

Using AsyncCollection with Redis caching:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import Redis from "ioredis";

const redis = new Redis();

interface CachedUser {
  id: number;
  name: string;
  email: string;
}

const cachedUsers = new AsyncCollection<CachedUser>(async ({ operations }) => {
  // Build cache key from operations
  const cacheKey = `users:${JSON.stringify(operations)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache hit');
    return JSON.parse(cached);
  }

  console.log('Cache miss - fetching from database');

  // Fetch from database (example with fetch)
  const params = new URLSearchParams();
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, value] = args.length === 2 ? args : [args[0], args[2]];
      params.append(key, value);
    }
  });

  const response = await fetch(`/api/users?${params}`);
  const data = await response.json();

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(data));

  return data;
});

// Usage
const users = await cachedUsers.where('status', 'active');
// Second call will use cache
const cachedResult = await cachedUsers.where('status', 'active');
```

## Custom Validators

Advanced custom validator patterns:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

const customValidators = {
  // Date validators
  $isPast(ref: string, value: boolean) {
    return (item: any) => {
      const date = new Date(item[ref]);
      const isPast = date < new Date();
      return value ? isPast : !isPast;
    };
  },

  $isFuture(ref: string, value: boolean) {
    return (item: any) => {
      const date = new Date(item[ref]);
      const isFuture = date > new Date();
      return value ? isFuture : !isFuture;
    };
  },

  // Numeric validators
  $between(ref: string, range: [number, number]) {
    return (item: any) => {
      const val = item[ref];
      return val >= range[0] && val <= range[1];
    };
  },

  // String validators
  $matches(ref: string, regex: RegExp) {
    return (item: any) => {
      return regex.test(String(item[ref]));
    };
  },

  // Array validators
  $hasLength(ref: string, length: number) {
    return (item: any) => {
      return Array.isArray(item[ref]) && item[ref].length === length;
    };
  },
};

const items = new AsyncCollection(
  async ({ operations, validators }) => {
    let results = [...data];

    operations.forEach(([method, ...args]) => {
      if (method === 'filter' && typeof args[0] === 'object') {
        const query = args[0];
        results = results.filter(item => {
          return Object.entries(query).every(([key, condition]) => {
            if (typeof condition === 'object') {
              return Object.entries(condition).every(([operator, value]) => {
                if (validators && operator in validators) {
                  const validator = validators[operator];
                  const validatorFn = validator(key, value);
                  return validatorFn(item);
                }
                return true;
              });
            }
            return item[key] === condition;
          });
        });
      }
    });

    return results;
  },
  customValidators
);

// Usage
const results = await items.filter({
  eventDate: { $isPast: true },
  score: { $between: [50, 100] },
  email: { $matches: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i },
  tags: { $hasLength: 3 },
});
```

## Complex Query Chains

Building complex, multi-step queries:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Complex user search with multiple conditions
const userSearch = new AsyncCollection(async ({ operations, metadata }) => {
  console.log(`Building complex query: ${metadata.operation_count} operations`);

  // Extract and organize operations
  const where_ops = operations.filter(([m]) => m === 'where' || m === 'whereNot');
  const sort_ops = operations.filter(([m]) => m === 'sort');
  const slice_ops = operations.filter(([m]) => m === 'slice' || m === 'paginate');
  const terminal_ops = operations.filter(([m]) => ['first', 'last'].includes(m));

  // Build where conditions
  const where: any = { AND: [] };
  where_ops.forEach(([method, ...args]) => {
    if (method === 'where') {
      const condition = buildPrismaCondition(args);
      where.AND.push(condition);
    } else if (method === 'whereNot') {
      const condition = buildPrismaCondition(args);
      where.AND.push({ NOT: condition });
    }
  });

  // Build order
  const orderBy = sort_ops.map(([_, key, direction]) => ({
    [key]: direction || 'asc',
  }));

  // Build pagination
  let take: number | undefined;
  let skip: number | undefined;

  slice_ops.forEach(([method, ...args]) => {
    if (method === 'slice') {
      const [start, end] = args;
      skip = start;
      take = end ? end - start : undefined;
    } else if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      skip = (page - 1) * perPage;
      take = perPage;
    }
  });

  // Execute query based on terminal operation
  if (terminal_ops.length > 0 && terminal_ops[0][0] === 'first') {
    const result = await prisma.user.findFirst({
      where: where.AND.length > 0 ? where : undefined,
      orderBy,
    });
    return result ? [result] : [];
  }

  return await prisma.user.findMany({
    where: where.AND.length > 0 ? where : undefined,
    orderBy,
    take,
    skip,
  });
});

// Usage: Complex search
const results = await userSearch
  .where('status', 'active')
  .where('verified', true)
  .where('age', '>=', 18)
  .where('age', '<=', 65)
  .whereNot('deleted', true)
  .whereNot('banned', true)
  .sort('score', 'desc')
  .sort('createdAt', 'desc')
  .paginate(1, 20);
```

## Error Handling Patterns

Robust error handling in executors:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

class QueryError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'QueryError';
  }
}

const users = new AsyncCollection(async ({ operations, metadata }) => {
  try {
    // Validate operations
    const unsupported = operations.find(([method]) =>
      !['where', 'sort', 'first', 'slice'].includes(method)
    );

    if (unsupported) {
      throw new QueryError(
        `Unsupported operation: ${unsupported[0]}`,
        'UNSUPPORTED_OPERATION'
      );
    }

    // Build query
    const query = buildQuery(operations);

    // Execute with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(query),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new QueryError(
          `API error: ${response.statusText}`,
          'API_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new QueryError('Query timeout exceeded', 'TIMEOUT');
      }
      throw error;
    }
  } catch (error) {
    console.error('Query execution failed:', {
      error,
      operations,
      metadata,
    });

    if (error instanceof QueryError) {
      throw error;
    }

    throw new QueryError(
      `Unexpected error: ${error.message}`,
      'UNEXPECTED_ERROR'
    );
  }
});

// Usage with error handling
try {
  const results = await users
    .where('age', '>=', 18)
    .sort('name', 'asc');
} catch (error) {
  if (error instanceof QueryError) {
    switch (error.code) {
      case 'TIMEOUT':
        console.error('Query took too long');
        break;
      case 'UNSUPPORTED_OPERATION':
        console.error('Invalid operation used');
        break;
      case 'API_ERROR':
        console.error('API returned an error');
        break;
    }
  }
}
```

## Performance Optimization

Optimizing query execution:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

const optimizedUsers = new AsyncCollection(async ({ operations, metadata }) => {
  console.log(`Optimizing ${metadata.operation_count} operations`);

  // Group related operations
  const operation_groups = {
    filters: operations.filter(([m]) => ['where', 'whereNot', 'filter'].includes(m)),
    sorting: operations.filter(([m]) => m === 'sort'),
    pagination: operations.filter(([m]) => ['slice', 'paginate'].includes(m)),
    terminal: operations.filter(([m]) => ['first', 'last'].includes(m)),
  };

  // Optimize: If terminal operation is 'first', limit to 1
  const shouldLimitOne = operation_groups.terminal.some(([m]) => m === 'first');

  // Build optimized query
  const query = {
    where: buildOptimizedWhere(operation_groups.filters),
    orderBy: buildOrderBy(operation_groups.sorting),
    ...(shouldLimitOne
      ? { take: 1 }
      : buildPagination(operation_groups.pagination)),
  };

  // Execute with connection pooling
  const results = await executeWithPool(query);

  // Return based on terminal operation
  if (shouldLimitOne) {
    return results.length > 0 ? [results[0]] : [];
  }

  return results;
});

function buildOptimizedWhere(filters: any[]) {
  // Combine multiple where clauses on same field
  const grouped = filters.reduce((acc, [method, ...args]) => {
    const key = args[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push({ method, args });
    return acc;
  }, {});

  // Build optimized conditions
  return Object.entries(grouped).map(([key, conditions]: [string, any]) => {
    if (conditions.length === 1) {
      return buildSingleCondition(conditions[0]);
    }
    return { AND: conditions.map(buildSingleCondition) };
  });
}
```

## See Also

- [AsyncCollection Guide](../guides/async-collection.md)
- [API Reference](../api/async-collection-class.md)
- [TypeScript Usage](../advanced/typescript-usage.md)
