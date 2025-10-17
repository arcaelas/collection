![Arcaelas Insiders Banner](https://raw.githubusercontent.com/arcaelas/dist/main/banner/svg/dark.svg#gh-dark-mode-only)

![Arcaelas Insiders Banner](https://raw.githubusercontent.com/arcaelas/dist/main/banner/svg/light.svg#gh-light-mode-only)

# Welcome to Arcaelas Insiders!

Hello, if this is your first time reading the **[Arcaelas Insiders](https://github.com/arcaelas)** **documentation**, let me tell you that you have found a good place to learn.

**Our team** and _community_ are happy to write and make methods simple to implement and understand, but I think you already know that.

> The documentation for this tool is open to edits and suggestions.

Let's start with the basic implementation steps.

```bash
> npm i --save @arcaelas/collection
> yarn add --save @arcaelas/collection
```

## Implementation

```javascript
// Class Import Statement
import Collection from "@arcaelas/Collection";

// Function import statement
import { Collection } from "@arcaelas/collection";

// EsModule
const Collection = require("@arcaelas/collection");
```

## Motivation

In object-oriented programming we find common situations, such as those where we want to order, filter and modify elements of a list, however the "Array Prototypes" are not very complete in some cases, for these situations the **Arcaelas Insiders** team has designed useful tools that allow these actions within "Collections".

### Curiosities

As an interesting part of this tool, we have the B-JSON notation that Atlas implements in its MongoDB database engine, only some of them are implemented here, but we will explain how to extend them and create your own validators.

## Get Started

```typescript
import Collection from "@arcaelas/collection"

const collection = new Collection([ ... ])
```

## Method Reference and Use Cases

### `filter()`

> Filters elements by a callback or Query expression.

```ts
collection.filter((item) => item.age >= 18);
collection.filter({ age: { $gte: 18 } });
collection.filter({
  name: /Alejandro/,
  skills: { $contains: "Liberty" },
  gender: { $not: { $in: ["animal", "fruit"] } },
  work: { $not: { $in: ["work", "without", "coffee"] } },
});
```

### `not()`

> Returns elements that do NOT match the expression.

```ts
collection.not({ online: false });
```

### `first()` / `last()`

> Returns the first or last element that matches a Query or function.

```ts
collection.first({ age: { $gte: 18 } });
collection.last((item) => item.name === "Joe");
```

### `where()` / `whereNot()`

> Shorthand for querying with operator and value.

```ts
collection.where("online", false);
collection.where("age", ">=", 21);
collection.whereNot("role", "admin");
collection.whereNot("price", "<", 100);
```

### `update()`

> Updates elements based on query or globally. **⚠️ Mutates** collection. Returns number of updated items.

```ts
// Update matched elements
collection.update({ online: false }, { deletedAt: new Date() });

// Use template strings for dynamic values
collection.update({ email: /gmail\.com$/ }, {
  prevEmail: "${email}",
  email: null
});

// Update all elements
collection.update({ deletedAt: new Date() });
```

### `delete()`

> Removes matched elements. **⚠️ Mutates** collection. Returns number of deleted items.

```ts
const deleted = collection.delete({ deletedAt: { $exists: true } });
console.log(`Deleted ${deleted} items`);
```

### `collect()`

> Creates a new `Collection` instance **preserving all macros** from parent.

```ts
// Useful for cloning with custom macros preserved
const clone = collection.collect([ ... ]);

// All macros added to parent are available in clone
Collection.macro('pluck', function(key) { return this.map(i => i[key]); });
const copy = collection.collect([...]);
copy.pluck('name'); // Works! Macro is preserved
```

### `dd()` / `dump()`

> Debug methods to print and exit or continue.

```ts
collection.dump();
collection.dd();
```

### `max()` / `min()` / `sum()`

> Performs aggregate calculations by key or function.

```ts
collection.max("score");
collection.min("price");
collection.sum("amount");
collection.sum((item) => item.price * 1.18);
```

### `random()` / `shuffle()`

> `random(n)` returns array of n random items. `shuffle()` **⚠️ mutates** collection with random order.

```ts
const two_items = collection.random(2); // Returns T[], not Collection
collection.shuffle(); // Mutates and returns this
```

### `chunk()` / `paginate()`

> Splits into chunks or paginates.

```ts
// chunk() returns T[][] (array of arrays)
const chunks = collection.chunk(100);
// chunks = [[item1, item2, ...], [item101, item102, ...]]

// paginate() returns { items: T[], prev: number | false, next: number | false }
const page = collection.paginate(1, 50);
// page = { items: [...], prev: false, next: 2 }
```

### `countBy()` / `groupBy()`

> Aggregates by key or iterator.

```ts
// countBy() returns Record<string, number>
const counts = collection.countBy("type");
// { active: 5, inactive: 3 }

collection.countBy((item) => item.group);

// groupBy() returns Dictionary<T[]> (plain object, not Collection)
const groups = collection.groupBy("status");
// { active: [item1, item2], inactive: [item3] }

collection.groupBy((item) => item.role);
```

### `each()`

> Iterates over elements. `return false` to break.

```ts
collection.each((item) => {
  if (!item.active) return false;
});
```

### `forget()`

> Removes specific fields from each item. **⚠️ Mutates** collection.

```ts
// Removes sensitive fields from all items
collection.forget("password", "token");

// To preserve original, use collect() first
const safe = collection.collect().forget("password");
```

### `unique()`

> Filters to unique values by key or callback.

```ts
collection.unique("email");
collection.unique((item) => item.id);
```

### `macro()` / `Collection.macro()`

> Adds custom methods.

```ts
Collection.macro("pluck", function (key) {
  return this.map((item) => item[key]);
});
collection.pluck("name");
```

### `sort()`

> Sorts the collection by key, direction or comparator function. **⚠️ Mutates** collection.

```ts
collection.sort("age", "asc");
collection.sort("name", "desc");
collection.sort((a, b) => a.score - b.score);

// Items with undefined values are placed at end (asc) or start (desc)
```

### `every()`

> Verifies that all elements satisfy the expression.

```ts
collection.every("active");
collection.every("score", ">=", 0);
collection.every({ verified: true });
collection.every((item) => item.age >= 18);
```

### `stringify()`

> Converts collection to JSON string. Wrapper for `JSON.stringify()`.

```ts
collection.stringify(); // Compact JSON
collection.stringify(null, 2); // Pretty-printed with 2 spaces

// See MDN for replacer and space parameters
collection.stringify((key, value) => typeof value === 'bigint' ? value.toString() : value);
```

### Native methods preserved

- `concat`, `map`, `pop`, `slice`, `splice`, `shift`, `unshift` are fully supported.

## Collection Quick Reference

### Mutability Matrix

| Method | Mutates | Returns | Notes |
|--------|---------|---------|-------|
| `filter()` | ❌ No | New Collection | Creates filtered copy |
| `where()` | ❌ No | New Collection | Shorthand for filter |
| `whereNot()` | ❌ No | New Collection | Negated filter |
| `not()` | ❌ No | New Collection | Negated filter |
| `map()` | ❌ No | New Array | Native method |
| `collect()` | ❌ No | New Collection | Clones with macros |
| `chunk()` | ❌ No | `T[][]` | Array of arrays |
| `groupBy()` | ❌ No | `Dictionary<T[]>` | Plain object |
| `paginate()` | ❌ No | `{ items, prev, next }` | Pagination object |
| `random()` | ❌ No | `T[]` | Array of random items |
| `unique()` | ❌ No | New Collection | Deduplicated copy |
| **`delete()`** | ✅ **Yes** | `number` | Returns deleted count |
| **`update()`** | ✅ **Yes** | `number` | Returns updated count |
| **`forget()`** | ✅ **Yes** | `this` | Removes fields |
| **`shuffle()`** | ✅ **Yes** | `this` | Random order in place |
| **`sort()`** | ✅ **Yes** | `this` | Sorts in place |

### Query Operators Complete Reference

All operators can be used in `filter()`, `where()`, `whereNot()`, `not()`, `every()`, `first()`, `last()`, etc.

#### Equality Operators

```ts
// $eq - Equal (default, can be omitted)
collection.filter({ age: 25 });
collection.filter({ age: { $eq: 25 } });
collection.where('age', '=', 25);
collection.where('age', 25); // '=' assumed

// $not / != - Not equal
collection.filter({ $not: { status: 'deleted' } });
collection.where('status', '!=', 'deleted');
```

#### Comparison Operators

```ts
// $gt / > - Greater than
collection.filter({ age: { $gt: 18 } });
collection.where('age', '>', 18);

// $gte / >= - Greater than or equal
collection.filter({ score: { $gte: 100 } });
collection.where('score', '>=', 100);

// $lt / < - Less than
collection.filter({ price: { $lt: 50 } });
collection.where('price', '<', 50);

// $lte / <= - Less than or equal
collection.filter({ stock: { $lte: 10 } });
collection.where('stock', '<=', 10);
```

#### Array and String Operators

```ts
// $in - Value in array
collection.filter({ status: { $in: ['active', 'pending'] } });
collection.where('status', 'in', ['active', 'pending']);

// $includes - Contains substring or value
collection.filter({ skills: { $includes: 'TypeScript' } });
collection.where('skills', 'includes', 'TypeScript');
```

#### Advanced Queries

```ts
// Nested object queries with dot notation
collection.where('user.address.city', 'New York');

// Multiple conditions (AND logic)
collection
  .where('age', '>=', 18)
  .where('verified', true)
  .where('status', 'in', ['active', 'premium']);

// Complex query object
collection.filter({
  name: /^John/i,                          // Regex match
  age: { $gte: 18, $lt: 65 },             // Range
  status: { $in: ['active', 'premium'] }, // Array inclusion
  skills: { $includes: 'JavaScript' },    // Contains
  $not: { deleted: true }                 // Negation
});
```

### Constructor with Validators

```ts
import Collection from "@arcaelas/collection";

interface CustomValidators {
  $between(ref: string, range: [number, number]): (item: any) => boolean;
  $isPast(ref: string, value: boolean): (item: any) => boolean;
}

const validators: CustomValidators = {
  $between(ref, range) {
    return (item) => item[ref] >= range[0] && item[ref] <= range[1];
  },
  $isPast(ref, value) {
    return (item) => {
      const date = new Date(item[ref]);
      const is_past = date < new Date();
      return value ? is_past : !is_past;
    };
  }
};

// Use custom validators
const collection = new Collection<User, CustomValidators>(users, validators);

collection.filter({
  age: { $between: [18, 65] },
  expireDate: { $isPast: false }
});
```

## AsyncCollection

AsyncCollection es un Query Builder que implementa el patrón de ejecución diferida para trabajar con fuentes de datos asíncronas como ORMs, bases de datos y APIs. En lugar de ejecutar operaciones inmediatamente, AsyncCollection registra todas las operaciones en un "query plan" que se ejecuta solo cuando se resuelve la promesa usando `await` o `.then()`.

### Conceptos Fundamentales

#### ExecutorContext

El contexto de ejecución que se pasa a la función executor cuando se resuelve la promesa:

```typescript
interface ExecutorContext<T, V> {
  operations: [string, ...any[]][]; // Array de operaciones registradas
  validators?: V;                    // Validators personalizados
  metadata: {
    created_at: Date;                // Fecha de creación
    operation_count: number;         // Total de operaciones
    chain_depth: number;             // Profundidad de la cadena
  };
}
```

#### Función Executor

La función que procesa el contexto y retorna los resultados:

```typescript
type Executor<T, V> = (
  context: ExecutorContext<T, V>
) => T | T[] | Promise<T | T[]>;
```

#### Implementación Thenable

AsyncCollection implementa la interfaz Promise-like con `then()`, `catch()` y `finally()`, permitiendo usar `await` directamente sin necesidad de llamar a un método explícito de ejecución.

#### Patrón de Registro de Operaciones

Cada método encadena operaciones en un array interno con el formato `[nombre_metodo, ...args]`, que se procesa cuando se resuelve la promesa.

### Uso Básico

#### Executor Simple con Array

```typescript
import AsyncCollection from "@arcaelas/collection/async";

// Crear un executor simple que procesa operaciones en memoria
const users = new AsyncCollection<User>(async ({ operations }) => {
  let data = await fetchUsers(); // Obtener datos iniciales

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      data = data.filter(item => {
        if (operator === '>=') return item[key] >= value;
        if (operator === '>') return item[key] > value;
        if (operator === '=') return item[key] === value;
        return true;
      });
    } else if (method === 'sort') {
      const [key, direction] = args;
      data.sort((a, b) => {
        const result = a[key] > b[key] ? 1 : -1;
        return direction === 'desc' ? -result : result;
      });
    }
  });

  return data;
});
```

#### Encadenamiento de Operaciones

```typescript
// Las operaciones se registran pero no se ejecutan hasta el await
const result = await users
  .where('age', '>=', 18)
  .where('status', 'active')
  .not({ deleted: true })
  .sort('name', 'asc')
  .paginate(1, 20);

console.log(result); // Array de usuarios filtrados y paginados
```

#### Validators Personalizados

Puedes extender los operadores de query con validators personalizados:

```typescript
const custom_validators = {
  $between(ref: string, range: [number, number]) {
    return (item: any) => {
      const value = item[ref];
      return value >= range[0] && value <= range[1];
    };
  },
  $contains(ref: string, search: string) {
    return (item: any) => {
      const value = String(item[ref] ?? '');
      return value.toLowerCase().includes(search.toLowerCase());
    };
  },
  $isPast(ref: string, value: boolean) {
    return (item: any) => {
      const date = new Date(item[ref]);
      const is_past = date < new Date();
      return value ? is_past : !is_past;
    };
  }
};

const items = new AsyncCollection(
  async ({ operations, validators }) => {
    // Usar validators para procesar operaciones avanzadas
    return processWithValidators(operations, validators);
  },
  custom_validators
);

// Usar operadores personalizados
await items.filter({
  age: { $between: [18, 65] },
  name: { $contains: 'John' },
  expireDate: { $isPast: false }
});
```

### Integraciones con ORMs

#### Prisma

```typescript
import { PrismaClient } from '@prisma/client';
import AsyncCollection from "@arcaelas/collection/async";

const prisma = new PrismaClient();

const users = new AsyncCollection<User>(async ({ operations }) => {
  const where: any = {};
  const orderBy: any = [];
  let take: number | undefined;
  let skip: number | undefined;

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      if (operator === '>=') where[key] = { gte: value };
      else if (operator === '>') where[key] = { gt: value };
      else if (operator === '<=') where[key] = { lte: value };
      else if (operator === '<') where[key] = { lt: value };
      else if (operator === '!=') where[key] = { not: value };
      else where[key] = value;
    } else if (method === 'sort') {
      const [key, direction] = args;
      orderBy.push({ [key]: direction || 'asc' });
    } else if (method === 'paginate') {
      const [page, per_page] = args;
      take = per_page;
      skip = (page - 1) * per_page;
    }
  });

  const query: any = { where };
  if (orderBy.length > 0) query.orderBy = orderBy;
  if (take !== undefined) query.take = take;
  if (skip !== undefined) query.skip = skip;

  const last_op = operations[operations.length - 1];
  if (last_op?.[0] === 'first') {
    return await prisma.user.findFirst(query);
  }

  return await prisma.user.findMany(query);
});

// Usar como un query builder normal
const active_users = await users
  .where('status', 'active')
  .where('age', '>=', 18)
  .sort('created_at', 'desc')
  .paginate(1, 10);
```

#### TypeORM

```typescript
import { getRepository } from 'typeorm';
import AsyncCollection from "@arcaelas/collection/async";
import { User } from './entities/User';

const users = new AsyncCollection<User>(async ({ operations }) => {
  const qb = getRepository(User).createQueryBuilder('user');

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      const param_name = `${key}_${Math.random().toString(36).substr(2, 9)}`;

      if (operator === '>=') {
        qb.andWhere(`user.${key} >= :${param_name}`, { [param_name]: value });
      } else if (operator === '>') {
        qb.andWhere(`user.${key} > :${param_name}`, { [param_name]: value });
      } else if (operator === '=') {
        qb.andWhere(`user.${key} = :${param_name}`, { [param_name]: value });
      }
    } else if (method === 'sort') {
      const [key, direction] = args;
      qb.orderBy(`user.${key}`, direction?.toUpperCase() || 'ASC');
    } else if (method === 'paginate') {
      const [page, per_page] = args;
      qb.skip((page - 1) * per_page).take(per_page);
    }
  });

  const last_op = operations[operations.length - 1];
  if (last_op?.[0] === 'first') {
    return await qb.getOne();
  }

  return await qb.getMany();
});

// Query encadenable con TypeORM
const premium_users = await users
  .where('subscription', 'premium')
  .where('last_login', '>', new Date('2025-01-01'))
  .sort('points', 'desc')
  .first();
```

#### Redis con JSON

```typescript
import { createClient } from 'redis';
import AsyncCollection from "@arcaelas/collection/async";

const redis_client = createClient();
await redis_client.connect();

const cache = new AsyncCollection<CacheItem>(async ({ operations }) => {
  // Obtener todos los keys que coincidan con un patrón
  const keys = await redis_client.keys('users:*');
  let items = await Promise.all(
    keys.map(async (key) => {
      const data = await redis_client.get(key);
      return JSON.parse(data || '{}');
    })
  );

  // Procesar operaciones en memoria
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      items = items.filter(item => {
        if (operator === '>=') return item[key] >= value;
        if (operator === '=') return item[key] === value;
        return true;
      });
    } else if (method === 'sort') {
      const [key, direction] = args;
      items.sort((a, b) => {
        const result = a[key] > b[key] ? 1 : -1;
        return direction === 'desc' ? -result : result;
      });
    }
  });

  const last_op = operations[operations.length - 1];
  if (last_op?.[0] === 'first') return items[0];
  if (last_op?.[0] === 'last') return items[items.length - 1];

  return items;
});

// Query sobre datos en Redis
const cached_users = await cache
  .where('active', true)
  .where('score', '>=', 100)
  .sort('last_access', 'desc')
  .paginate(1, 20);
```

### Cómo Funciona Internamente

AsyncCollection utiliza un sistema de ejecución diferida en tres fases: registro de operaciones, construcción de contexto y ejecución.

#### 1. Fase de Registro de Operaciones

Cuando llamas a métodos como `where()`, `sort()` o `filter()`, AsyncCollection **no ejecuta nada inmediatamente**. En su lugar, registra cada operación en un array interno con el formato `[nombre_metodo, ...argumentos]`.

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  // En este punto, operations contiene todas las operaciones registradas
  console.log(operations);
  return [];
});

// Cada método añade una operación al array interno
const query = users
  .where('age', '>=', 18)      // Añade: ['where', 'age', '>=', 18]
  .where('status', 'active')   // Añade: ['where', 'status', 'active']
  .sort('name', 'asc')         // Añade: ['sort', 'name', 'asc']
  .slice(0, 10);               // Añade: ['slice', 0, 10]

// NADA se ha ejecutado todavía
// El array operations está completo pero el executor no ha sido llamado
```

#### 2. Fase de Construcción de Contexto

La ejecución se desencadena solo cuando resuelves la promesa usando `await`, `.then()`, `.catch()` o `.finally()`. En ese momento, AsyncCollection llama internamente a `_build_context()` que crea el `ExecutorContext`:

```typescript
// Cuando haces await, internamente pasa esto:
const context = {
  operations: [
    ['where', 'age', '>=', 18],
    ['where', 'status', 'active'],
    ['sort', 'name', 'asc'],
    ['slice', 0, 10]
  ],
  validators: custom_validators,  // Si se proporcionaron
  metadata: {
    created_at: new Date(),
    operation_count: 4,
    chain_depth: 4
  }
};
```

#### 3. Fase de Ejecución del Executor

El executor recibe el contexto y es responsable de:

1. Interpretar cada operación del array `operations`
2. Transformarlas al formato de tu fuente de datos (SQL, Prisma, TypeORM, etc.)
3. Ejecutar la query final
4. Retornar los resultados

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  // El executor interpreta las operaciones
  let data = await fetchUsers();

  // Procesa cada operación en orden
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      data = data.filter(item => {
        if (operator === '>=') return item[key] >= value;
        if (operator === '=') return item[key] === value;
        return true;
      });
    } else if (method === 'sort') {
      const [key, direction] = args;
      data.sort((a, b) => {
        const result = a[key] > b[key] ? 1 : -1;
        return direction === 'desc' ? -result : result;
      });
    } else if (method === 'slice') {
      const [start, end] = args;
      data = data.slice(start, end);
    }
  });

  return data;
});

// Al hacer await, se ejecuta el executor con el contexto
const result = await users
  .where('age', '>=', 18)
  .where('status', 'active')
  .sort('name', 'asc')
  .slice(0, 10);
```

#### 4. Fase de Resolución de Resultados

La promesa se resuelve con el valor que retorna el executor:

```typescript
// El resultado es lo que retorna tu executor
const result = await users.where('age', '>=', 18); // T[] o T dependiendo del executor
```

### Visualización del Array de Operaciones

El array `operations` es la columna vertebral de AsyncCollection. Aquí puedes ver exactamente qué contiene en diferentes escenarios:

#### Ejemplo 1: Operaciones Básicas

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  console.log('Operations:', JSON.stringify(operations, null, 2));
  return [];
});

