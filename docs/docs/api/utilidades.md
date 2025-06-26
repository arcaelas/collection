---
sidebar_position: 6
---

# Utilidades

Esta sección documenta los métodos de utilidad de Arcaelas Collection.

## isEmpty

Verifica si la colección está vacía.

### Firma

```ts
isEmpty(): boolean
```

### Ejemplo

```ts
const vacia = new Collection();
console.log(vacia.isEmpty()); // true

const noVacia = new Collection([1, 2, 3]);
console.log(noVacia.isEmpty()); // false

// Encadenamiento
const resultado = new Collection([1, 2, 3])
  .where('$value', '>', 5)
  .isEmpty();
console.log(resultado); // true
```

## isNotEmpty

Verifica si la colección no está vacía.

### Firma

```ts
isNotEmpty(): boolean
```

### Ejemplo

```ts
const vacia = new Collection();
console.log(vacia.isNotEmpty()); // false

const noVacia = new Collection([1, 2, 3]);
console.log(noVacia.isNotEmpty()); // true

// Encadenamiento con filtrado
const tieneElementosValidos = new Collection([1, 2, 3, 4])
  .where('$value', '>', 3)
  .isNotEmpty();
console.log(tieneElementosValidos); // true
```

## toArray

Convierte la colección a un array nativo.

### Firma

```ts
toArray(): T[]
```

### Ejemplo

```ts
const coleccion = new Collection(['a', 'b', 'c']);
const array = coleccion.toArray();

console.log(array); // ['a', 'b', 'c']
console.log(Array.isArray(array)); // true
console.log(array instanceof Collection); // false

// Útil para interoperar con APIs que esperan arrays nativos
const api = {
  procesarDatos(datos: string[]) {
    return datos.join('-');
  }
};

const resultado = api.procesarDatos(coleccion.toArray());
console.log(resultado); // 'a-b-c'
```

## toJSON

Serializa la colección a formato JSON.

### Firma

```ts
toJSON(): T[]
```

### Ejemplo

```ts
const usuarios = new Collection([
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Carlos' }
]);

const json = JSON.stringify(usuarios);
console.log(json); // '[{"id":1,"nombre":"Ana"},{"id":2,"nombre":"Carlos"}]'

// Deserializar
const parsed = JSON.parse(json);
console.log(parsed); // [{"id":1,"nombre":"Ana"},{"id":2,"nombre":"Carlos"}]

// Crear nueva colección desde JSON
const nuevaColeccion = new Collection(parsed);
console.log(nuevaColeccion.length); // 2
```

## clone

Crea una copia superficial de la colección.

### Firma

```ts
clone(): Collection<T>
```

### Ejemplo

```ts
const original = new Collection([1, 2, 3]);
const copia = original.clone();

// Las colecciones son distintas instancias
console.log(copia === original); // false

// Pero contienen los mismos elementos
console.log(copia.length === original.length); // true
console.log(copia[0] === original[0]); // true

// Modificar la copia no afecta al original
copia.push(4);
console.log(copia.length); // 4
console.log(original.length); // 3
```

:::caution Copia superficial
`clone()` realiza una copia superficial, lo que significa que los objetos dentro de la colección siguen siendo referencias a los objetos originales.
:::

## random

Obtiene un elemento aleatorio de la colección.

### Firma

```ts
random(): T | undefined
```

### Ejemplo

```ts
const colores = new Collection(['rojo', 'verde', 'azul', 'amarillo', 'morado']);

const colorAleatorio = colores.random();
console.log(colorAleatorio); // Un color aleatorio de la colección

// Útil para selecciones aleatorias
const usuarios = new Collection([
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'Carlos' },
  { id: 3, nombre: 'Elena' },
  { id: 4, nombre: 'David' }
]);

const ganador = usuarios.random();
console.log(`El ganador es: ${ganador?.nombre}`);
```

## shuffle

Mezcla aleatoriamente los elementos de la colección.

### Firma

```ts
shuffle(): this
```

### Ejemplo

```ts
const numeros = new Collection([1, 2, 3, 4, 5]);

numeros.shuffle();
console.log(numeros); // Orden aleatorio, por ejemplo: [3, 1, 5, 2, 4]

// Útil para crear secuencias aleatorias
const cartas = new Collection(['A♠', 'K♠', 'Q♠', 'J♠', '10♠', '9♠', '8♠']);
cartas.shuffle();
console.log(cartas); // Orden aleatorio
```

