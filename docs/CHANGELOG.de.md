# Änderungsprotokoll

Alle wichtigen Änderungen an `@arcaelas/collection` werden in dieser Datei dokumentiert.

## [2.1.2] - 2025-01-15

### Behoben
- TypeScript-Typinferenz für `every()`-Methodenüberladungen behoben
- Rückgabetyp für `collect()`-Methode korrigiert
- Abfragevalidierung für verschachtelte Objekte korrigiert

### Verbessert
- Leistung der `unique()`-Methode mit großen Datensätzen verbessert
- Abfragekompilierung für wiederholte Filteroperationen optimiert
- Bessere Fehlermeldungen für ungültige Operatorverwendung

## [2.1.1] - 2024-12-20

### Hinzugefügt
- Neue `every()`-Methode mit mehreren Überladungssignaturen
- Unterstützung für Punktnotation in `where()`- und `whereNot()`-Methoden
- Verbesserte `update()`-Methode mit Callback-Unterstützung

## [2.1.0] - 2024-11-10

### Hinzugefügt
- MongoDB-Stil-Abfrageoperatoren
- Abfrageoperator-Aliase
- Statische und Instanz-`macro()`-Methoden
- `stringify()`-Methode für JSON-Serialisierung

## [2.0.0] - 2024-09-15

### Hinzugefügt
- Vollständige TypeScript-Umschreibung
- Vollständige generische Typunterstützung
- Neue Aggregations- und Transformationsmethoden

## Versionsunterstützung

| Version | Status | Node.js | TypeScript |
|---------|--------|---------|------------|
| 2.1.x   | Aktiv | 14+ | 4.x+ |
| 2.0.x   | Wartung | 14+ | 4.x+ |
| 1.x     | Lebensende | 12+ | 3.x+ |
