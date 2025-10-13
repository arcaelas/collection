# Primeros Pasos

Bienvenido a la guía de primeros pasos para `@arcaelas/collection`!

## Tu Primera Colección

```typescript
import Collection from "@arcaelas/collection";

const numbers = new Collection([1, 2, 3, 4, 5]);
```

## Filtrado Básico

```typescript
const activeUsers = users.filter({ active: true });
const adults = users.filter({ age: { $gt: 25 } });
```

Continúa leyendo en [Conceptos Básicos](core-concepts.es.md).
