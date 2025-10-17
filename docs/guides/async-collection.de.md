# AsyncCollection Anleitung

Willkommen zur AsyncCollection-Anleitung! Diese Anleitung stellt das verzögerte Query-Builder-Muster vor, um Abstraktionen über beliebige Datenquellen zu erstellen, einschließlich ORMs, REST-APIs, GraphQL und mehr.

## Was ist AsyncCollection?

AsyncCollection implementiert ein Query-Builder-Muster, das einen "Abfrageplan" (Array von Operationen) erstellt, der ausgeführt wird, wenn die Promise aufgelöst wird. Dies ermöglicht die Erstellung leistungsstarker Abstraktionen über jede Datenquelle durch Transformation der Operationen in das von Ihrem ORM oder Ihrer API benötigte spezifische Format.

### Hauptmerkmale

- **Verzögerte Ausführung**: Operationen werden registriert, aber nicht ausgeführt, bis Sie await verwenden oder `.then()` aufrufen
- **ORM-Agnostisch**: Funktioniert mit Prisma, TypeORM, Sequelize, Mongoose oder jeder Datenquelle
- **Typsicher**: Vollständige TypeScript-Unterstützung mit Generics
- **Verkettbar**: Fließende Schnittstelle zum Erstellen komplexer Abfragen
- **Flexibel**: Transformiert Operationen, um sie an das Format Ihrer Datenquelle anzupassen

## Wann AsyncCollection verwenden

Verwenden Sie AsyncCollection, wenn Sie:

- Abstraktionen über Datenbank-ORMs erstellen müssen
- Wiederverwendbare Abfrageschnittstellen für REST-APIs erstellen
- Benutzerdefinierte Datenzugriffsschichten implementieren
- Verschiedene Datenquellen unter einer gemeinsamen Schnittstelle vereinheitlichen
- Die Abfrageausführung verzögern möchten, bis alle Filter angewendet wurden

## Grundkonzepte

### Die Executor-Funktion

Der Executor ist der Kern von AsyncCollection. Er erhält einen Kontext mit allen Operationen und gibt die Ergebnisse zurück:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

const executor = async ({ operations, validators, metadata }) => {
  // operations: Array von [methodenname, ...args]
  // validators: Benutzerdefinierte Validatoren (optional)
  // metadata: Abfrageinformationen (created_at, operation_count, chain_depth)

  console.log(`Verarbeite ${metadata.operation_count} Operationen`);

  // Transformiere Operationen in Ihr Format
  // Führe Abfrage aus
  // Gib Ergebnisse zurück

  return results;
};

const collection = new AsyncCollection(executor);
```

### Operationsregistrierung

Wenn Sie Methoden verketten, werden sie als Operationen registriert:

```typescript
const users = new AsyncCollection(executor);

// Diese registrieren Operationen, aber führen sie NOCH NICHT aus
users
  .where('age', '>=', 18)
  .where('status', 'active')
  .sort('name', 'asc');

// Die Ausführung erfolgt hier (wenn die Promise aufgelöst wird)
const results = await users;
```

### ExecutorContext

Der an Ihren Executor übergebene Kontext enthält:

```typescript
interface ExecutorContext<T, V> {
  // Array von Operationen: [methodenname, ...args]
  operations: [string, ...any[]][];

  // Benutzerdefinierte Validatoren für query()
  validators?: V;

  // Metadata über die Abfrage
  metadata: {
    created_at: Date;
    operation_count: number;
    chain_depth: number;
  };
}
```

## Einfaches Beispiel: In-Memory-Array

Beginnen wir mit einem einfachen Beispiel mit einem In-Memory-Array:

```typescript
import AsyncCollection from "@arcaelas/collection/async";

// In-Memory-Daten
const data = [
  { id: 1, name: "Alice", age: 25, status: "active" },
  { id: 2, name: "Bob", age: 30, status: "inactive" },
  { id: 3, name: "Charlie", age: 35, status: "active" }
];

// Einfacher Executor
const users = new AsyncCollection(async ({ operations }) => {
  let results = [...data];

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      results = results.filter(item => {
        if (operator === '>=') return item[key] >= value;
        if (operator === '=') return item[key] === value;
        return true;
      });
    }

    if (method === 'first') {
      results = [results[0]];
    }
  });

  return results;
});

// Verwenden Sie es
const active = await users.where('status', 'active');
// [{ id: 1, ... }, { id: 3, ... }]

