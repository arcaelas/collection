---
sidebar_position: 1
slug: /
---

# Arcaelas Collection

`Arcaelas Collection` es una librería **minimalista** y **compacta** para la administración de colecciones locales en JavaScript/TypeScript.

## Características clave

- **Ligera**: tamaño reducido (&lt;10&nbsp;KB&nbsp;min+gzip).
- **API fluida** inspirada en consultas de bases de datos (MongoDB-like).
- **Tipado estricto** (TypeScript) y sin errores silenciosos.
- **Compatibilidad total** con Node.js ≥ 14 y todos los navegadores modernos.
- **Sin dependencias pesadas**: solo utilidades internas optimizadas.
- **Manejo de errores controlado** para operaciones de filtrado, mapeo y actualización.

## Instalación

```bash
# Yarn
yarn add @arcaelas/collection

# npm
npm install @arcaelas/collection
```

## Importación

```ts
// ESM
import { Collection } from '@arcaelas/collection';

// CommonJS
const { Collection } = require('@arcaelas/collection');
```

## Ejemplo rápido

```ts
import { Collection } from '@arcaelas/collection';

type Producto = { id: number; nombre: string; precio: number };

const productos = new Collection<Producto>([
  { id: 1, nombre: 'Mouse', precio: 20 },
  { id: 2, nombre: 'Teclado', precio: 50 },
]);

// Filtrar y obtener el primer elemento que cumpla la condición
const barato = productos.where('precio', '<', 30).first();
console.log(barato?.nombre); // ➜ 'Mouse'

// Agrupar y contar
const conteoPorPrecio = productos.countBy(p => p.precio > 30 ? 'caro' : 'barato');
console.log(conteoPorPrecio); // ➜ { barato: 1, caro: 1 }
```

## Comparación con Array nativo

`Collection` extiende la clase nativa `Array`, por lo que hereda todos sus métodos y propiedades, pero añade funcionalidades avanzadas para manipulación de datos:

| Operación | Array nativo | Arcaelas Collection |
|-----------|--------------|---------------------|
| Filtrado simple | `array.filter(x => x.prop === value)` | `collection.where('prop', value)` |
| Filtrado con operadores | `array.filter(x => x.prop > value)` | `collection.where('prop', '>', value)` |
| Búsqueda | `array.find(x => x.prop === value)` | `collection.first('prop', value)` |
| Agrupación | Requiere código personalizado | `collection.groupBy('prop')` |
| Transformación | `array.map(fn)` | `collection.map(fn)` (preserva instancia) |
| Encadenamiento | Limitado | Fluido y expresivo |

## Próximos pasos

Explora las siguientes secciones para conocer en detalle la API y casos de uso avanzados.
