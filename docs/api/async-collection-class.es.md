# Clase AsyncCollection

Referencia completa de la API para la clase AsyncCollection - un query builder diferido para crear abstracciones sobre cualquier fuente de datos.

## Importación

```typescript
import AsyncCollection from "@arcaelas/collection/async";
```

## Constructor

### `new AsyncCollection<T, V>(executor, validators?)`

Crea una nueva instancia de AsyncCollection con una función executor personalizada.

**Parámetros de Tipo:**

- `T` - Tipo de elementos en la colección
- `V` - Tipo de validadores personalizados (opcional)

**Parámetros:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `executor` | `Executor<T, V>` | Sí | Función que procesa operaciones y retorna resultados |
| `validators` | `V` | No | Validadores personalizados para extender operadores de consulta |

**Ejemplo:**

```typescript
const users = new AsyncCollection<User>(
  async ({ operations, validators, metadata }) => {
    console.log(`Procesando ${metadata.operation_count} operaciones`);
    return await processOperations(operations);
  }
);
```

## Definiciones de Tipos

### `Executor<T, V>`

Tipo de función para el executor que procesa el contexto.

```typescript
type Executor<T = any, V = any> = (
  context: ExecutorContext<T, V>
) => T | T[] | Promise<T | T[]>;
```

**Parámetros:**

- `context` - ExecutorContext conteniendo operaciones, validadores y metadatos

**Retorna:**

- Un único item `T`, array de items `T[]`, o Promise de cualquiera de los dos

### `ExecutorContext<T, V>`

Objeto de contexto pasado a la función executor.

```typescript
interface ExecutorContext<T = any, V = any> {
  operations: [string, ...any[]][];
  validators?: V;
  metadata: {
    created_at: Date;
    operation_count: number;
    chain_depth: number;
  };
}
```

**Propiedades:**

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `operations` | `[string, ...any[]][]` | Array de operaciones registradas en formato `[nombre_método, ...args]` |
| `validators` | `V` | Validadores personalizados proporcionados en el constructor |
| `metadata.created_at` | `Date` | Marca de tiempo cuando se creó el contexto |
| `metadata.operation_count` | `Number` | Número total de operaciones registradas |
| `metadata.chain_depth` | `Number` | Profundidad de la cadena de métodos (igual a operation_count) |

## Implementación Thenable

AsyncCollection implementa la interfaz Thenable, haciéndola awaitable.

### `then(onfulfilled?, onrejected?)`

Implementa Promise.then() para ejecución asíncrona.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `onfulfilled` | `(value: any) => TResult1` | Callback opcional cuando se resuelve |
| `onrejected` | `(reason: any) => TResult2` | Callback opcional cuando se rechaza |

**Retorna:** `Promise<TResult1 | TResult2>`

**Ejemplo:**

```typescript
users
  .where('active', true)
  .then(results => console.log(results))
  .catch(error => console.error(error));

// O con await
const results = await users.where('active', true);
```

### `catch(onrejected?)`

Implementa Promise.catch() para manejo de errores.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `onrejected` | `(reason: any) => TResult` | Manejador de errores opcional |

**Retorna:** `Promise<TResult>`

**Ejemplo:**

```typescript
users
  .where('age', '>=', 18)
  .catch(error => {
    console.error('Consulta fallida:', error);
    return [];
  });
```

### `finally(onfinally?)`

Implementa Promise.finally() para limpieza.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `onfinally` | `() => void` | Callback de limpieza opcional |

**Retorna:** `Promise<any>`

**Ejemplo:**

```typescript
users
  .where('active', true)
  .finally(() => {
    console.log('Consulta completada');
  });
```

## Métodos de Filtrado

### `where(key, value)`
### `where(key, operator, value)`

Filtra la colección usando operador where con comparaciones.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `key` | `string` | Clave del campo a comparar (soporta notación de punto) |
| `operator` | `string` | Operador de comparación opcional: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `includes` |
| `value` | `any` | Valor a comparar |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.where('age', '>=', 18)
users.where('status', 'active')  // operador '=' por defecto
users.where('user.profile.verified', true)
```

### `whereNot(key, value)`
### `whereNot(key, operator, value)`

Filtro inverso - excluye elementos coincidentes.

**Parámetros:** Igual que `where()`

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.whereNot('deleted', true)
users.whereNot('age', '<', 18)
```