await users
  .where('age', '>=', 18)
  .where('status', 'active')
  .sort('name', 'asc')
  .slice(0, 10);

// Console output:
// Operations: [
//   ["where", "age", ">=", 18],
//   ["where", "status", "active"],
//   ["sort", "name", "asc"],
//   ["slice", 0, 10]
// ]
```

#### Ejemplo 2: Operaciones con Objetos de Query

```typescript
await users
  .filter({ age: { $gte: 18 }, status: 'active' })
  .not({ deleted: true })
  .sort('created_at', 'desc');

// Operations: [
//   ["filter", { age: { $gte: 18 }, status: "active" }],
//   ["not", { deleted: true }],
//   ["sort", "created_at", "desc"]
// ]
```

#### Ejemplo 3: Operaciones con Paginación

```typescript
await users
  .where('verified', true)
  .sort('score', 'desc')
  .paginate(2, 20);

// Operations: [
//   ["where", "verified", true],
//   ["sort", "score", "desc"],
//   ["paginate", 2, 20]
// ]
```

#### Ejemplo 4: Operaciones Terminales

```typescript
await users
  .where('role', 'admin')
  .sort('last_login', 'desc')
  .first();

// Operations: [
//   ["where", "role", "admin"],
//   ["sort", "last_login", "desc"],
//   ["first"]
// ]
```

### Operaciones Terminales

Las **operaciones terminales** son métodos que indican al executor que debe retornar un único elemento en lugar de un array. AsyncCollection reconoce estas operaciones y permite que tu executor las maneje de forma especial.

#### Operaciones Terminales Disponibles

- `first()` - Retorna el primer elemento que coincida o `null`
- `last()` - Retorna el último elemento que coincida o `null`
- `find()` - Alias de `first()` (retorna primer elemento o `null`)

#### Detectar Operaciones Terminales

Puedes verificar la última operación en el array para determinar si necesitas retornar un único elemento:

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  const query = buildQuery(operations);
  const last_op = operations[operations.length - 1];

  // Detectar si la última operación es terminal
  if (last_op && (last_op[0] === 'first' || last_op[0] === 'find')) {
    // Retornar un único elemento o null
    const result = await db.query(query).limit(1);
    return result[0] ?? null;
  }

  if (last_op && last_op[0] === 'last') {
    // Retornar el último elemento o null
    const results = await db.query(query);
    return results[results.length - 1] ?? null;
  }

  // Operación normal, retornar array
  return await db.query(query);
});
```

