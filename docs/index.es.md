# Bienvenido a @arcaelas/collection

<div align="center">
  <img src="https://raw.githubusercontent.com/arcaelas/dist/main/logo/svg/64.svg" height="64px" alt="Logo de Arcaelas">

  **Una potente biblioteca de colecciones TypeScript con DSL de consultas similar a MongoDB**

  [![versión npm](https://img.shields.io/npm/v/@arcaelas/collection.svg)](https://www.npmjs.com/package/@arcaelas/collection)
  [![Licencia](https://img.shields.io/npm/l/@arcaelas/collection.svg)](https://github.com/arcaelas/collection/blob/main/LICENSE)
  [![Estrellas GitHub](https://img.shields.io/github/stars/arcaelas/collection.svg)](https://github.com/arcaelas/collection)
</div>

## Descripción General

`@arcaelas/collection` es una biblioteca de utilidades completa que extiende los arrays nativos de JavaScript con potentes capacidades de filtrado, consulta y transformación. Inspirada en las Colecciones de Laravel y el lenguaje de consultas de MongoDB, proporciona una API elegante y type-safe para trabajar con colecciones de datos.

## Características Principales

- **DSL de Consultas Similar a MongoDB** - Sintaxis de consulta intuitiva con operadores como `$eq`, `$gt`, `$in`, `$contains`, y más
- **TypeScript Type-Safe** - Soporte completo de TypeScript con tipos genéricos para autocompletado y verificación de tipos
- **API Rica** - Más de 30 métodos integrados para filtrar, transformar y agregar datos
- **Encadenamiento de Métodos** - Interfaz fluida para componer operaciones complejas
- **Extensible** - Agregue métodos personalizados con macros
- **Sin Dependencias** - Ligero con dependencias externas mínimas
- **Optimizado para Rendimiento** - Compilación eficiente de consultas y delegación de arrays nativos

## Inicio Rápido

### Instalación

```bash
npm install @arcaelas/collection
# o
yarn add @arcaelas/collection
```

### Uso Básico

```typescript
import Collection from "@arcaelas/collection";

const users = new Collection([
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Charlie", age: 35, active: true }
]);

// Filtrar con consultas similares a MongoDB
const activeUsers = users.filter({ active: true });

// Filtrar con operadores de consulta
const adults = users.filter({ age: { $gte: 18 } });

// Encadenar métodos
const result = users
  .filter({ active: true })
  .where("age", ">=", 25)
  .sort("age", "desc")
  .first();

console.log(result); // { name: "Charlie", age: 35, active: true }
```

## ¿Por qué @arcaelas/collection?

### Problema

Los arrays nativos de JavaScript tienen funcionalidad limitada para operaciones de datos complejas:

```javascript
// Enfoque nativo - verboso y propenso a errores
const activeUsers = users.filter(user => user.active);
const adults = users.filter(user => user.age >= 18);
const sorted = users.sort((a, b) => b.age - a.age);
```

### Solución

Collection proporciona una API elegante y encadenable:

```typescript
// Enfoque con Collection - limpio y expresivo
const result = collection
  .filter({ active: true, age: { $gte: 18 } })
  .sort("age", "desc");
```

## Conceptos Básicos

### Operadores de Consulta

Use operadores estilo MongoDB para consultas potentes:

```typescript
collection.filter({
  age: { $gte: 18, $lt: 65 },
  name: { $regex: /^A/ },
  skills: { $contains: "TypeScript" },
  role: { $in: ["admin", "moderator"] }
});
```

### Encadenamiento de Métodos

Componga operaciones complejas con sintaxis fluida:

```typescript
collection
  .where("verified", true)
  .whereNot("banned", true)
  .sort("created_at", "desc")
  .paginate(1, 20);
```

### Seguridad de Tipos

Aproveche TypeScript para seguridad en tiempo de compilación:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users = new Collection<User>([...]);

// TypeScript conoce la forma
users.first()?.email; // string | undefined
```

## Casos de Uso

### Filtrado de Datos

```typescript
const products = new Collection(inventory);

const available = products.filter({
  stock: { $gt: 0 },
  price: { $lte: 100 },
  category: { $in: ["electronics", "gadgets"] }
});
```

### Agregación

```typescript
const orders = new Collection(orderData);

const totalRevenue = orders.sum("total");
const avgOrderValue = orders.sum("total") / orders.length;
const ordersByStatus = orders.groupBy("status");
```

### Transformación de Datos

```typescript
const users = new Collection(userData);

const sanitized = users
  .forget("password", "token")
  .unique("email")
  .sort("created_at", "desc");
```

## ¿Qué Sigue?

<div class="grid cards" markdown>

- :material-rocket-launch: **[Primeros Pasos](guides/getting-started.es.md)**

    Aprenda los conceptos básicos y cree su primera colección

- :material-book-open-variant: **[Conceptos Básicos](guides/core-concepts.es.md)**

    Comprenda los principios y patrones fundamentales

- :material-filter: **[Operadores de Consulta](guides/query-operators.es.md)**

    Domine la sintaxis de consulta similar a MongoDB

- :material-api: **[Referencia de API](api/collection-class.es.md)**

    Explore todos los métodos y firmas disponibles

- :material-code-braces: **[Ejemplos](examples/basic-usage.es.md)**

    Vea ejemplos prácticos y patrones comunes

- :material-rocket: **[Avanzado](advanced/performance.es.md)**

    Consejos de rendimiento y técnicas avanzadas

</div>

## Comunidad y Soporte

- **GitHub**: [arcaelas/collection](https://github.com/arcaelas/collection)
- **Issues**: [Reportar errores o solicitar funciones](https://github.com/arcaelas/collection/issues)
- **Twitter**: [@arcaelas](https://twitter.com/arcaelas)
- **Email**: [community@arcaelas.com](mailto:community@arcaelas.com)

## Licencia

MIT © 2025 Arcaelas Insiders

---

<div align="center">
  <p>
    <strong>Construido con ❤️ por el equipo de Arcaelas Insiders</strong>
  </p>
  <p>
    ¿Quiere discutir alguno de nuestros proyectos de código abierto? Envíenos un mensaje en
    <a href="https://twitter.com/arcaelas">Twitter</a> o patrocínenos en
    <a href="https://github.com/sponsors/arcaelas">GitHub Sponsors</a>.
  </p>
</div>
