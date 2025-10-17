# Guía de AsyncCollection

¡Bienvenido a la guía de AsyncCollection! Esta guía introduce el patrón de query builder diferido para crear abstracciones sobre cualquier fuente de datos, incluyendo ORMs, APIs REST, GraphQL y más.

## ¿Qué es AsyncCollection?

AsyncCollection implementa un patrón de Query Builder que construye un "plan de consulta" (array de operaciones) que se ejecuta cuando la promesa se resuelve. Esto permite crear abstracciones poderosas sobre cualquier fuente de datos transformando las operaciones al formato específico requerido por tu ORM o API.

### Características Principales

- **Ejecución Diferida**: Las operaciones se registran pero no se ejecutan hasta que usas await o llamas `.then()`
- **Agnóstico de ORM**: Funciona con Prisma, TypeORM, Sequelize, Mongoose o cualquier fuente de datos
- **Seguridad de Tipos**: Soporte completo de TypeScript con genéricos
- **Encadenable**: Interfaz fluida para construir consultas complejas
- **Flexible**: Transforma operaciones para coincidir con el formato de tu fuente de datos

## Cuándo Usar AsyncCollection

Usa AsyncCollection cuando necesites:

- Crear abstracciones sobre ORMs de base de datos
- Construir interfaces de consulta reutilizables para APIs REST
- Implementar capas de acceso a datos personalizadas
- Unificar diferentes fuentes de datos bajo una interfaz común
- Diferir la ejecución de consultas hasta que se apliquen todos los filtros

## Conceptos Básicos

### La Función Executor

El executor es el núcleo de AsyncCollection. Recibe un contexto que contiene todas las operaciones y devuelve los resultados:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

const executor = async ({ operations, validators, metadata }) => {
  // operations: Array de [nombre_metodo, ...args]
  // validators: Validadores personalizados (opcional)
  // metadata: Info de la consulta (created_at, operation_count, chain_depth)

  console.log(`Procesando ${metadata.operation_count} operaciones`);

  // Transforma operaciones a tu formato
  // Ejecuta la consulta
  // Retorna resultados

  return results;
};

const collection = new AsyncCollection(executor);
```

### Registro de Operaciones

Cuando encadenas métodos, se registran como operaciones:

```typescript
const users = new AsyncCollection(executor);

// Estas operaciones se registran pero NO se ejecutan aún
users
  .where('age', '>=', 18)
  .where('status', 'active')
  .sort('name', 'asc');

// La ejecución ocurre aquí (cuando la promesa se resuelve)
const results = await users;
```

### ExecutorContext

El contexto pasado a tu executor contiene:

```typescript
interface ExecutorContext<T, V> {
  // Array de operaciones: [nombre_metodo, ...args]
  operations: [string, ...any[]][];

  // Validadores personalizados para query()
  validators?: V;

  // Metadata sobre la consulta
  metadata: {
    created_at: Date;
    operation_count: number;
    chain_depth: number;
  };
}
```

## Ejemplo Simple: Array en Memoria

Comencemos con un ejemplo simple usando un array en memoria:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

// Datos en memoria
const data = [
  { id: 1, name: "Alice", age: 25, status: "active" },
  { id: 2, name: "Bob", age: 30, status: "inactive" },
  { id: 3, name: "Charlie", age: 35, status: "active" }
];

// Executor simple
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

// Úsalo
const active = await users.where('status', 'active');
// [{ id: 1, ... }, { id: 3, ... }]

const firstAdult = await users.where('age', '>=', 25).first();
// { id: 1, name: "Alice", ... }
```

## Trabajando con Prisma

Transforma operaciones a consultas de Prisma:

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

// Úsalo como Collection
const active = await users
  .where('age', '>=', 18)
  .where('verified', true)
  .sort('createdAt', 'desc');

const firstUser = await users
  .where('status', 'active')
  .first();
```

## Trabajando con TypeORM

Construye TypeORM QueryBuilder desde operaciones:

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

// Encadena operaciones
const result = await users
  .where('age', '>=', 21)
  .where('status', 'active')
  .sort('name', 'asc');
```

## Validadores Personalizados

Extiende las capacidades de consulta con validadores personalizados:

```typescript
const customValidators = {
  // Verifica si la fecha está en el pasado
  $isPast(ref: string, value: boolean) {
    return (item: any) => {
      const date = new Date(item[ref]);
      const isPast = date < new Date();
      return value ? isPast : !isPast;
    };
  },

  // Verifica si el valor está dentro del rango
  $between(ref: string, range: [number, number]) {
    return (item: any) => {
      const val = item[ref];
      return val >= range[0] && val <= range[1];
    };
  }
};

const items = new AsyncCollection(
  async ({ operations, validators }) => {
    // Usa validators para procesar operaciones
    // Transforma al formato de tu fuente de datos
    return processData(operations, validators);
  },
  customValidators
);

// Usa validadores personalizados
await items.filter({
  eventDate: { $isPast: true },
  score: { $between: [50, 100] }
});
```

