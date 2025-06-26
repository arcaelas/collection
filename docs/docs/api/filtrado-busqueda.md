---
sidebar_position: 2
---

# Filtrado y búsqueda

Esta sección documenta los métodos de Arcaelas Collection para filtrar elementos y buscar coincidencias específicas.

## every

Verifica si todos los elementos de la colección cumplen con una condición.

### Firmas

```ts
// Con función callback
every(callback: (value: T, index: number, array: T[]) => boolean): boolean

// Con clave y valor
every(key: string, value: any): boolean

// Con clave, operador y valor
every(key: string, operator: string | Operator, value: any): boolean

// Con objeto de consulta
every(query: Record<string, any>): boolean
```

### Ejemplos

```ts
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', activo: true },
  { id: 2, nombre: 'Carlos', activo: true },
  { id: 3, nombre: 'Elena', activo: false }
]);

// Con función callback
const todosActivos = usuarios.every(u => u.activo);
console.log(todosActivos); // false

// Con clave y valor
const todosConId = usuarios.every('id', '!=', null);
console.log(todosConId); // true

// Con clave, operador y valor
const todosNombreLargo = usuarios.every('nombre.length', '>', 2);
console.log(todosNombreLargo); // true

// Con objeto de consulta
const todosConNombreEId = usuarios.every({ 
  nombre: { $exists: true },
  id: { $exists: true }
});
console.log(todosConNombreEId); // true
```

## filter

Crea una nueva colección con todos los elementos que cumplan la condición.

### Firmas

```ts
// Con función callback
filter(callback: (value: T, index: number, array: T[]) => boolean): Collection<T>

// Con objeto de consulta
filter(query: Record<string, any>): Collection<T>
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20, stock: 10 },
  { id: 2, nombre: 'Teclado', precio: 50, stock: 5 },
  { id: 3, nombre: 'Monitor', precio: 200, stock: 0 },
  { id: 4, nombre: 'Auriculares', precio: 80, stock: 8 }
]);

// Con función callback
const disponibles = productos.filter(p => p.stock > 0);
console.log(disponibles.length); // 3

// Con objeto de consulta
const caros = productos.filter({
  precio: { $gt: 50 },
  stock: { $gt: 0 }
});
console.log(caros.length); // 1
console.log(caros[0].nombre); // 'Auriculares'
```

## first

Devuelve el primer elemento que cumpla con la condición especificada.

### Firmas

```ts
// Sin argumentos (primer elemento)
first(): T | undefined

// Con función callback
first(callback: (value: T, index: number, array: T[]) => boolean): T | undefined

// Con clave y valor
first(key: string, value: any): T | undefined

// Con clave, operador y valor
first(key: string, operator: string | Operator, value: any): T | undefined

// Con objeto de consulta
first(query: Record<string, any>): T | undefined
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

// Sin argumentos
const primerProducto = productos.first();
console.log(primerProducto?.nombre); // 'Mouse'

// Con función callback
const primerCaro = productos.first(p => p.precio > 100);
console.log(primerCaro?.nombre); // 'Monitor'

// Con clave y valor
const teclado = productos.first('nombre', 'Teclado');
console.log(teclado?.id); // 2

// Con clave, operador y valor
const precioMedio = productos.first('precio', '>', 30);
console.log(precioMedio?.nombre); // 'Teclado'

// Con objeto de consulta
const resultado = productos.first({ 
  precio: { $lt: 100 },
  nombre: { $includes: 'e' }
});
console.log(resultado?.nombre); // 'Mouse'
```

## last

Devuelve el último elemento que cumpla con la condición especificada.

### Firmas