#### Ejemplo con Prisma

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  const where: any = {};
  const orderBy: any = [];

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      where[key] = operator === '=' ? value : { gte: value };
    } else if (method === 'sort') {
      const [key, direction] = args;
      orderBy.push({ [key]: direction || 'asc' });
    }
  });

  const query = { where, orderBy };
  const last_op = operations[operations.length - 1];

  // Usar findFirst() para operaciones terminales
  if (last_op?.[0] === 'first' || last_op?.[0] === 'find') {
    return await prisma.user.findFirst(query);
  }

  // Usar findMany() para operaciones normales
  return await prisma.user.findMany(query);
});

// Retorna un único usuario o null
const admin = await users.where('role', 'admin').first();

// Retorna array de usuarios
const all_admins = await users.where('role', 'admin');
```

#### Ejemplo con TypeORM

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  const qb = getRepository(User).createQueryBuilder('user');

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      qb.andWhere(`user.${key} = :${key}`, { [key]: value });
    }
  });

  const last_op = operations[operations.length - 1];

  // Usar getOne() para operaciones terminales
  if (last_op?.[0] === 'first' || last_op?.[0] === 'find') {
    return await qb.getOne();
  }

  if (last_op?.[0] === 'last') {
    const results = await qb.getMany();
    return results[results.length - 1] ?? null;
  }

  // Usar getMany() para operaciones normales
  return await qb.getMany();
});
```

