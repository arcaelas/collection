---
sidebar_position: 5
---

# Manipulación de elementos

Esta sección documenta los métodos de Arcaelas Collection para manipular elementos individuales o grupos de elementos.

## push

Añade uno o más elementos al final de la colección y devuelve la nueva longitud.

### Firma

```ts
push(...items: T[]): number
```

### Ejemplo

```ts
const usuarios = new Collection<{ id: number; nombre: string }>();

// Añadir un elemento
usuarios.push({ id: 1, nombre: 'Ana' });

// Añadir múltiples elementos
const nuevaLongitud = usuarios.push(
  { id: 2, nombre: 'Carlos' },
  { id: 3, nombre: 'Elena' }
);

console.log(nuevaLongitud); // 3
console.log(usuarios.length); // 3
```

## delete

Elimina elementos de la colección según una condición y devuelve los elementos eliminados.

### Firmas

```ts
// Con función callback
delete(callback: (value: T, index: number, array: T[]) => boolean): Collection<T>

// Con clave y valor
delete(key: string, value: any): Collection<T>

// Con clave, operador y valor
delete(key: string, operator: string | Operator, value: any): Collection<T>

// Con objeto de consulta
delete(query: Record<string, any>): Collection<T>
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20, stock: 0 },
  { id: 2, nombre: 'Teclado', precio: 50, stock: 5 },
  { id: 3, nombre: 'Monitor', precio: 200, stock: 0 },
  { id: 4, nombre: 'Auriculares', precio: 80, stock: 3 }
]);

// Con función callback
const sinStock = productos.delete(p => p.stock === 0);
console.log(sinStock.length); // 2 (elementos eliminados)
console.log(productos.length); // 2 (elementos restantes)

// Reiniciar para los siguientes ejemplos
const productos2 = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20, stock: 0 },
  { id: 2, nombre: 'Teclado', precio: 50, stock: 5 },
  { id: 3, nombre: 'Monitor', precio: 200, stock: 0 },
  { id: 4, nombre: 'Auriculares', precio: 80, stock: 3 }
]);

// Con clave y valor
const monitores = productos2.delete('nombre', 'Monitor');
console.log(monitores[0].id); // 3
console.log(productos2.length); // 3

// Con clave, operador y valor
const caros = productos2.delete('precio', '>', 50);
console.log(caros.length); // 1
console.log(productos2.length); // 2

// Con objeto de consulta
const resultado = productos2.delete({ stock: { $eq: 0 } });
console.log(resultado.length); // 1
console.log(productos2.length); // 1
```

## splice

Cambia el contenido de la colección eliminando o reemplazando elementos existentes y/o agregando nuevos elementos.

### Firma

```ts
splice(start: number, deleteCount?: number, ...items: T[]): Collection<T>
```

### Ejemplo

```ts
const colores = new Collection(['rojo', 'verde', 'azul', 'amarillo']);

// Eliminar elementos
const eliminados = colores.splice(1, 2);
console.log(eliminados); // Collection ['verde', 'azul']
console.log(colores); // Collection ['rojo', 'amarillo']

// Añadir elementos sin eliminar
colores.splice(1, 0, 'naranja', 'morado');
console.log(colores); // Collection ['rojo', 'naranja', 'morado', 'amarillo']

// Reemplazar elementos
colores.splice(2, 1, 'violeta', 'rosa');
console.log(colores); // Collection ['rojo', 'naranja', 'violeta', 'rosa', 'amarillo']
```

## sort

Ordena los elementos de la colección y devuelve la colección ordenada.

### Firmas

```ts
// Con función de comparación
sort(compareFn?: (a: T, b: T) => number): this

// Con clave
sort(key: string): this

// Con clave y dirección
sort(key: string, direction: 'asc' | 'desc'): this
```

### Ejemplos

