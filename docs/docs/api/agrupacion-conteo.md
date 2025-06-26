---
sidebar_position: 4
---

# Agrupación y conteo

Esta sección documenta los métodos de Arcaelas Collection para agrupar y contar elementos.

## groupBy

Agrupa los elementos de la colección según una clave o función.

### Firmas

```ts
// Con clave
groupBy<K extends string>(key: K): Record<string, Collection<T>>

// Con función callback
groupBy<K extends string>(callback: (item: T, index: number) => K): Record<string, Collection<T>>
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', categoría: 'periféricos', precio: 20 },
  { id: 2, nombre: 'Teclado', categoría: 'periféricos', precio: 50 },
  { id: 3, nombre: 'Monitor', categoría: 'pantallas', precio: 200 },
  { id: 4, nombre: 'Auriculares', categoría: 'audio', precio: 80 }
]);

// Agrupar por clave
const porCategoría = productos.groupBy('categoría');
console.log(Object.keys(porCategoría)); // ['periféricos', 'pantallas', 'audio']
console.log(porCategoría.periféricos.length); // 2
console.log(porCategoría.pantallas[0].nombre); // 'Monitor'

// Agrupar por función callback
const porRangoPrecio = productos.groupBy(p => {
  if (p.precio < 50) return 'económico';
  if (p.precio < 100) return 'medio';
  return 'premium';
});

console.log(Object.keys(porRangoPrecio)); // ['económico', 'medio', 'premium']
console.log(porRangoPrecio.económico.length); // 1
console.log(porRangoPrecio.premium[0].nombre); // 'Monitor'
```

## countBy

Cuenta los elementos de la colección según una clave o función.

### Firmas

```ts
// Con clave
countBy<K extends string>(key: K): Record<string, number>

// Con función callback
countBy<K extends string>(callback: (item: T, index: number) => K): Record<string, number>
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', categoría: 'periféricos', stock: true },
  { id: 2, nombre: 'Teclado', categoría: 'periféricos', stock: false },
  { id: 3, nombre: 'Monitor', categoría: 'pantallas', stock: true },
  { id: 4, nombre: 'Auriculares', categoría: 'audio', stock: true }
]);

// Contar por clave
const conteoCategoria = productos.countBy('categoría');
console.log(conteoCategoria);
// { periféricos: 2, pantallas: 1, audio: 1 }

// Contar por función callback
const conteoStock = productos.countBy(p => p.stock ? 'disponible' : 'agotado');
console.log(conteoStock);
// { disponible: 3, agotado: 1 }

// Ejemplo con valores booleanos
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', activo: true },
  { id: 2, nombre: 'Carlos', activo: false },
  { id: 3, nombre: 'Elena', activo: true }
]);

const conteoEstado = usuarios.countBy('activo');
console.log(conteoEstado);
// { true: 2, false: 1 }
```

## keyBy

Crea un objeto indexado por una clave o función.

### Firmas

```ts
// Con clave
keyBy<K extends string>(key: K): Record<string, T>

// Con función callback
keyBy<K extends string>(callback: (item: T, index: number) => K): Record<string, T>
```

### Ejemplos

```ts
const usuarios = new Collection([
  { id: 'usr_1', nombre: 'Ana', email: 'ana@ejemplo.com' },
  { id: 'usr_2', nombre: 'Carlos', email: 'carlos@ejemplo.com' },
  { id: 'usr_3', nombre: 'Elena', email: 'elena@ejemplo.com' }
]);

// Indexar por clave
const porId = usuarios.keyBy('id');
console.log(porId.usr_1.nombre); // 'Ana'
console.log(porId.usr_2.email); // 'carlos@ejemplo.com'

// Indexar por función callback
const porEmail = usuarios.keyBy(u => u.email);
console.log(porEmail['ana@ejemplo.com'].id); // 'usr_1'

// Ejemplo con transformación
const porNombreCorto = usuarios.keyBy(u => u.nombre.toLowerCase().substring(0, 3));
console.log(porNombreCorto);
// {
//   ana: { id: 'usr_1', nombre: 'Ana', email: 'ana@ejemplo.com' },
//   car: { id: 'usr_2', nombre: 'Carlos', email: 'carlos@ejemplo.com' },
//   ele: { id: 'usr_3', nombre: 'Elena', email: 'elena@ejemplo.com' }
// }
```

:::caution Claves duplicadas
Si hay claves duplicadas, los elementos posteriores sobrescribirán a los anteriores. Asegúrate de usar claves únicas.
:::

## partition

Divide la colección en dos colecciones según una condición.

### Firma

```ts
partition(callback: (item: T, index: number) => boolean): [Collection<T>, Collection<T>]
```

### Ejemplo

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20, stock: 10 },
  { id: 2, nombre: 'Teclado', precio: 50, stock: 0 },
  { id: 3, nombre: 'Monitor', precio: 200, stock: 5 },
  { id: 4, nombre: 'Auriculares', precio: 80, stock: 0 }
]);

// Dividir en productos con y sin stock
const [conStock, sinStock] = productos.partition(p => p.stock > 0);

console.log(conStock.length); // 2
console.log(conStock.map(p => p.nombre)); // ['Mouse', 'Monitor']

console.log(sinStock.length); // 2
console.log(sinStock.map(p => p.nombre)); // ['Teclado', 'Auriculares']

// Ejemplo con precios
const [baratos, caros] = productos.partition(p => p.precio < 100);

console.log(baratos.length); // 3
console.log(caros.length); // 1
console.log(caros[0].nombre); // 'Monitor'
```

## reduce

Reduce la colección a un único valor aplicando una función acumuladora.

### Firma

```ts
reduce<U>(callback: (carry: U, item: T, index: number) => U, initial: U): U
```

### Ejemplos

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

// Calcular el precio total
const precioTotal = productos.reduce((total, p) => total + p.precio, 0);
console.log(precioTotal); // 270

// Crear un objeto con nombres como claves
const porNombre = productos.reduce((obj, p) => {
  obj[p.nombre] = p;
  return obj;
}, {} as Record<string, typeof productos[0]>);

console.log(porNombre.Teclado.precio); // 50

// Ejemplo más complejo: agrupar por rango de precios
const porRango = productos.reduce((grupos, p) => {
  const rango = p.precio < 50 ? 'económico' : p.precio < 100 ? 'medio' : 'premium';
  
  if (!grupos[rango]) {
    grupos[rango] = new Collection<typeof p>();
  }
  
  grupos[rango].push(p);
  return grupos;
}, {} as Record<string, Collection<typeof productos[0]>>);

console.log(porRango.económico.length); // 1
console.log(porRango.premium.length); // 1
```