## sum

Calcula la suma de los valores de la colección.

### Firmas

```ts
// Para colecciones de números
sum(): number

// Para colecciones de objetos, con clave
sum(key: string): number

// Para colecciones de objetos, con función callback
sum(callback: (item: T, index: number) => number): number
```

### Ejemplos

```ts
// Con números
const numeros = new Collection([1, 2, 3, 4, 5]);
console.log(numeros.sum()); // 15

// Con objetos y clave
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

console.log(productos.sum('precio')); // 270

// Con función callback
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', compras: [100, 50, 25] },
  { id: 2, nombre: 'Carlos', compras: [200, 300] },
  { id: 3, nombre: 'Elena', compras: [75, 125, 50, 50] }
]);

const totalCompras = usuarios.sum(u => u.compras.reduce((sum, c) => sum + c, 0));
console.log(totalCompras); // 975
```

## avg

Calcula el promedio de los valores de la colección.

### Firmas

```ts
// Para colecciones de números
avg(): number

// Para colecciones de objetos, con clave
avg(key: string): number

// Para colecciones de objetos, con función callback
avg(callback: (item: T, index: number) => number): number
```

### Ejemplos

```ts
// Con números
const calificaciones = new Collection([85, 90, 78, 92, 88]);
console.log(calificaciones.avg()); // 86.6

// Con objetos y clave
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

console.log(productos.avg('precio')); // 90

// Con función callback
const estudiantes = new Collection([
  { id: 1, nombre: 'Ana', notas: [85, 90, 78] },
  { id: 2, nombre: 'Carlos', notas: [92, 88, 95] },
  { id: 3, nombre: 'Elena', notas: [75, 80, 85] }
]);

// Promedio de los promedios individuales
const promedioClase = estudiantes.avg(e => {
  const sumaNotas = e.notas.reduce((sum, nota) => sum + nota, 0);
  return sumaNotas / e.notas.length;
});

console.log(promedioClase); // 85.33...
```

## min

Encuentra el valor mínimo en la colección.

### Firmas

```ts
// Para colecciones de números
min(): number | undefined

// Para colecciones de objetos, con clave
min<K extends string>(key: K): T[K] | undefined

// Para colecciones de objetos, con función callback
min<U>(callback: (item: T, index: number) => U): U | undefined
```

### Ejemplos

```ts
// Con números
const numeros = new Collection([5, 3, 9, 1, 7]);
console.log(numeros.min()); // 1

// Con objetos y clave
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

console.log(productos.min('precio')); // 20

// Con función callback
const estudiantes = new Collection([
  { id: 1, nombre: 'Ana', edad: 22, promedio: 8.5 },
  { id: 2, nombre: 'Carlos', edad: 25, promedio: 9.2 },
  { id: 3, nombre: 'Elena', edad: 21, promedio: 7.8 }
]);

const menorPromedio = estudiantes.min(e => e.promedio);
console.log(menorPromedio); // 7.8
```

## max

Encuentra el valor máximo en la colección.

### Firmas

```ts
// Para colecciones de números
max(): number | undefined

// Para colecciones de objetos, con clave
max<K extends string>(key: K): T[K] | undefined

// Para colecciones de objetos, con función callback
max<U>(callback: (item: T, index: number) => U): U | undefined
```

### Ejemplos

```ts
// Con números
const numeros = new Collection([5, 3, 9, 1, 7]);
console.log(numeros.max()); // 9

// Con objetos y clave
const productos = new Collection([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
  { id: 3, nombre: 'Monitor', precio: 200 }
]);

console.log(productos.max('precio')); // 200

// Con función callback
const estudiantes = new Collection([
  { id: 1, nombre: 'Ana', edad: 22, promedio: 8.5 },
  { id: 2, nombre: 'Carlos', edad: 25, promedio: 9.2 },
  { id: 3, nombre: 'Elena', edad: 21, promedio: 7.8 }
]);

const mayorEdad = estudiantes.max(e => e.edad);
console.log(mayorEdad); // 25
```
