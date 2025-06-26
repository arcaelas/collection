---
slug: introduccion-arcaelas-collection
title: Introducción a Arcaelas Collection
authors: [miguel]
tags: [colección, introducción, typescript]
---

# Introducción a Arcaelas Collection

Arcaelas Collection es una librería TypeScript moderna para manipulación de colecciones de datos con una API fluida y expresiva, diseñada para ofrecer un manejo eficiente de datos en aplicaciones JavaScript/TypeScript.

<!-- truncate -->

## ¿Por qué Arcaelas Collection?

Trabajar con colecciones de datos es una tarea común en el desarrollo de aplicaciones. Ya sea que estés filtrando registros de usuarios, transformando resultados de una API o manipulando estructuras de datos complejas, necesitas herramientas que simplifiquen estas operaciones.

Aunque JavaScript ofrece métodos nativos como `map`, `filter` y `reduce`, Arcaelas Collection proporciona una experiencia más rica y fluida con operaciones encadenables, consultas avanzadas y tipado fuerte.

## Características principales

1. **API fluida y expresiva**: Encadena múltiples operaciones para transformaciones complejas.
2. **Tipado fuerte**: Desarrollada completamente en TypeScript para ofrecer autocompletado y detección temprana de errores.
3. **Rendimiento optimizado**: Diseñada para manejar grandes conjuntos de datos con eficiencia.
4. **Consultas avanzadas**: Filtra y busca datos con condiciones complejas usando un sistema de consultas intuitivo.

## Instalación

```bash
npm install @arcaelas/collection
# o usando yarn
yarn add @arcaelas/collection
```

## Ejemplo básico

```typescript
import { Collection } from '@arcaelas/collection';

// Crear una colección de usuarios
const usuarios = new Collection([
  { id: 1, nombre: 'Ana', edad: 28, activo: true },
  { id: 2, nombre: 'Carlos', edad: 35, activo: false },
  { id: 3, nombre: 'Elena', edad: 23, activo: true },
  { id: 4, nombre: 'David', edad: 42, activo: true }
]);

// Filtrar usuarios activos y menores de 30 años
const jovenes_activos = usuarios
  .where({ activo: true })
  .where(usuario => usuario.edad < 30)
  .sortBy('edad');

console.log(jovenes_activos);
// Output: [{ id: 3, nombre: 'Elena'... }, { id: 1, nombre: 'Ana'... }]
```

En próximos artículos exploraremos más a fondo las capacidades de Arcaelas Collection y cómo puede ayudarte a escribir código más limpio y mantenible para el manejo de datos.