### Consideraciones de Rendimiento

#### 1. Crecimiento del Array de Operaciones

Cada llamada a un método añade una entrada al array `operations`. Para cadenas muy largas (100+ operaciones), considera estas estrategias:

```typescript
// ❌ Evitar: cadena extremadamente larga
const result = await users
  .where('field1', 'value1')
  .where('field2', 'value2')
  // ... 98 operaciones más
  .where('field100', 'value100');

// ✅ Mejor: agrupar condiciones en filter()
const result = await users.filter({
  field1: 'value1',
  field2: 'value2',
  // ... todas las condiciones en un objeto
  field100: 'value100'
});

// ✅ Mejor: dividir en múltiples queries
const filtered = await users.where('category', 'active');
const paginated = await filtered.sort('date', 'desc').paginate(1, 20);
```

El array `operations` se copia cuando se construye el contexto, por lo que cadenas muy largas pueden tener un pequeño overhead de memoria. En la práctica, esto solo es relevante con 100+ operaciones.

#### 2. Caché de Resultados en el Executor

**AsyncCollection NO cachea resultados por defecto**. Cada vez que haces `await`, se vuelve a ejecutar el executor completo:

```typescript
const active_users = users.where('status', 'active');

// Primera ejecución: ejecuta el executor
const result1 = await active_users;

// Segunda ejecución: vuelve a ejecutar el executor desde cero
const result2 = await active_users;
```

