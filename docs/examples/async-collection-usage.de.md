# AsyncCollection Verwendungsbeispiele

Reale Beispiele für die Verwendung von AsyncCollection mit verschiedenen Datenquellen und Mustern.

## Inhaltsverzeichnis

- [Grundlegendes In-Memory-Beispiel](#grundlegendes-in-memory-beispiel)
- [Prisma ORM Integration](#prisma-orm-integration)
- [TypeORM Integration](#typeorm-integration)
- [Sequelize Integration](#sequelize-integration)
- [REST-API-Wrapper](#rest-api-wrapper)
- [GraphQL Query Builder](#graphql-query-builder)
- [Benutzerdefinierte Validatoren](#benutzerdefinierte-validatoren)
- [Komplexe Abfrageketten](#komplexe-abfrageketten)
- [Fehlerbehandlungsmuster](#fehlerbehandlungsmuster)

## Grundlegendes In-Memory-Beispiel

Einfacher Executor zum Filtern von In-Memory-Daten:

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
  });

  return results;
});

// Verwendung
const activeUsers = await users.where('status', 'active');
const firstAdult = await users.where('age', '>=', 25).first();
const sorted = await users.sort('age', 'desc');
```

## Prisma ORM Integration

Vollständige Prisma-Integration mit erweiterter Abfrageerstellung:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { PrismaClient, User, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const users = new AsyncCollection<User>(async ({ operations, metadata }) => {
  let where: Prisma.UserWhereInput = {};
  let orderBy: Prisma.UserOrderByWithRelationInput | undefined;
  let take: number | undefined;
  let skip: number | undefined;

  console.log(`Erstelle Prisma-Abfrage mit ${metadata.operation_count} Operationen`);

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const condition = buildWhereCondition(key, operator, value);
      where = { ...where, ...condition };
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      orderBy = { [key]: direction };
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      skip = (page - 1) * perPage;
      take = perPage;
    }
  });

  const lastOp = operations[operations.length - 1];

  if (lastOp && lastOp[0] === 'first') {
    const result = await prisma.user.findFirst({ where, orderBy });
    return result ? [result] : [];
  }

  return await prisma.user.findMany({ where, orderBy, take, skip });
});

function buildWhereCondition(
  key: string,
  operator: string,
  value: any
): Prisma.UserWhereInput {
  switch (operator) {
    case '=': return { [key]: value };
    case '!=': return { [key]: { not: value } };
    case '>': return { [key]: { gt: value } };
    case '<': return { [key]: { lt: value } };
    case '>=': return { [key]: { gte: value } };
    case '<=': return { [key]: { lte: value } };
    case 'in': return { [key]: { in: value } };
    case 'includes': return { [key]: { contains: value } };
    default: return { [key]: value };
  }
}

// Verwendungsbeispiele
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
```

## TypeORM Integration

Erstellen von TypeORM QueryBuilder aus Operationen:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { getRepository } from "typeorm";
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
        case '>=':
          qb.andWhere(`${column} >= :${paramKey}`, { [paramKey]: value });
          break;
        case 'in':
          qb.andWhere(`${column} IN (:...${paramKey})`, { [paramKey]: value });
          break;
        case 'includes':
          qb.andWhere(`${column} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
          break;
      }
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      qb.orderBy(`user.${key}`, direction.toUpperCase() as 'ASC' | 'DESC');
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      qb.skip((page - 1) * perPage);
      qb.take(perPage);
    }
  });

  const lastOp = operations[operations.length - 1];

  if (lastOp && lastOp[0] === 'first') {
    const result = await qb.getOne();
    return result ? [result] : [];
  }

  return await qb.getMany();
});

// Verwendung
const results = await users
  .where('age', '>=', 21)
  .where('country', 'USA')
  .sort('createdAt', 'desc')
  .slice(0, 20);
```

## Sequelize Integration

Arbeiten mit Sequelize ORM:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { Op } from "sequelize";
import { User } from "./models/User";

const users = new AsyncCollection<User>(async ({ operations }) => {
  const where: any = {};
  let order: any[] = [];
  let limit: number | undefined;
  let offset: number | undefined;

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const condition = buildSequelizeCondition(operator, value);
      where[key] = condition;
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      order.push([key, direction.toUpperCase()]);
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      offset = (page - 1) * perPage;
      limit = perPage;
    }
  });

  const lastOp = operations[operations.length - 1];

  if (lastOp && lastOp[0] === 'first') {
    const result = await User.findOne({ where, order });
    return result ? [result] : [];
  }

  return await User.findAll({ where, order, limit, offset });
});

function buildSequelizeCondition(operator: string, value: any) {
  switch (operator) {
    case '=': return value;
    case '!=': return { [Op.ne]: value };
    case '>': return { [Op.gt]: value };
    case '>=': return { [Op.gte]: value };
    case '<=': return { [Op.lte]: value };
    case 'in': return { [Op.in]: value };
    case 'includes': return { [Op.like]: `%${value}%` };
    default: return value;
  }
}

// Verwendung
const results = await users
  .where('status', 'active')
  .where('age', '>=', 18)
  .sort('name', 'asc')
  .paginate(1, 20);
```

## REST-API-Wrapper

Erstellen eines API-Clients mit AsyncCollection:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

interface ApiUser {
  id: number;
  name: string;
  email: string;
}

const apiUsers = new AsyncCollection<ApiUser>(async ({ operations }) => {
  const params = new URLSearchParams();

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      if (operator === '=') {
        params.append(key, String(value));
      } else if (operator === 'includes') {
        params.append(`${key}_like`, String(value));
      }
    }

    if (method === 'sort') {
      const [key, direction = 'asc'] = args;
      params.append('_sort', key);
      params.append('_order', direction);
    }

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      params.append('_page', String(page));
      params.append('_limit', String(perPage));
    }
  });

  const url = `/api/users?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.statusText}`);
  }

  return await response.json();
});

// Verwendung
const users = await apiUsers
  .where('status', 'active')
  .where('name', 'includes', 'John')
  .sort('createdAt', 'desc')
  .paginate(1, 20);
```

## GraphQL Query Builder

Dynamisches Erstellen von GraphQL-Abfragen:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient('https://api.example.com/graphql');

const gqlUsers = new AsyncCollection(async ({ operations }) => {
  const filters: string[] = [];
  let orderBy: string | undefined;
  let limit: number | undefined;

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

    if (method === 'paginate') {
      const [page = 1, perPage = 20] = args;
      limit = perPage;
    }
  });

  const whereClause = filters.length > 0 ? `where: { ${filters.join(', ')} }` : '';
  const orderClause = orderBy ? `orderBy: { ${orderBy} }` : '';
  const limitClause = limit ? `take: ${limit}` : '';

  const args = [whereClause, orderClause, limitClause]
    .filter(Boolean)
    .join(', ');

  const query = `
    query {
      users${args ? `(${args})` : ''} {
        id name email createdAt
      }
    }
  `;

  const response = await client.request(query);
  return response.users;
});

