---
slug: transformacion-mapeo-datos
title: Transformación y mapeo de datos con Arcaelas Collection
authors: [miguel]
tags: [colección, transformación, mapeo, typescript]
---

# Transformación y mapeo de datos con Arcaelas Collection

Después de filtrar y buscar elementos en una colección, el siguiente paso común es transformar o mapear esos datos para adaptarlos a las necesidades específicas de tu aplicación. Arcaelas Collection ofrece métodos potentes que simplifican estas operaciones.

<!-- truncate -->

## Métodos de transformación

Arcaelas Collection proporciona varios métodos para transformar datos de manera eficiente:

### El método `map()`

Similar al método nativo de JavaScript pero con mejoras, permite transformar cada elemento de la colección:

```typescript
import { Collection } from '@arcaelas/collection';

const productos = new Collection([
  { id: 1, nombre: 'Laptop', precio: 1200 },
  { id: 2, nombre: 'Teléfono', precio: 800 },
  { id: 3, nombre: 'Mesa', precio: 350 }
]);

// Aplicar descuento del 10%
const con_descuento = productos.map(item => ({
  ...item,
  precio_original: item.precio,
  precio: Math.round(item.precio * 0.9),
  descuento: '10%'
}));

console.log(con_descuento[0]);
// { id: 1, nombre: 'Laptop', precio_original: 1200, precio: 1080, descuento: '10%' }
```

### El método `pluck()`

Extrae valores específicos de cada elemento para crear un nuevo array:

```typescript
// Obtener solo los nombres de los productos
const nombres = productos.pluck('nombre');
// ['Laptop', 'Teléfono', 'Mesa']

// Obtener múltiples propiedades como objetos
const resumidos = productos.pluck(['id', 'nombre']);
// [{ id: 1, nombre: 'Laptop' }, ...]
```

### Agrupación con `groupBy()`

Organiza elementos en grupos basados en una propiedad o función:

```typescript
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', rol: 'admin' },
  { id: 2, nombre: 'Carlos', rol: 'usuario' },
  { id: 3, nombre: 'Elena', rol: 'admin' },
  { id: 4, nombre: 'David', rol: 'usuario' }
]);

const por_rol = usuarios.groupBy('rol');
// {
//   admin: [{ id: 1, ... }, { id: 3, ... }],
//   usuario: [{ id: 2, ... }, { id: 4, ... }]
// }
```

## Transformaciones encadenadas

Una de las ventajas más importantes de Arcaelas Collection es la capacidad de encadenar transformaciones para crear flujos de procesamiento de datos complejos y expresivos:

```typescript
const resultado = productos
  .where(item => item.precio > 500) // Filtrar productos caros
  .map(item => ({                    // Aplicar descuento
    ...item,
    precio: Math.round(item.precio * 0.9),
  }))
  .sortBy('precio')                  // Ordenar por precio
  .pluck(['nombre', 'precio']);      // Extraer solo nombre y precio
```

## Transformaciones avanzadas

### Aplanar colecciones anidadas con `flatten()`

Si tienes colecciones dentro de colecciones, puedes aplanarlas fácilmente:

```typescript
const departamentos = new Collection([
  { nombre: 'Ventas', empleados: [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Carlos' }] },
  { nombre: 'IT', empleados: [{ id: 3, nombre: 'Elena' }, { id: 4, nombre: 'David' }] }
]);

// Extraer todos los empleados en una única colección plana
const todos_empleados = departamentos
  .pluck('empleados')
  .flatten();
```

### Transformación condicional con `when()`

Aplica transformaciones solo si se cumple una condición:

```typescript
const resultado = productos
  .when(
    condicion_externa, // Si esta condición es true
    coleccion => coleccion.where({ disponible: true }), // Aplica este filtro
    coleccion => coleccion // Si no, devuelve la colección sin cambios
  );
```

## Conclusión

Los métodos de transformación y mapeo de Arcaelas Collection permiten manipular datos de manera eficiente y expresiva, simplificando enormemente tareas comunes de procesamiento de datos. La capacidad de encadenar operaciones proporciona un flujo de trabajo fluido y mantenible.

En nuestro próximo artículo, exploraremos técnicas avanzadas para trabajar con relaciones y datos complejos usando Arcaelas Collection.