Si necesitas cachear resultados, debes implementarlo en tu executor:

```typescript
const cache = new Map<string, any>();

const users = new AsyncCollection<User>(async ({ operations }) => {
  // Crear clave de caché basada en las operaciones
  const cache_key = JSON.stringify(operations);

  // Verificar si el resultado está en caché
  if (cache.has(cache_key)) {
    console.log('Resultado desde caché');
    return cache.get(cache_key);
  }

  // Ejecutar query si no está en caché
  console.log('Ejecutando query...');
  const result = await executeQuery(operations);

  // Guardar en caché
  cache.set(cache_key, result);

  return result;
});

// Primera ejecución: ejecuta query
const result1 = await users.where('age', '>=', 18); // "Ejecutando query..."

// Segunda ejecución: retorna desde caché
const result2 = await users.where('age', '>=', 18); // "Resultado desde caché"

// Tercera ejecución con operaciones diferentes: ejecuta query
const result3 = await users.where('status', 'active'); // "Ejecutando query..."
```

Para cachés más sofisticados, considera usar TTL (time-to-live):

```typescript
interface CacheEntry<T> {
  data: T;
  expires_at: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 60000; // 60 segundos

const users = new AsyncCollection<User>(async ({ operations }) => {
  const cache_key = JSON.stringify(operations);
  const now = Date.now();

  // Verificar caché válido
  const cached = cache.get(cache_key);
  if (cached && cached.expires_at > now) {
    return cached.data;
  }

  // Ejecutar query y cachear con TTL
  const result = await executeQuery(operations);
  cache.set(cache_key, {
    data: result,
    expires_at: now + CACHE_TTL
  });

  return result;
});
```