function mapToGQLOperator(operator: string): string {
  const mapping: Record<string, string> = {
    '=': 'equals',
    '!=': 'not',
    '>': 'gt',
    '>=': 'gte',
    'includes': 'contains',
  };
  return mapping[operator] || 'equals';
}

// Verwendung
const users = await gqlUsers
  .where('status', 'active')
  .sort('name', 'asc')
  .paginate(1, 10);
```

## Benutzerdefinierte Validatoren

Erweiterte benutzerdefinierte Validatormuster:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

const customValidators = {
  // Datumsvalidatoren
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

  // Numerische Validatoren
  $between(ref: string, range: [number, number]) {
    return (item: any) => {
      const val = item[ref];
      return val >= range[0] && val <= range[1];
    };
  },

  // String-Validatoren
  $matches(ref: string, regex: RegExp) {
    return (item: any) => {
      return regex.test(String(item[ref]));
    };
  },

  // Array-Validatoren
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

// Verwendung
const results = await items.filter({
  eventDate: { $isPast: true },
  score: { $between: [50, 100] },
  email: { $matches: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i },
  tags: { $hasLength: 3 },
});
```

## Komplexe Abfrageketten

Erstellen komplexer mehrstufiger Abfragen:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userSearch = new AsyncCollection(async ({ operations, metadata }) => {
  console.log(`Erstelle komplexe Abfrage: ${metadata.operation_count} Operationen`);

  // Operationen extrahieren und organisieren
  const where_ops = operations.filter(([m]) => m === 'where' || m === 'whereNot');
  const sort_ops = operations.filter(([m]) => m === 'sort');
  const terminal_ops = operations.filter(([m]) => ['first', 'last'].includes(m));

  // Where-Bedingungen erstellen
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

  // Reihenfolge erstellen
  const orderBy = sort_ops.map(([_, key, direction]) => ({
    [key]: direction || 'asc',
  }));

  // Abfrage basierend auf Terminaloperation ausführen
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
  });
});

// Verwendung: Komplexe Suche
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

## Fehlerbehandlungsmuster

Robuste Fehlerbehandlung in Executors:

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
    // Operationen validieren
    const unsupported = operations.find(([method]) =>
      !['where', 'sort', 'first', 'slice'].includes(method)
    );

    if (unsupported) {
      throw new QueryError(
        `Nicht unterstützte Operation: ${unsupported[0]}`,
        'UNSUPPORTED_OPERATION'
      );
    }

    // Abfrage erstellen
    const query = buildQuery(operations);

    // Mit Timeout ausführen
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
          `API-Fehler: ${response.statusText}`,
          'API_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new QueryError('Abfrage-Timeout überschritten', 'TIMEOUT');
      }
      throw error;
    }
  } catch (error) {
    console.error('Abfrageausführung fehlgeschlagen:', {
      error,
      operations,
      metadata,
    });

    if (error instanceof QueryError) {
      throw error;
    }

    throw new QueryError(
      `Unerwarteter Fehler: ${error.message}`,
      'UNEXPECTED_ERROR'
    );
  }
});

// Verwendung mit Fehlerbehandlung
try {
  const results = await users
    .where('age', '>=', 18)
    .sort('name', 'asc');
} catch (error) {
  if (error instanceof QueryError) {
    switch (error.code) {
      case 'TIMEOUT':
        console.error('Abfrage dauerte zu lange');
        break;
      case 'UNSUPPORTED_OPERATION':
        console.error('Ungültige Operation verwendet');
        break;
      case 'API_ERROR':
        console.error('API hat einen Fehler zurückgegeben');
        break;
    }
  }
}
```

## Siehe auch

- [AsyncCollection-Anleitung](../guides/async-collection.md)
- [API-Referenz](../api/async-collection-class.md)
- [TypeScript-Verwendung](../advanced/typescript-usage.md)