### `filter(handler)`

Filtra elementos usando una función u objeto Query.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Función de filtro u objeto de consulta |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.filter(user => user.age >= 18)
users.filter({ age: { $gte: 18 }, status: 'active' })
```

### `not(handler)`

Filtro inverso - excluye elementos coincidentes.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Función de filtro u objeto de consulta |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.not(user => user.deleted)
users.not({ deleted: true })
```

## Métodos de Búsqueda

### `first(handler?)`

Obtiene el primer elemento que coincide con el criterio.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Función de filtro u objeto de consulta opcional |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.where('age', '>=', 18).first()
users.first(user => user.active)
users.first({ status: 'active' })
```

### `last(handler?)`

Obtiene el último elemento que coincide con el criterio.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Función de filtro u objeto de consulta opcional |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.where('age', '>=', 18).last()
users.last(user => user.active)
```

### `find(handler)`

Busca el primer elemento que coincide con el criterio (alias de `first()`).

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `Function \| Object` | Función de filtro u objeto de consulta |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.find(user => user.email === 'test@example.com')
users.find({ email: 'test@example.com' })
```

### `every(handler, value?)`

Verifica que todos los elementos cumplan el criterio.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `Function \| Object \| string` | Función de validación, objeto de consulta o clave string |
| `value` | `any` | Valor opcional a comparar (cuando handler es string) |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.every(user => user.age >= 18)
users.every({ active: true })
users.every('status', 'active')
```

## Métodos de Transformación

### `map(handler)`

Transforma cada elemento usando una función de mapeo.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `(item: T, index: number, arr: T[]) => any` | Función de transformación |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.map(user => ({ ...user, displayName: `${user.name} (${user.age})` }))
users.map(user => user.email)
```

### `each(fn)`

Itera sobre cada elemento ejecutando un callback.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fn` | `(item: T, index: number, arr: T[]) => any` | Callback para cada elemento (retorna `false` para detener) |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.each((user, index) => {
  console.log(user);
  if (index >= 10) return false; // Detener después de 10
})
```

### `forget(...keys)`

Elimina campos específicos de cada elemento.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `keys` | `string[]` | Claves de campos a eliminar |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.forget('password', 'token')
users.forget('secret', 'internal_id')
```

## Métodos de Ordenamiento

### `sort(handler?, direction?)`

Ordena elementos por clave o función comparadora.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `string \| ((a: T, b: T) => number)` | Clave del campo o función comparadora |
| `direction` | `'asc' \| 'desc'` | Dirección del ordenamiento (cuando handler es string) |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.sort('price', 'desc')
users.sort((a, b) => a.price - b.price)
```

### `reverse()`

Invierte el orden de los elementos.

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.reverse()
```

### `shuffle()`

Desordena aleatoriamente los elementos.

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.shuffle()
```

### `random(length?)`

Obtiene elementos aleatorios de la colección.

**Parámetros:**

| Parámetro | Tipo | Por Defecto | Descripción |
|-----------|------|-------------|-------------|
| `length` | `number` | `Infinity` | Número de elementos aleatorios a obtener |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.random(5)  // Obtener 5 usuarios aleatorios
users.random()   // Obtener todos en orden aleatorio
```

## Métodos de Fragmentación y Paginación

### `slice(start, end?)`

Obtiene un fragmento de la colección.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `start` | `number` | Índice de inicio |
| `end` | `number` | Índice de fin opcional |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.slice(0, 10)   // Primeros 10
users.slice(10, 20)  // Items 10-20
users.slice(5)       // Desde índice 5 hasta el final
```

### `chunk(size)`

Divide la colección en bloques de tamaño especificado.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `size` | `number` | Tamaño de cada bloque |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.chunk(10)  // Dividir en grupos de 10
```

### `paginate(page?, perPage?)`

Pagina los resultados.

**Parámetros:**

| Parámetro | Tipo | Por Defecto | Descripción |
|-----------|------|-------------|-------------|
| `page` | `number` | `1` | Número de página (basado en 1) |
| `perPage` | `number` | `20` | Items por página |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.paginate(1, 20)  // Primera página, 20 items
users.paginate(2, 50)  // Segunda página, 50 items
```

## Métodos de Agregación

### `sum(handler)`

Suma valores de una clave o función.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => number)` | Clave del campo o función que retorna valor numérico |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.sum('price')
users.sum(user => user.price * user.quantity)
```

### `max(key)`

Obtiene el valor máximo de una clave.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `key` | `string` | Clave del campo |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.max('age')
users.max('score')
```

