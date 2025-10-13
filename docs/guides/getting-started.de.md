# Erste Schritte

Willkommen zum Leitfaden für die ersten Schritte mit `@arcaelas/collection`!

## Ihre Erste Collection

```typescript
import Collection from "@arcaelas/collection";

const numbers = new Collection([1, 2, 3, 4, 5]);
```

## Grundlegende Filterung

```typescript
const activeUsers = users.filter({ active: true });
const adults = users.filter({ age: { $gt: 25 } });
```

Lesen Sie weiter in [Grundkonzepte](core-concepts.de.md).
