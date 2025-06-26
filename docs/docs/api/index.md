---
sidebar_position: 1
---

# Referencia de API

Esta sección contiene la documentación detallada de la API de Arcaelas Collection, incluyendo todos los métodos disponibles, sus parámetros, tipos de retorno y ejemplos de uso.

## Estructura general

La librería `@arcaelas/collection` exporta principalmente la clase `Collection<T>`, que extiende el tipo nativo `Array<T>` de JavaScript.

```ts
import { Collection } from '@arcaelas/collection';

// También se exportan tipos y enumerados útiles
import { alias, Operator } from '@arcaelas/collection';
```

## Clase Collection

### Constructor

```ts
constructor(items?: Collection<T> | T | T[], validator: V = {} as any)
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `items` | `Collection<T> \| T \| T[]` | Elementos iniciales (opcional) |
| `validator` | `V` | Validador para consultas (opcional) |

**Ejemplo:**

```ts
// Colección vacía
const vacia = new Collection();

// Desde array
const numeros = new Collection([1, 2, 3]);

// Desde objeto único
const objetoUnico = new Collection({ id: 1, nombre: 'Ejemplo' });
```

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `length` | `number` | Número de elementos en la colección |
| `query` | `Function` | Manejador de consultas interno |

## Métodos principales

La clase Collection incluye todos los métodos nativos de Array más métodos adicionales para manipulación avanzada de colecciones. Los métodos se agrupan en las siguientes categorías:

1. [Filtrado y búsqueda](./filtrado-busqueda.md)
2. [Transformación y mapeo](./transformacion-mapeo.md)
3. [Agrupación y conteo](./agrupacion-conteo.md)
4. [Manipulación de elementos](./manipulacion-elementos.md)
5. [Utilidades](./utilidades.md)

Consulta cada sección para obtener detalles específicos sobre los métodos disponibles en cada categoría.