```ts
const usuarios = new Collection([
  { id: 3, nombre: 'Elena', edad: 25 },
  { id: 1, nombre: 'Ana', edad: 28 },
  { id: 2, nombre: 'Carlos', edad: 34 }
]);

// Con función de comparación
usuarios.sort((a, b) => a.id - b.id);
console.log(usuarios.map(u => u.id)); // [1, 2, 3]

// Con clave
usuarios.sort('nombre');
console.log(usuarios.map(u => u.nombre)); // ['Ana', 'Carlos', 'Elena']

// Con clave y dirección
usuarios.sort('edad', 'desc');
console.log(usuarios.map(u => u.nombre)); // ['Carlos', 'Ana', 'Elena']
```

## reverse

Invierte el orden de los elementos en la colección.

### Firma

```ts
reverse(): this
```

### Ejemplo

```ts
const numeros = new Collection([1, 2, 3, 4, 5]);

numeros.reverse();
console.log(numeros); // Collection [5, 4, 3, 2, 1]

// Encadenamiento
const letras = new Collection(['a', 'b', 'c', 'd']);
const resultado = letras.reverse().map(l => l.toUpperCase());
console.log(resultado); // Collection ['D', 'C', 'B', 'A']
```

## unique

Elimina elementos duplicados de la colección.

### Firmas

```ts
// Sin argumentos (para tipos primitivos)
unique(): Collection<T>

// Con clave (para objetos)
unique<K extends string>(key: K): Collection<T>

// Con función callback
unique<K>(callback: (item: T, index: number) => K): Collection<T>
```

### Ejemplos

```ts
// Con tipos primitivos
const numeros = new Collection([1, 2, 2, 3, 3, 3, 4, 5, 5]);
const numerosUnicos = numeros.unique();
console.log(numerosUnicos); // Collection [1, 2, 3, 4, 5]

// Con objetos y clave
const usuarios = new Collection([
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Carlos' },
  { id: 1, nombre: 'Ana (duplicado)' },
  { id: 3, nombre: 'Elena' }
]);

const usuariosUnicos = usuarios.unique('id');
console.log(usuariosUnicos.length); // 3
console.log(usuariosUnicos.map(u => u.nombre)); // ['Ana', 'Carlos', 'Elena']

// Con función callback
const productos = new Collection([
  { id: 1, categoría: 'A', nombre: 'Producto 1' },
  { id: 2, categoría: 'B', nombre: 'Producto 2' },
  { id: 3, categoría: 'A', nombre: 'Producto 3' },
  { id: 4, categoría: 'C', nombre: 'Producto 4' }
]);

const porCategoria = productos.unique(p => p.categoría);
console.log(porCategoria.length); // 3
console.log(porCategoria.map(p => p.nombre)); // ['Producto 1', 'Producto 2', 'Producto 4']
```

## merge

Combina la colección actual con arrays o colecciones adicionales.

### Firma

```ts
merge(...items: (T | T[] | Collection<T>)[]): Collection<T>
```

### Ejemplo

```ts
const coleccion1 = new Collection([1, 2, 3]);
const coleccion2 = new Collection([4, 5]);
const array = [6, 7];
const elemento = 8;

const resultado = coleccion1.merge(coleccion2, array, elemento);
console.log(resultado); // Collection [1, 2, 3, 4, 5, 6, 7, 8]

// La colección original no se modifica
console.log(coleccion1); // Collection [1, 2, 3]
```

## concat

Concatena la colección actual con arrays o colecciones adicionales.

### Firma

```ts
concat(...items: (T | ConcatArray<T>)[]): Collection<T>
```

### Ejemplo

```ts
const coleccion1 = new Collection(['a', 'b', 'c']);
const coleccion2 = new Collection(['d', 'e']);
const array = ['f', 'g'];

const resultado = coleccion1.concat(coleccion2, array);
console.log(resultado); // Collection ['a', 'b', 'c', 'd', 'e', 'f', 'g']

// La colección original no se modifica
console.log(coleccion1); // Collection ['a', 'b', 'c']
```

:::note Diferencia entre merge y concat
Aunque `merge` y `concat` parecen similares, `merge` es más flexible y puede manejar elementos individuales directamente, mientras que `concat` sigue el comportamiento estándar de Array.
:::
