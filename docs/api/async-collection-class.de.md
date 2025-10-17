# AsyncCollection-Klasse

Vollständige API-Referenz für die AsyncCollection-Klasse - ein verzögerter Query-Builder zum Erstellen von Abstraktionen über jede Datenquelle.

## Import

```typescript
import AsyncCollection from "@arcaelas/collection/async";
```

## Konstruktor

### `new AsyncCollection<T, V>(executor, validators?)`

Erstellt eine neue AsyncCollection-Instanz mit einer benutzerdefinierten Executor-Funktion.

**Typparameter:**

- `T` - Typ der Elemente in der Sammlung
- `V` - Typ der benutzerdefinierten Validatoren (optional)

**Parameter:**

| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| `executor` | `Executor<T, V>` | Ja | Funktion, die Operationen verarbeitet und Ergebnisse zurückgibt |
| `validators` | `V` | Nein | Benutzerdefinierte Validatoren zur Erweiterung von Abfrageoperatoren |

**Beispiel:**

```typescript
const users = new AsyncCollection<User>(
  async ({ operations, validators, metadata }) => {
    console.log(`Verarbeite ${metadata.operation_count} Operationen`);
    return await processOperations(operations);
  }
);
```

## Typdefinitionen

### `Executor<T, V>`

Funktionstyp für den Executor, der den Kontext verarbeitet.

```typescript
type Executor<T = any, V = any> = (
  context: ExecutorContext<T, V>
) => T | T[] | Promise<T | T[]>;
```

### `ExecutorContext<T, V>`

Kontextobjekt, das an die Executor-Funktion übergeben wird.

```typescript
interface ExecutorContext<T = any, V = any> {
  operations: [string, ...any[]][];
  validators?: V;
  metadata: {
    created_at: Date;
    operation_count: number;
    chain_depth: number;
  };
}
```

## Thenable-Implementierung

AsyncCollection implementiert die Thenable-Schnittstelle und ist daher awaitable.

### `then(onfulfilled?, onrejected?)`

Implementiert Promise.then() für asynchrone Ausführung.

**Rückgabe:** `Promise<TResult1 | TResult2>`

**Beispiel:**

```typescript
users
  .where('active', true)
  .then(results => console.log(results))
  .catch(error => console.error(error));

// Oder mit await
const results = await users.where('active', true);
```

### `catch(onrejected?)`

Implementiert Promise.catch() für Fehlerbehandlung.

### `finally(onfinally?)`

Implementiert Promise.finally() für Bereinigung.

## Filtermethoden

### `where(key, value)` / `where(key, operator, value)`

Filtert Sammlung mit where-Operator und Vergleichen.

**Beispiel:**

```typescript
users.where('age', '>=', 18)
users.where('status', 'active')  // Operator '=' standardmäßig
```

### `whereNot(key, value)` / `whereNot(key, operator, value)`

Inverser Filter - schließt übereinstimmende Elemente aus.

### `filter(handler)`

Filtert Elemente mit einer Funktion oder einem Query-Objekt.

### `not(handler)`

Inverser Filter - schließt übereinstimmende Elemente aus.

## Suchmethoden

### `first(handler?)`

Ruft das erste Element ab, das die Kriterien erfüllt.

### `last(handler?)`

Ruft das letzte Element ab, das die Kriterien erfüllt.

### `find(handler)`

Findet erstes übereinstimmendes Element (Alias für `first()`).

### `every(handler, value?)`

Überprüft, ob alle Elemente die Kriterien erfüllen.

## Transformationsmethoden

### `map(handler)`

Transformiert jedes Element mit einer Mapping-Funktion.

### `each(fn)`

Iteriert über jedes Element und führt einen Callback aus.

### `forget(...keys)`

Entfernt bestimmte Felder aus jedem Element.

## Sortiermethoden

### `sort(handler?, direction?)`

Sortiert Elemente nach Schlüssel oder Vergleichsfunktion.

### `reverse()`

Kehrt die Reihenfolge der Elemente um.

### `shuffle()`

Mischt Elemente zufällig.

### `random(length?)`

Ruft zufällige Elemente aus der Sammlung ab.

## Slicing-Methoden

### `slice(start, end?)`

Ruft einen Ausschnitt der Sammlung ab.

### `chunk(size)`

Teilt Sammlung in Blöcke der angegebenen Größe.

### `paginate(page?, perPage?)`

Paginiert Ergebnisse.

## Aggregationsmethoden

### `sum(handler)`

Summiert Werte eines Schlüssels oder einer Funktion.

### `max(key)`

Ruft Maximalwert eines Schlüssels ab.

### `min(key)`

Ruft Minimalwert eines Schlüssels ab.

### `groupBy(handler)`

Gruppiert Elemente nach Schlüssel oder Funktion.

### `countBy(handler)`

Zählt Elemente gruppiert nach Schlüssel oder Funktion.

## Hilfsmethoden

### `unique(handler)`

Ruft nur eindeutige Elemente nach Schlüssel oder Funktion ab.

### `update(where, set?)`

Aktualisiert Elemente, die Kriterien entsprechen.

### `delete(where)`

Löscht Elemente, die Kriterien entsprechen.

### `collect(items?)`

Klont aktuellen Kontext mit optionalen Items.

## Debugging-Methoden

### `dump()`

Gibt Sammlung in Konsole aus zum Debugging.

### `dd()`

Gibt Sammlung aus und beendet Prozess (nur Node.js).

### `stringify(replacer?, space?)`

Konvertiert Sammlung in JSON-String.

## Erweiterungsmethoden

### `macro(key, handler)`

Registriert ein benutzerdefiniertes Makro (Methodenerweiterung).

## Siehe auch

- [AsyncCollection-Anleitung](../guides/async-collection.md)
- [Verwendungsbeispiele](../examples/async-collection-usage.md)
- [TypeScript-Verwendung](../advanced/typescript-usage.md)