## Encadenamiento de Métodos

Encadena múltiples operaciones de forma fluida:

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

## Operaciones Soportadas

AsyncCollection soporta todos los métodos de Collection:

### Filtrado
- `where(key, value)` o `where(key, operator, value)`
- `whereNot(key, value)` o `whereNot(key, operator, value)`
- `filter(handler)` - Función u objeto de consulta
- `not(handler)` - Filtro inverso

### Búsqueda
- `first(handler?)` - Primer elemento coincidente
- `last(handler?)` - Último elemento coincidente
- `find(handler)` - Alias de first

### Transformación
- `map(handler)` - Transforma elementos
- `each(handler)` - Itera elementos
- `forget(...keys)` - Elimina campos

### Ordenamiento
- `sort(key, direction)` o `sort(compareFunction)`
- `reverse()` - Invierte orden
- `shuffle()` - Orden aleatorio

### Fragmentación y Paginación
- `slice(start, end?)` - Fragmento de array
- `chunk(size)` - Divide en bloques
- `paginate(page, perPage)` - Pagina resultados

### Agregación
- `sum(key)` - Suma valores
- `max(key)` - Valor máximo
- `min(key)` - Valor mínimo
- `groupBy(key)` - Agrupa por clave
- `countBy(key)` - Cuenta por clave

### Utilidades
- `unique(key)` - Elementos únicos
- `random(count?)` - Elementos aleatorios
- `every(handler)` - Valida todos
- `collect(items?)` - Clona contexto

### Debugging
- `dump()` - Imprime en consola
- `dd()` - Dump and die (Node.js)
- `stringify(replacer?, space?)` - Convierte a JSON

## Manejo de Errores

Maneja errores en tu executor:

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  try {
    // Construye y ejecuta consulta
    const results = await executeQuery(operations);
    return results;
  } catch (error) {
    console.error('Consulta falló:', error);
    throw new Error(`Falló obtener usuarios: ${error.message}`);
  }
});

// Maneja errores al esperar
try {
  const results = await users.where('age', '>=', 18);
} catch (error) {
  console.error('Error:', error);
}

// O con .catch()
users
  .where('age', '>=', 18)
  .then(results => console.log(results))
  .catch(error => console.error(error));
```

## Mejores Prácticas

### 1. Valida Operaciones

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  // Valida operaciones antes de ejecutar
  const hasInvalidOp = operations.some(([method]) =>
    !['where', 'sort', 'first'].includes(method)
  );

  if (hasInvalidOp) {
    throw new Error('Operación no soportada');
  }

  return processOperations(operations);
});
```

### 2. Maneja Operaciones Terminales

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  const lastOp = operations[operations.length - 1];

  // Verifica operaciones terminales
  if (lastOp && lastOp[0] === 'first') {
    return await findFirst(operations.slice(0, -1));
  }

  if (lastOp && lastOp[0] === 'last') {
    return await findLast(operations.slice(0, -1));
  }

  return await findMany(operations);
});
```

### 3. Optimiza Construcción de Consultas

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  // Agrupa operaciones por tipo para procesamiento eficiente
  const where_ops = operations.filter(([m]) => m === 'where');
  const sort_ops = operations.filter(([m]) => m === 'sort');

  // Construye consulta optimizada
  const query = buildQuery({ where_ops, sort_ops });

  return await executeQuery(query);
});
```

## Próximos Pasos

- Consulta la [Referencia de API](../api/async-collection-class.md) para documentación completa de métodos
- Ver [Ejemplos de Uso](../examples/async-collection-usage.md) para patrones del mundo real
- Aprende sobre [Uso de TypeScript](../advanced/typescript-usage.md) para seguridad de tipos

## Patrones Comunes

### Wrapper de API REST

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

### Constructor GraphQL

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

## Consejos

1. **Mantén executors enfocados** - Una responsabilidad por AsyncCollection
2. **Valida operaciones** - Rechaza operaciones no soportadas temprano
3. **Maneja casos edge** - Verifica operaciones terminales como first/last
4. **Tipifica todo** - Usa genéricos de TypeScript para seguridad de tipos
5. **Prueba exhaustivamente** - Unit test de tu executor con diferentes cadenas de operaciones