const firstAdult = await users.where('age', '>=', 25).first();
// { id: 1, name: "Alice", ... }
```

## Arbeiten mit Prisma

Transformieren Sie Operationen in Prisma-Abfragen:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = new AsyncCollection(async ({ operations }) => {
  const where: any = {};
  let orderBy: any = undefined;
  let take: number | undefined;

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      if (operator === '>=') where[key] = { gte: value };
      else if (operator === '>') where[key] = { gt: value };
      else if (operator === '=') where[key] = value;
    }

    if (method === 'sort') {
      const [key, direction] = args;
      orderBy = { [key]: direction || 'asc' };
    }
  });

  const lastOp = operations[operations.length - 1];
  if (lastOp && lastOp[0] === 'first') {
    return await prisma.user.findFirst({ where, orderBy });
  }

  return await prisma.user.findMany({ where, orderBy, take });
});

// Verwenden wie Collection
const active = await users
  .where('age', '>=', 18)
  .where('verified', true)
  .sort('createdAt', 'desc');

const firstUser = await users
  .where('status', 'active')
  .first();
```

## Arbeiten mit TypeORM

Erstellen Sie TypeORM QueryBuilder aus Operationen:

```typescript
import AsyncCollection from "@arcaelas/collection/async";
import { getRepository } from "typeorm";
import { User } from "./entities/User";

const users = new AsyncCollection(async ({ operations }) => {
  const qb = getRepository(User).createQueryBuilder('user');

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, operator, value] = args.length === 3
        ? args
        : [args[0], '=', args[1]];

      const paramKey = `${key}_${Math.random()}`;

      if (operator === '>=') {
        qb.andWhere(`user.${key} >= :${paramKey}`, { [paramKey]: value });
      } else if (operator === '=') {
        qb.andWhere(`user.${key} = :${paramKey}`, { [paramKey]: value });
      }
    }

    if (method === 'sort') {
      const [key, direction] = args;
      qb.orderBy(`user.${key}`, direction?.toUpperCase() || 'ASC');
    }
  });

  const lastOp = operations[operations.length - 1];
  if (lastOp && lastOp[0] === 'first') {
    return await qb.getOne();
  }

  return await qb.getMany();
});

// Verketten Sie Operationen
const result = await users
  .where('age', '>=', 21)
  .where('status', 'active')
  .sort('name', 'asc');
```

## Benutzerdefinierte Validatoren

Erweitern Sie die Abfragefähigkeiten mit benutzerdefinierten Validatoren:

```typescript
const customValidators = {
  // Prüft, ob das Datum in der Vergangenheit liegt
  $isPast(ref: string, value: boolean) {
    return (item: any) => {
      const date = new Date(item[ref]);
      const isPast = date < new Date();
      return value ? isPast : !isPast;
    };
  },

  // Prüft, ob der Wert im Bereich liegt
  $between(ref: string, range: [number, number]) {
    return (item: any) => {
      const val = item[ref];
      return val >= range[0] && val <= range[1];
    };
  }
};

const items = new AsyncCollection(
  async ({ operations, validators }) => {
    // Verwenden Sie Validatoren zur Verarbeitung von Operationen
    // Transformieren Sie zum Format Ihrer Datenquelle
    return processData(operations, validators);
  },
  customValidators
);

// Verwenden Sie benutzerdefinierte Validatoren
await items.filter({
  eventDate: { $isPast: true },
  score: { $between: [50, 100] }
});
```

## Methodenverkettung

Verketten Sie mehrere Operationen fließend:

```typescript
const users = new AsyncCollection(executor);

const result = await users
  .where('age', '>=', 18)
  .where('status', 'active')
  .not({ deleted: true })
  .sort('createdAt', 'desc')
  .slice(0, 10)
  .map(user => ({
    id: user.id,
    name: user.name,
    displayName: `${user.name} (${user.age})`
  }));
```

## Unterstützte Operationen

AsyncCollection unterstützt alle Collection-Methoden:

### Filtern
- `where(key, value)` oder `where(key, operator, value)`
- `whereNot(key, value)` oder `whereNot(key, operator, value)`
- `filter(handler)` - Funktion oder Abfrageobjekt
- `not(handler)` - Inverser Filter

### Suchen
- `first(handler?)` - Erstes passendes Element
- `last(handler?)` - Letztes passendes Element
- `find(handler)` - Alias für first

### Transformation
- `map(handler)` - Transformiert Elemente
- `each(handler)` - Iteriert Elemente
- `forget(...keys)` - Entfernt Felder

### Sortierung
- `sort(key, direction)` oder `sort(compareFunction)`
- `reverse()` - Umgekehrte Reihenfolge
- `shuffle()` - Zufällige Reihenfolge

