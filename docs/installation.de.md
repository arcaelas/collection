# Installation

Diese Anleitung hilft Ihnen bei der Installation und Einrichtung von `@arcaelas/collection` in Ihrem Projekt.

## Anforderungen

- **Node.js**: 14.x oder höher
- **TypeScript**: 4.x oder höher (optional, für TypeScript-Projekte)
- **Paketmanager**: npm, yarn oder pnpm

## Installation mit Paketmanager

### Mit npm

```bash
npm install @arcaelas/collection
```

### Mit yarn

```bash
yarn add @arcaelas/collection
```

### Mit pnpm

```bash
pnpm add @arcaelas/collection
```

## Importmethoden

### ES-Modul (Empfohlen)

```typescript
import Collection from "@arcaelas/collection";

const collection = new Collection([1, 2, 3, 4, 5]);
```

### Benannter Import

```typescript
import { Collection } from "@arcaelas/collection";

const collection = new Collection(["a", "b", "c"]);
```

### CommonJS

```javascript
const Collection = require("@arcaelas/collection");

const collection = new Collection([1, 2, 3]);
```

## TypeScript-Konfiguration

Wenn Sie TypeScript verwenden, stellen Sie sicher, dass Ihre `tsconfig.json` die richtige Konfiguration enthält:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true
  }
}
```

## Installation Überprüfen

Erstellen Sie eine einfache Testdatei, um die Installation zu überprüfen:

```typescript
// test-collection.ts
import Collection from "@arcaelas/collection";

const numbers = new Collection([1, 2, 3, 4, 5]);

console.log("Gesamt:", numbers.sum(n => n)); // 15
console.log("Maximum:", numbers.max("value"));
console.log("Erstes:", numbers.first()); // 1

const filtered = numbers.filter(n => n > 2);
console.log("Gefiltert:", filtered); // [3, 4, 5]
```

Test ausführen:

```bash
# Wenn Sie TypeScript verwenden
npx ts-node test-collection.ts

# Wenn Sie JavaScript verwenden
node test-collection.js
```

## Bundle-Größe

Die Bibliothek ist leichtgewichtig und tree-shakeable:

- **Minifiziert**: ~15 KB
- **Gzipped**: ~5 KB

## Browser-Kompatibilität

`@arcaelas/collection` funktioniert in allen modernen Browsern, die ES2020 unterstützen:

- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

Für ältere Browser verwenden Sie einen Transpiler wie Babel.

## Nächste Schritte

Jetzt, da Sie `@arcaelas/collection` installiert haben, können Sie:

- Die Anleitung [Erste Schritte](guides/getting-started.de.md) lesen
- [Grundkonzepte](guides/core-concepts.de.md) erkunden
- [Beispiele](examples/basic-usage.de.md) ansehen
- Die [API-Referenz](api/collection-class.de.md) durchsuchen
