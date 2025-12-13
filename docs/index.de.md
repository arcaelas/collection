# Willkommen bei @arcaelas/collection

<div align="center">
  <img src="https://raw.githubusercontent.com/arcaelas/dist/main/logo/svg/64.svg" height="64px" alt="Arcaelas Logo">

  **Eine leistungsstarke TypeScript-Collection-Bibliothek mit MongoDB-ähnlicher Query-DSL**

  [![npm Version](https://img.shields.io/npm/v/@arcaelas/collection.svg)](https://www.npmjs.com/package/@arcaelas/collection)
  [![Lizenz](https://img.shields.io/npm/l/@arcaelas/collection.svg)](https://github.com/arcaelas/collection/blob/main/LICENSE)
  [![GitHub Sterne](https://img.shields.io/github/stars/arcaelas/collection.svg)](https://github.com/arcaelas/collection)
</div>

## Übersicht

`@arcaelas/collection` ist eine umfassende Utility-Bibliothek, die native JavaScript-Arrays mit leistungsstarken Filter-, Abfrage- und Transformationsfunktionen erweitert. Inspiriert von Laravels Collections und MongoDBs Abfragesprache bietet sie eine elegante und typsichere API für die Arbeit mit Datensammlungen.

## Hauptmerkmale

- **MongoDB-ähnliche Query-DSL** - Intuitive Abfragesyntax mit Operatoren wie `$eq`, `$gt`, `$in`, `$contains` und mehr
- **Typsicheres TypeScript** - Vollständige TypeScript-Unterstützung mit generischen Typen für Autovervollständigung und Typprüfung
- **Umfangreiche API** - Über 30 integrierte Methoden zum Filtern, Transformieren und Aggregieren von Daten
- **Methodenverkettung** - Fluent Interface zum Komponieren komplexer Operationen
- **Erweiterbar** - Fügen Sie benutzerdefinierte Methoden mit Makros hinzu
- **Keine Abhängigkeiten** - Leichtgewichtig mit minimalen externen Abhängigkeiten
- **Leistungsoptimiert** - Effiziente Query-Kompilierung und native Array-Delegation

## Schnellstart

### Installation

```bash
npm install @arcaelas/collection
# oder
yarn add @arcaelas/collection
```

### Grundlegende Verwendung

```typescript
import Collection from "@arcaelas/collection";

const users = new Collection([
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Charlie", age: 35, active: true }
]);

// Filtern mit MongoDB-ähnlichen Abfragen
const activeUsers = users.filter({ active: true });

// Filtern mit Abfrageoperatoren
const adults = users.filter({ age: { $gte: 18 } });

// Methoden verketten
const result = users
  .filter({ active: true })
  .where("age", ">=", 25)
  .sort("age", "desc")
  .first();

console.log(result); // { name: "Charlie", age: 35, active: true }
```

## Warum @arcaelas/collection?

### Problem

Native JavaScript-Arrays haben begrenzte Funktionalität für komplexe Datenoperationen:

```javascript
// Nativer Ansatz - ausführlich und fehleranfällig
const activeUsers = users.filter(user => user.active);
const adults = users.filter(user => user.age >= 18);
const sorted = users.sort((a, b) => b.age - a.age);
```

### Lösung

Collection bietet eine elegante, verkettbare API:

```typescript
// Collection-Ansatz - sauber und ausdrucksstark
const result = collection
  .filter({ active: true, age: { $gte: 18 } })
  .sort("age", "desc");
```

## Grundkonzepte

### Abfrageoperatoren

Verwenden Sie MongoDB-Style-Operatoren für leistungsstarke Abfragen:

```typescript
collection.filter({
  age: { $gte: 18, $lt: 65 },
  name: { $regex: /^A/ },
  skills: { $contains: "TypeScript" },
  role: { $in: ["admin", "moderator"] }
});
```

### Methodenverkettung

Komponieren Sie komplexe Operationen mit fluenter Syntax:

```typescript
collection
  .where("verified", true)
  .whereNot("banned", true)
  .sort("created_at", "desc")
  .paginate(1, 20);
```

### Typsicherheit

Nutzen Sie TypeScript für Compile-Time-Sicherheit:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users = new Collection<User>([...]);

// TypeScript kennt die Form
users.first()?.email; // string | undefined
```

## Anwendungsfälle

### Datenfilterung

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

### Datentransformation

```typescript
const users = new Collection(userData);

const sanitized = users
  .forget("password", "token")
  .unique("email")
  .sort("created_at", "desc");
```

## Was kommt als Nächstes?

<div class="grid cards" markdown>

- :material-rocket-launch: **[Erste Schritte](guides/getting-started.de.md)**

    Lernen Sie die Grundlagen und erstellen Sie Ihre erste Collection

- :material-book-open-variant: **[Grundkonzepte](guides/core-concepts.de.md)**

    Verstehen Sie die grundlegenden Prinzipien und Muster

- :material-filter: **[Abfrageoperatoren](guides/query-operators.de.md)**

    Meistern Sie die MongoDB-ähnliche Abfragesyntax

- :material-api: **[API-Referenz](api/collection-class.de.md)**

    Erkunden Sie alle verfügbaren Methoden und Signaturen

- :material-code-braces: **[Beispiele](examples/basic-usage.de.md)**

    Sehen Sie praktische Beispiele und gängige Muster

- :material-rocket: **[Erweitert](advanced/performance.de.md)**

    Leistungstipps und fortgeschrittene Techniken

</div>

## Community & Support

- **GitHub**: [arcaelas/collection](https://github.com/arcaelas/collection)
- **Issues**: [Fehler melden oder Funktionen anfordern](https://github.com/arcaelas/collection/issues)
- **Twitter**: [@arcaelas](https://twitter.com/arcaelas)
- **Email**: [community@arcaelas.com](mailto:community@arcaelas.com)

## Lizenz

MIT © 2025 Arcaelas Insiders

---

<div align="center">
  <p>
    <strong>Mit ❤️ vom Arcaelas Insiders Team gebaut</strong>
  </p>
  <p>
    Möchten Sie eines unserer Open-Source-Projekte diskutieren? Senden Sie uns eine Nachricht auf
    <a href="https://twitter.com/arcaelas">Twitter</a> oder sponsern Sie uns bei
    <a href="https://github.com/sponsors/arcaelas">GitHub Sponsors</a>.
  </p>
</div>