```ts
// Sin argumentos (último elemento)
last(): T | undefined

// Con función callback
last(callback: (value: T, index: number, array: T[]) => boolean): T | undefined

// Con clave y valor
last(key: string, value: any): T | undefined

// Con clave, operador y valor
last(key: string, operator: string | Operator, value: any): T | undefined

// Con objeto de consulta
last(query: Record<string, any>): T | undefined
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 },
  { id: 4, nombre: 'Auriculares', precio: 80 }
]);

// Sin argumentos
const ultimoProducto = productos.last();
console.log(ultimoProducto?.nombre); // 'Auriculares'

// Con función callback
const ultimoBarato = productos.last(p => p.precio < 100);
console.log(ultimoBarato?.nombre); // 'Auriculares'

// Con clave, operador y valor
const ultimoPrecioMedio = productos.last('precio', '<', 100);
console.log(ultimoPrecioMedio?.nombre); // 'Auriculares'
```

## where

Filtra la colección según una condición de clave, operador y valor.

### Firmas

```ts
// Con clave y valor (igualdad)
where(key: string, value: any): Collection<T>

// Con clave, operador y valor
where(key: string, operator: string | Operator, value: any): Collection<T>
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20, categoría: 'periféricos' },
  { id: 2, nombre: 'Teclado', precio: 50, categoría: 'periféricos' },
  { id: 3, nombre: 'Monitor', precio: 200, categoría: 'pantallas' },
  { id: 4, nombre: 'Auriculares', precio: 80, categoría: 'audio' }
]);

// Con clave y valor (igualdad)
const perifericos = productos.where('categoría', 'periféricos');
console.log(perifericos.length); // 2

// Con clave, operador y valor
const caros = productos.where('precio', '>=', 100);
console.log(caros[0].nombre); // 'Monitor'

// Encadenamiento
const resultados = productos
  .where('precio', '<', 100)
  .where('nombre', 'includes', 'e');
console.log(resultados.map(p => p.nombre)); // ['Mouse', 'Teclado']
```

## whereNot

Filtra la colección excluyendo elementos que cumplan una condición.

### Firmas

```ts
// Con clave y valor (desigualdad)
whereNot(key: string, value: any): Collection<T>

// Con clave, operador y valor
whereNot(key: string, operator: string | Operator, value: any): Collection<T>
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20, categoría: 'periféricos' },
  { id: 2, nombre: 'Teclado', precio: 50, categoría: 'periféricos' },
  { id: 3, nombre: 'Monitor', precio: 200, categoría: 'pantallas' },
  { id: 4, nombre: 'Auriculares', precio: 80, categoría: 'audio' }
]);

// Con clave y valor
const noPerifericos = productos.whereNot('categoría', 'periféricos');
console.log(noPerifericos.length); // 2
console.log(noPerifericos.map(p => p.nombre)); // ['Monitor', 'Auriculares']

// Con clave, operador y valor
const noBaratos = productos.whereNot('precio', '<', 50);
console.log(noBaratos.map(p => p.nombre)); // ['Teclado', 'Monitor', 'Auriculares']
```

## Operadores disponibles

Arcaelas Collection soporta varios operadores para consultas avanzadas:

| Operador | Alias | Descripción |
|----------|-------|-------------|
| `$eq` | `=` | Igualdad |
| `$not` | `!=` | Desigualdad |
| `$gt` | `>` | Mayor que |
| `$lt` | `<` | Menor que |
| `$gte` | `>=` | Mayor o igual que |
| `$lte` | `<=` | Menor o igual que |
| `$in` | `in` | Valor dentro de array |
| `$includes` | `includes` | String contiene substring |
| `$exists` | - | Propiedad existe |
| `$type` | - | Tipo de dato específico |

### Ejemplos con operadores

```ts
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', roles: ['admin', 'editor'] },
  { id: 2, nombre: 'Carlos', roles: ['editor'] },
  { id: 3, nombre: 'Elena', roles: ['viewer'] }
]);

// Usando $in
const admins = usuarios.where('roles', 'in', ['admin']);
console.log(admins[0].nombre); // 'Ana'

// Usando $includes
const nombresConA = usuarios.where('nombre', 'includes', 'a');
console.log(nombresConA.length); // 2

// Usando $exists
const conRoles = usuarios.filter({
  roles: { $exists: true }
});
console.log(conRoles.length); // 3
```
