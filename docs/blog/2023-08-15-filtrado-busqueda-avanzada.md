---
slug: filtrado-busqueda-avanzada
title: Filtrado y búsqueda avanzada con Arcaelas Collection
authors: [miguel]
tags: [colección, filtrado, búsqueda, typescript]
---

# Filtrado y búsqueda avanzada con Arcaelas Collection

Una de las operaciones más comunes al trabajar con colecciones de datos es filtrar y buscar elementos según criterios específicos. Arcaelas Collection proporciona un potente sistema de filtrado que simplifica enormemente estas tareas.

<!-- truncate -->

## Métodos de filtrado en Arcaelas Collection

La librería ofrece varios métodos para filtrar y buscar elementos, cada uno con diferentes capacidades y casos de uso:

### El método `where()`

Este método es la base del sistema de filtrado y permite realizar consultas complejas con una sintaxis clara y expresiva:

```typescript
import { Collection } from '@arcaelas/collection';

const productos = new Collection([
  { id: 1, nombre: 'Laptop', precio: 1200, disponible: true, categoría: 'Electrónica' },
  { id: 2, nombre: 'Teléfono', precio: 800, disponible: true, categoría: 'Electrónica' },
  { id: 3, nombre: 'Mesa', precio: 350, disponible: false, categoría: 'Muebles' },
  { id: 4, nombre: 'Silla', precio: 150, disponible: true, categoría: 'Muebles' }
]);

// Filtrar productos disponibles
const disponibles = productos.where({ disponible: true });

// Filtrar por precio mayor a 500
const premium = productos.where(item => item.precio > 500);

// Combinación de filtros
const electrónicos_disponibles = productos
  .where({ categoría: 'Electrónica' })
  .where({ disponible: true });
```

### Operadores de comparación

Arcaelas Collection soporta operadores avanzados para consultas más expresivas:

```typescript
import { Collection, Operator } from '@arcaelas/collection';

// Productos con precio entre 300 y 1000
const rango_medio = productos.where({
  precio: { [Operator.BETWEEN]: [300, 1000] }
});

// Productos que contienen 'o' en el nombre
const con_o = productos.where({
  nombre: { [Operator.CONTAINS]: 'o' }
});

// Productos con id en una lista específica
const lista_ids = productos.where({
  id: { [Operator.IN]: [1, 3] }
});
```

### Métodos de búsqueda

Para encontrar elementos específicos, Arcaelas Collection ofrece varios métodos útiles:

```typescript
// Encontrar el primer producto disponible
const primer_disponible = productos.first(item => item.disponible);

// Encontrar por ID
const producto_id_2 = productos.find(item => item.id === 2);

// Comprobar si existe algún producto de muebles
const hay_muebles = productos.some(item => item.categoría === 'Muebles');

// Comprobar si todos los productos cuestan más de 100
const todos_caros = productos.every(item => item.precio > 100);
```

## Encadenamiento de operaciones

Una de las grandes ventajas de Arcaelas Collection es la capacidad de encadenar operaciones para crear flujos de procesamiento de datos complejos:

```typescript
// Filtrar, ordenar y limitar
const top_electronica = productos
  .where({ categoría: 'Electrónica' })
  .where({ disponible: true })
  .sortBy('precio', 'desc')
  .take(2);
```

## Rendimiento optimizado

El sistema de filtrado de Arcaelas Collection está optimizado para manejar grandes colecciones de datos, implementando estrategias internas para minimizar el recorrido de elementos y maximizar la eficiencia de las consultas.

En nuestro próximo artículo, exploraremos las capacidades de transformación y mapeo de datos que ofrece Arcaelas Collection para procesar y modificar colecciones.
