---
sidebar_position: 3
---

# Transformación y mapeo

Esta sección documenta los métodos de Arcaelas Collection para transformar y mapear elementos.

## map

Crea una nueva colección con los resultados de aplicar una función a cada elemento.

### Firma

```ts
map<U>(callback: (value: T, index: number, array: T[]) => U): Collection<U>
```

### Ejemplo

```ts
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', apellido: 'García' },
  { id: 2, nombre: 'Carlos', apellido: 'Rodríguez' },
  { id: 3, nombre: 'Elena', apellido: 'López' }
]);

const nombresCompletos = usuarios.map(u => ({
  id: u.id,
  nombreCompleto: `${u.nombre} ${u.apellido}`
}));

console.log(nombresCompletos[0]); // { id: 1, nombreCompleto: 'Ana García' }
```

### Diferencias con Array.map

A diferencia del método `map` nativo de Array, el método `map` de Collection:

1. Devuelve una instancia de `Collection` en lugar de un `Array`
2. Mantiene la cadena de métodos fluida

## each

Ejecuta una función para cada elemento sin modificar la colección.

### Firma

```ts
each(callback: (value: T, index: number, array: T[]) => void): this
```

### Ejemplo

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

// Ejecutar una acción para cada elemento
productos.each(p => {
  console.log(`Producto: ${p.nombre}, Precio: $${p.precio}`);
});

// Encadenamiento (a diferencia de forEach)
productos
  .each(p => console.log(`ID: ${p.id}`))
  .filter(p => p.precio < 100)
  .each(p => console.log(`Producto económico: ${p.nombre}`));
```

## macro

Extiende la funcionalidad de Collection añadiendo un método personalizado.

### Firma

```ts
macro<K extends string, A extends any[], R>(
  name: K, 
  callback: (this: Collection<T>, ...args: A) => R
): void
```

### Ejemplo

```ts
// Extender Collection con un método personalizado
Collection.macro('preciosConIVA', function(porcentajeIVA = 21) {
  return this.map(item => {
    if (typeof item === 'object' && item !== null && 'precio' in item) {
      const precio = item.precio as number;
      return {
        ...item,
        precioConIVA: precio + (precio * porcentajeIVA / 100)
      };
    }
    return item;
  });
});

// Usar el método personalizado
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 }
]);

// Nota: TypeScript necesitará una declaración de tipos para reconocer este método
const productosConIVA = productos.preciosConIVA(16);
console.log(productosConIVA[0]); // { id: 1, nombre: 'Mouse', precio: 20, precioConIVA: 23.2 }
```

:::tip Declaración de tipos para macros
Para usar macros con TypeScript, debes extender la interfaz de Collection:

```ts
declare module '@arcaelas/collection' {
  interface Collection<T> {
    preciosConIVA(porcentajeIVA?: number): Collection<T & { precioConIVA: number }>;
  }
}
```
:::

## chunk

Divide la colección en múltiples colecciones de tamaño específico.

### Firma

```ts
chunk(size: number): Collection<Collection<T>>
```

### Ejemplo

```ts
const numeros = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);

const grupos = numeros.chunk(3);
console.log(grupos.length); // 3
console.log(grupos[0]); // Collection [1, 2, 3]
console.log(grupos[1]); // Collection [4, 5, 6]
console.log(grupos[2]); // Collection [7, 8]
```

## dump

Convierte la colección a una representación de string para depuración.

### Firma

```ts
dump(): this
```

### Ejemplo

```ts
const usuarios = new Collection([
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Carlos' }
]);

// Muestra la representación en consola y devuelve la misma colección
usuarios.dump().filter(u => u.id > 1).dump();

// Salida en consola:
// [{"id":1,"nombre":"Ana"},{"id":2,"nombre":"Carlos"}]
// [{"id":2,"nombre":"Carlos"}]
```

## tap

Ejecuta una función con la colección como argumento y devuelve la colección original.

### Firma

```ts
tap(callback: (collection: this) => void): this
```

### Ejemplo

```ts
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

// Realizar operaciones intermedias sin afectar la cadena
const resultado = productos
  .where('precio', '<', 100)
  .tap(seleccion => {
    console.log(`Productos seleccionados: ${seleccion.length}`);
    // Realizar otras operaciones con la selección
  })
  .map(p => p.nombre);

console.log(resultado); // Collection ['Mouse', 'Teclado']
```

## pipe

Pasa la colección a través de una función de transformación.

### Firma

```ts
pipe<U>(callback: (collection: this) => U): U
```

### Ejemplo

```ts
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', activo: true },
  { id: 2, nombre: 'Carlos', activo: false },
  { id: 3, nombre: 'Elena', activo: true }
]);

// Transformar la colección con lógica personalizada
const resultado = usuarios.pipe(coleccion => {
  const activos = coleccion.filter(u => u.activo);
  const inactivos = coleccion.filter(u => !u.activo);
  
  return {
    totalUsuarios: coleccion.length,
    activos: activos.length,
    inactivos: inactivos.length,
    porcentajeActivos: (activos.length / coleccion.length) * 100
  };
});

console.log(resultado);
// {
//   totalUsuarios: 3,
//   activos: 2,
//   inactivos: 1,
//   porcentajeActivos: 66.66666666666666
// }
```