#### 3. Múltiples Awaits y Re-ejecución

Es importante entender que cada `await` causa una re-ejecución completa del executor:

```typescript
const active_users = users
  .where('status', 'active')
  .sort('name', 'asc');

// Primera ejecución: query a la base de datos
const result1 = await active_users;

// Segunda ejecución: OTRA query a la base de datos
const result2 = await active_users;

// Tercera ejecución: OTRA query a la base de datos
const result3 = await active_users;
```

Si necesitas usar el resultado múltiples veces, guárdalo en una variable:

```typescript
// ✅ Mejor: ejecutar una vez y reutilizar
const active_users_query = users
  .where('status', 'active')
  .sort('name', 'asc');

const result = await active_users_query;

// Usar el resultado múltiples veces sin re-ejecutar
console.log(result.length);
result.forEach(user => console.log(user.name));
const first_user = result[0];
```

#### 4. Optimización en Executors para ORMs

Cuando trabajes con ORMs, es crucial construir queries eficientes:

```typescript
// ❌ Evitar: cargar todos los datos y filtrar en memoria
const users = new AsyncCollection<User>(async ({ operations }) => {
  let data = await prisma.user.findMany(); // Carga TODOS los usuarios

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      data = data.filter(/* ... */); // Filtra en memoria
    }
  });

  return data;
});

// ✅ Mejor: construir query eficiente en el ORM
const users = new AsyncCollection<User>(async ({ operations }) => {
  const where: any = {};

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3 ? args : [args[0], '=', args[1]];
      where[key] = value; // Construye query de Prisma
    }
  });

  return await prisma.user.findMany({ where }); // Query optimizada
});
```

