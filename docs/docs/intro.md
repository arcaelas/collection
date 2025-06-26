# Introducción a Arcaelas Collection

Bienvenido a la documentación de Arcaelas Collection, una biblioteca de utilidades para manipulación de colecciones en JavaScript/TypeScript.

## Características principales

- Filtrado y búsqueda avanzada
- Transformación de datos
- Agrupación y conteo
- Utilidades para manipulación de colecciones

## Guía de inicio rápido

```typescript
import { Collection } from '@arcaelas/collection';

// Crear una colección
const users = new Collection([
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'admin' }
]);

// Filtrar usuarios administradores
const admins = users.where('role', 'admin').get();
```

## Instalación

```bash
yarn add @arcaelas/collection
# o
npm install @arcaelas/collection
```

## Documentación de la API

Explora la documentación completa de la API para conocer todas las funcionalidades disponibles.

- [Filtrado y búsqueda](/docs/api/filtrado-busqueda)
- [Transformación y mapeo](/docs/api/transformacion-mapeo)
- [Agrupación y conteo](/docs/api/agrupacion-conteo)
- [Manipulación de elementos](/docs/api/manipulacion-elementos)
- [Utilidades](/docs/api/utilidades)