### `min(key)`

Obtiene el valor mínimo de una clave.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `key` | `string` | Clave del campo |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.min('age')
users.min('price')
```

### `groupBy(handler)`

Agrupa elementos por clave o función.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => string \| number)` | Clave del campo o función de agrupación |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.groupBy('category')
users.groupBy(user => user.date.getFullYear())
```

### `countBy(handler)`

Cuenta elementos agrupados por clave o función.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => string \| number)` | Clave del campo o función de agrupación |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.countBy('status')  // { active: 10, inactive: 5 }
users.countBy(user => user.age >= 18 ? 'adult' : 'minor')
```

## Métodos Utilitarios

### `unique(handler)`

Obtiene solo elementos únicos por clave o función.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `handler` | `string \| ((item: T, index: number, arr: T[]) => any)` | Clave del campo o función que retorna identificador único |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.unique('email')
users.unique(user => user.user_id)
```

### `update(where, set?)`

Actualiza elementos que coinciden con un criterio.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `where` | `Object \| Function` | Objeto de consulta o función de filtro (opcional) |
| `set` | `Object \| Function` | Campos a actualizar o función de actualización |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.update({ active: false }, { deletedAt: new Date() })
users.update({ deletedAt: new Date() })  // Actualizar todos
```

### `delete(where)`

Elimina elementos que coinciden con un criterio.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `where` | `Object \| Function` | Objeto de consulta o función de filtro |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.delete({ deleted: true })
users.delete(user => user.inactive)
```

### `collect(items?)`

Clona el contexto actual con items opcionales.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `items` | `T[]` | Items opcionales para nueva colección |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.collect([...newData])
users.collect()  // Clonar sin items
```

## Métodos de Debugging

### `dump()`

Imprime la colección en consola para debugging.

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users
  .filter({ active: true })
  .dump()  // Imprime en consola
  .sort('age', 'desc');
```

### `dd()`

Imprime la colección y termina el proceso (solo Node.js).

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.dd();  // Imprime y sale
```

### `stringify(replacer?, space?)`

Convierte la colección a string JSON.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `replacer` | `(key: string, value: any) => any` | Función replacer de JSON opcional |
| `space` | `string \| number` | Espaciado opcional para formato |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.stringify(null, 2)  // JSON con formato
users.stringify()         // JSON compacto
```

## Métodos de Extensión

### `macro(key, handler)`

Registra un macro personalizado (extensión de método).

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `key` | `string` | Nombre del método personalizado |
| `handler` | `Function` | Implementación del método personalizado |

**Retorna:** `this` (encadenable)

**Ejemplo:**

```typescript
users.macro('activeOnly', function() {
  return this.where('status', 'active');
})

// Uso
await users.activeOnly();
```

## Ejemplos de Uso

### Con Prisma

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  const where: any = {};
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, op, val] = args.length === 3 ? args : [args[0], '=', args[1]];
      where[key] = op === '>=' ? { gte: val } : val;
    }
  });
  return await prisma.user.findMany({ where });
});

await users.where('age', '>=', 18);
```

### Con TypeORM

```typescript
const users = new AsyncCollection<User>(async ({ operations }) => {
  const qb = getRepository(User).createQueryBuilder('user');
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      qb.andWhere(`user.${args[0]} = :${args[0]}`, { [args[0]]: args[1] });
    }
  });
  return await qb.getMany();
});

await users.where('status', 'active');
```

### Con API REST

```typescript
const api = new AsyncCollection(async ({ operations }) => {
  const params = new URLSearchParams();
  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      params.append(args[0], args[1]);
    }
  });
  const response = await fetch(`/api/users?${params}`);
  return await response.json();
});

await api.where('status', 'active');
```

## Ver También

- [Guía de AsyncCollection](../guides/async-collection.md) - Introducción y conceptos
- [Ejemplos de Uso](../examples/async-collection-usage.md) - Ejemplos del mundo real
- [Uso con TypeScript](../advanced/typescript-usage.md) - Patrones de seguridad de tipos