#### 5. Medición de Performance

Para identificar cuellos de botella, añade logging a tu executor:

```typescript
const users = new AsyncCollection<User>(async ({ operations, metadata }) => {
  const start = Date.now();

  console.log(`Ejecutando ${metadata.operation_count} operaciones`);

  const result = await executeQuery(operations);

  const duration = Date.now() - start;
  console.log(`Query completada en ${duration}ms`);

  return result;
});
```

## Collection TypeScript Signature

```ts
Collection<T, V>;
// T = item type
// V = shape for query validation
```

This ensures type-safe autocompletion and query shape consistency.

## Query DSL Aliases

| Alias      | Mongo DSL   | Meaning                     |
| ---------- | ----------- | --------------------------- |
| `=`        | `$eq`       | equal                       |
| `!=`       | `$not`      | not equal                   |
| `>`        | `$gt`       | greater than                |
| `<`        | `$lt`       | less than                   |
| `>=`       | `$gte`      | greater or equal            |
| `<=`       | `$lte`      | less or equal               |
| `in`       | `$in`       | included in array           |
| `includes` | `$includes` | contains substring or value |

## Performance and Best Practices

- Underlying logic delegates to native `Array` methods.
- Query filtering is optimized using precompiled functions.
- Avoid frequent mutation in large collections; prefer `.collect()` clones.
- For secure randomness, override `random()` with your own comparator.

## Contribution Guide

1. Fork and clone this repo.
2. Run `npm install`.
3. Run tests: `npm run test`.
4. Follow conventional commits.

### Available Scripts

| Script          | Description             |
| --------------- | ----------------------- |
| `npm run build` | Compile TS and bundle   |
| `npm run test`  | Run unit tests          |
| `npm run lint`  | Run ESLint and Prettier |

## Roadmap

- [ ] LazyCollection using generators
- [x] AsyncCollection support for promises/streams
- [ ] Drop lodash dependency
- [ ] YAML/CSV serialization

## License

MIT © 2025 Miguel Alejandro (Miguel Guevara) [miguel.guevara@arcaelas.com](mailto:miguel.guevara@arcaelas.com)

---

<div  style="text-align:center;margin-top:50px;">
	<p  align="center">
		<img  src="https://raw.githubusercontent.com/arcaelas/dist/main/logo/svg/64.svg"  height="32px">
	<p>

Want to discuss any of my open source projects, or something else? Send me a direct message on [Twitter](https://twitter.com/arcaelas).<br> If you already use these libraries and want to support us to continue development, you can sponsor us at [Github Sponsors](https://github.com/sponsors/arcaelas).

</div>
