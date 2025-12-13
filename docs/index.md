# Welcome to @arcaelas/collection

<div align="center">
  <img src="https://raw.githubusercontent.com/arcaelas/dist/main/logo/svg/64.svg" height="64px" alt="Arcaelas Logo">

  **A powerful TypeScript collection library with MongoDB-like query DSL**

  [![npm version](https://img.shields.io/npm/v/@arcaelas/collection.svg)](https://www.npmjs.com/package/@arcaelas/collection)
  [![License](https://img.shields.io/npm/l/@arcaelas/collection.svg)](https://github.com/arcaelas/collection/blob/main/LICENSE)
  [![GitHub stars](https://img.shields.io/github/stars/arcaelas/collection.svg)](https://github.com/arcaelas/collection)
</div>

## Overview

`@arcaelas/collection` is a comprehensive utility library that extends native JavaScript arrays with powerful filtering, querying, and transformation capabilities. Inspired by Laravel's Collections and MongoDB's query language, it provides an elegant and type-safe API for working with data collections.

## Key Features

- **MongoDB-like Query DSL** - Intuitive query syntax with operators like `$eq`, `$gt`, `$in`, `$contains`, and more
- **Type-Safe TypeScript** - Full TypeScript support with generic types for autocompletion and type checking
- **Rich API** - Over 30 built-in methods for filtering, transforming, and aggregating data
- **Method Chaining** - Fluent interface for composing complex operations
- **Extensible** - Add custom methods with macros
- **Zero Dependencies** - Lightweight with minimal external dependencies
- **Performance Optimized** - Efficient query compilation and native array delegation

## Quick Start

### Installation

```bash
npm install @arcaelas/collection
# or
yarn add @arcaelas/collection
```

### Basic Usage

```typescript
import Collection from "@arcaelas/collection";

const users = new Collection([
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Charlie", age: 35, active: true }
]);

// Filter with MongoDB-like queries
const activeUsers = users.filter({ active: true });

// Filter with query operators
const adults = users.filter({ age: { $gte: 18 } });

// Chain methods
const result = users
  .filter({ active: true })
  .where("age", ">=", 25)
  .sort("age", "desc")
  .first();

console.log(result); // { name: "Charlie", age: 35, active: true }
```

## Why @arcaelas/collection?

### Problem

Native JavaScript arrays have limited functionality for complex data operations:

```javascript
// Native approach - verbose and error-prone
const activeUsers = users.filter(user => user.active);
const adults = users.filter(user => user.age >= 18);
const sorted = users.sort((a, b) => b.age - a.age);
```

### Solution

Collection provides an elegant, chainable API:

```typescript
// Collection approach - clean and expressive
const result = collection
  .filter({ active: true, age: { $gte: 18 } })
  .sort("age", "desc");
```

## Core Concepts

### Query Operators

Use MongoDB-style operators for powerful queries:

```typescript
collection.filter({
  age: { $gte: 18, $lt: 65 },
  name: { $regex: /^A/ },
  skills: { $contains: "TypeScript" },
  role: { $in: ["admin", "moderator"] }
});
```

### Method Chaining

Compose complex operations with fluent syntax:

```typescript
collection
  .where("verified", true)
  .whereNot("banned", true)
  .sort("created_at", "desc")
  .paginate(1, 20);
```

### Type Safety

Leverage TypeScript for compile-time safety:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users = new Collection<User>([...]);

// TypeScript knows the shape
users.first()?.email; // string | undefined
```

## Use Cases

### Data Filtering

```typescript
const products = new Collection(inventory);

const available = products.filter({
  stock: { $gt: 0 },
  price: { $lte: 100 },
  category: { $in: ["electronics", "gadgets"] }
});
```

### Aggregation

```typescript
const orders = new Collection(orderData);

const totalRevenue = orders.sum("total");
const avgOrderValue = orders.sum("total") / orders.length;
const ordersByStatus = orders.groupBy("status");
```

### Data Transformation

```typescript
const users = new Collection(userData);

const sanitized = users
  .forget("password", "token")
  .unique("email")
  .sort("created_at", "desc");
```

## What's Next?

<div class="grid cards" markdown>

- :material-rocket-launch: **[Getting Started](guides/getting-started.md)**

    Learn the basics and create your first collection

- :material-book-open-variant: **[Core Concepts](guides/core-concepts.md)**

    Understand the fundamental principles and patterns

- :material-filter: **[Query Operators](guides/query-operators.md)**

    Master the MongoDB-like query syntax

- :material-api: **[API Reference](api/collection-class.md)**

    Explore all available methods and signatures

- :material-code-braces: **[Examples](examples/basic-usage.md)**

    See practical examples and common patterns

- :material-rocket: **[Advanced](advanced/performance.md)**

    Performance tips and advanced techniques

</div>

## Community & Support

- **GitHub**: [arcaelas/collection](https://github.com/arcaelas/collection)
- **Issues**: [Report bugs or request features](https://github.com/arcaelas/collection/issues)
- **Twitter**: [@arcaelas](https://twitter.com/arcaelas)
- **Email**: [community@arcaelas.com](mailto:community@arcaelas.com)

## License

MIT © 2025 Arcaelas Insiders

---

<div align="center">
  <p>
    <strong>Built with ❤️ by the Arcaelas Insiders team</strong>
  </p>
  <p>
    Want to discuss any of our open source projects? Send us a message on
    <a href="https://twitter.com/arcaelas">Twitter</a> or sponsor us at
    <a href="https://github.com/sponsors/arcaelas">GitHub Sponsors</a>.
  </p>
</div>