### Slicing & Paginierung
- `slice(start, end?)` - Array-Slice
- `chunk(size)` - In Blöcke aufteilen
- `paginate(page, perPage)` - Paginiert Ergebnisse

### Aggregation
- `sum(key)` - Summiert Werte
- `max(key)` - Maximalwert
- `min(key)` - Minimalwert
- `groupBy(key)` - Gruppiert nach Schlüssel
- `countBy(key)` - Zählt nach Schlüssel

### Hilfsprogramme
- `unique(key)` - Eindeutige Elemente
- `random(count?)` - Zufällige Elemente
- `every(handler)` - Validiert alle
- `collect(items?)` - Klont Kontext

### Debugging
- `dump()` - In Konsole ausgeben
- `dd()` - Dump and die (Node.js)
- `stringify(replacer?, space?)` - In JSON konvertieren

## Fehlerbehandlung

Behandeln Sie Fehler in Ihrem Executor:

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  try {
    // Erstelle und führe Abfrage aus
    const results = await executeQuery(operations);
    return results;
  } catch (error) {
    console.error('Abfrage fehlgeschlagen:', error);
    throw new Error(`Benutzer konnten nicht abgerufen werden: ${error.message}`);
  }
});

// Behandle Fehler beim Awaiten
try {
  const results = await users.where('age', '>=', 18);
} catch (error) {
  console.error('Fehler:', error);
}

// Oder mit .catch()
users
  .where('age', '>=', 18)
  .then(results => console.log(results))
  .catch(error => console.error(error));
```

## Best Practices

### 1. Validieren Sie Operationen

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  // Validiere Operationen vor der Ausführung
  const hasInvalidOp = operations.some(([method]) =>
    !['where', 'sort', 'first'].includes(method)
  );

  if (hasInvalidOp) {
    throw new Error('Nicht unterstützte Operation');
  }

  return processOperations(operations);
});
```

### 2. Behandeln Sie Terminaloperationen

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  const lastOp = operations[operations.length - 1];

  // Prüfe auf Terminaloperationen
  if (lastOp && lastOp[0] === 'first') {
    return await findFirst(operations.slice(0, -1));
  }

  if (lastOp && lastOp[0] === 'last') {
    return await findLast(operations.slice(0, -1));
  }

  return await findMany(operations);
});
```

### 3. Optimieren Sie die Abfrageerstellung

```typescript
const users = new AsyncCollection(async ({ operations }) => {
  // Gruppiere Operationen nach Typ für effiziente Verarbeitung
  const where_ops = operations.filter(([m]) => m === 'where');
  const sort_ops = operations.filter(([m]) => m === 'sort');

  // Erstelle optimierte Abfrage
  const query = buildQuery({ where_ops, sort_ops });

  return await executeQuery(query);
});
```

## Nächste Schritte

- Siehe [API-Referenz](../api/async-collection-class.md) für vollständige Methodendokumentation
- Siehe [Verwendungsbeispiele](../examples/async-collection-usage.md) für reale Muster
- Erfahren Sie mehr über [TypeScript-Verwendung](../advanced/typescript-usage.md) für Typsicherheit

## Häufige Muster

### REST-API-Wrapper

```typescript
const api = new AsyncCollection(async ({ operations }) => {
  const params = new URLSearchParams();

  operations.forEach(([method, ...args]) => {
    if (method === 'where') {
      const [key, value] = args.length === 2 ? args : [args[0], args[2]];
      params.append(key, value);
    }
  });

  const response = await fetch(`/api/users?${params}`);
  return await response.json();
});

const users = await api.where('status', 'active');
```

### GraphQL-Builder

```typescript
const gql = new AsyncCollection(async ({ operations }) => {
  const filters = operations
    .filter(([m]) => m === 'where')
    .map(([_, key, value]) => `${key}: "${value}"`);

  const query = `
    query {
      users(where: { ${filters.join(', ')} }) {
        id name email
      }
    }
  `;

  const response = await graphqlClient.query(query);
  return response.data.users;
});
```

## Tipps

1. **Halten Sie Executors fokussiert** - Eine Verantwortung pro AsyncCollection
2. **Validieren Sie Operationen** - Lehnen Sie nicht unterstützte Operationen früh ab
3. **Behandeln Sie Grenzfälle** - Prüfen Sie auf Terminaloperationen wie first/last
4. **Typisieren Sie alles** - Verwenden Sie TypeScript-Generics für Typsicherheit
5. **Testen Sie gründlich** - Unit-Tests Ihres Executors mit verschiedenen Operationsketten
