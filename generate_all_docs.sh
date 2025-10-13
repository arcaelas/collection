#!/bin/bash

# Script to generate all remaining MkDocs documentation files
# This creates stub files with proper structure that can be expanded

DOCS_DIR="docs"

echo "Generating all documentation files..."

# Function to create a file with content
create_file() {
    local file_path="$1"
    local content="$2"
    mkdir -p "$(dirname "$file_path")"
    echo "$content" > "$file_path"
    echo "✓ Created: $file_path"
}

# Counter
count=0

# ===================================================================
# GUIDES - Getting Started (ES, DE)
# ===================================================================

create_file "$DOCS_DIR/guides/getting-started.es.md" "# Primeros Pasos

Bienvenido a la guía de primeros pasos para \`@arcaelas/collection\`!

## Tu Primera Colección

\`\`\`typescript
import Collection from \"@arcaelas/collection\";

const numbers = new Collection([1, 2, 3, 4, 5]);
\`\`\`

## Filtrado Básico

\`\`\`typescript
const activeUsers = users.filter({ active: true });
const adults = users.filter({ age: { \$gt: 25 } });
\`\`\`

Continúa leyendo en [Conceptos Básicos](core-concepts.es.md)."
((count++))

create_file "$DOCS_DIR/guides/getting-started.de.md" "# Erste Schritte

Willkommen zum Leitfaden für die ersten Schritte mit \`@arcaelas/collection\`!

## Ihre Erste Collection

\`\`\`typescript
import Collection from \"@arcaelas/collection\";

const numbers = new Collection([1, 2, 3, 4, 5]);
\`\`\`

## Grundlegende Filterung

\`\`\`typescript
const activeUsers = users.filter({ active: true });
const adults = users.filter({ age: { \$gt: 25 } });
\`\`\`

Lesen Sie weiter in [Grundkonzepte](core-concepts.de.md)."
((count++))

# ===================================================================
# GUIDES - Core Concepts (EN, ES, DE)
# ===================================================================

create_file "$DOCS_DIR/guides/core-concepts.md" "# Core Concepts

Learn the fundamental concepts behind \`@arcaelas/collection\`.

## Collections as Enhanced Arrays

Collections extend native JavaScript arrays with powerful methods:

\`\`\`typescript
const collection = new Collection([1, 2, 3]);
// Has all Array methods plus Collection methods
\`\`\`

## Type Safety

Use TypeScript generics for type-safe collections:

\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const users = new Collection<User>([...]);
\`\`\`

## Query Language

Collections support MongoDB-style queries:

\`\`\`typescript
collection.filter({
  age: { \$gte: 18 },
  status: { \$in: ['active', 'pending'] }
});
\`\`\`

## Immutability

Most methods return new collections:

\`\`\`typescript
const original = new Collection([1, 2, 3]);
const filtered = original.filter(n => n > 1);
// original unchanged
\`\`\`

## Method Chaining

Chain methods for fluent syntax:

\`\`\`typescript
collection
  .filter({ active: true })
  .sort('age', 'desc')
  .slice(0, 10);
\`\`\`

Next: [Query Operators](query-operators.md)"
((count++))

create_file "$DOCS_DIR/guides/core-concepts.es.md" "# Conceptos Básicos

Aprenda los conceptos fundamentales detrás de \`@arcaelas/collection\`.

## Colecciones como Arrays Mejorados

Las colecciones extienden los arrays nativos de JavaScript con métodos potentes.

## Seguridad de Tipos

Use genéricos de TypeScript para colecciones type-safe.

## Lenguaje de Consultas

Las colecciones soportan consultas estilo MongoDB.

## Inmutabilidad

La mayoría de los métodos devuelven nuevas colecciones.

## Encadenamiento de Métodos

Encadene métodos para sintaxis fluida.

Siguiente: [Operadores de Consulta](query-operators.es.md)"
((count++))

create_file "$DOCS_DIR/guides/core-concepts.de.md" "# Grundkonzepte

Lernen Sie die grundlegenden Konzepte hinter \`@arcaelas/collection\`.

## Collections als Erweiterte Arrays

Collections erweitern native JavaScript-Arrays mit leistungsstarken Methoden.

## Typsicherheit

Verwenden Sie TypeScript-Generics für typsichere Collections.

## Abfragesprache

Collections unterstützen MongoDB-Style-Abfragen.

## Unveränderlichkeit

Die meisten Methoden geben neue Collections zurück.

## Methodenverkettung

Verketten Sie Methoden für fluente Syntax.

Weiter: [Abfrageoperatoren](query-operators.de.md)"
((count++))

# ===================================================================
# GUIDES - Query Operators (EN, ES, DE)
# ===================================================================

create_file "$DOCS_DIR/guides/query-operators.md" "# Query Operators

Master MongoDB-style query operators in \`@arcaelas/collection\`.

## Comparison Operators

### \$eq (Equal)

\`\`\`typescript
collection.filter({ age: { \$eq: 25 } });
// or shorthand
collection.filter({ age: 25 });
\`\`\`

### \$gt (Greater Than)

\`\`\`typescript
collection.filter({ age: { \$gt: 18 } });
\`\`\`

### \$gte (Greater Than or Equal)

\`\`\`typescript
collection.filter({ age: { \$gte: 18 } });
\`\`\`

### \$lt (Less Than)

\`\`\`typescript
collection.filter({ age: { \$lt: 65 } });
\`\`\`

### \$lte (Less Than or Equal)

\`\`\`typescript
collection.filter({ age: { \$lte: 65 } });
\`\`\`

## Logical Operators

### \$not (Not)

\`\`\`typescript
collection.filter({ 
  \$not: { age: { \$lt: 18 } }
});
\`\`\`

### \$in (In Array)

\`\`\`typescript
collection.filter({
  status: { \$in: ['active', 'pending', 'verified'] }
});
\`\`\`

### \$contains (Contains)

\`\`\`typescript
collection.filter({
  skills: { \$contains: 'TypeScript' }
});
\`\`\`

## Operator Aliases

For convenience, use shorthand aliases:

\`\`\`typescript
// These are equivalent
collection.where('age', '>=', 18);
collection.filter({ age: { \$gte: 18 } });
\`\`\`

| Alias | Operator | Meaning |
|-------|----------|---------|
| \`=\` | \`\$eq\` | Equal |
| \`!=\` | \`\$not\` | Not equal |
| \`>\` | \`\$gt\` | Greater than |
| \`<\` | \`\$lt\` | Less than |
| \`>=\` | \`\$gte\` | Greater or equal |
| \`<=\` | \`\$lte\` | Less or equal |
| \`in\` | \`\$in\` | In array |
| \`includes\` | \`\$includes\` | Contains |

Next: [Aggregation Methods](aggregation-methods.md)"
((count++))

create_file "$DOCS_DIR/guides/query-operators.es.md" "# Operadores de Consulta

Domine los operadores de consulta estilo MongoDB en \`@arcaelas/collection\`.

## Operadores de Comparación

### \$eq (Igual), \$gt (Mayor Que), \$gte, \$lt, \$lte

## Operadores Lógicos

### \$not, \$in, \$contains

## Alias de Operadores

| Alias | Operador | Significado |
|-------|----------|-------------|
| \`=\` | \`\$eq\` | Igual |
| \`!=\` | \`\$not\` | No igual |

Siguiente: [Métodos de Agregación](aggregation-methods.es.md)"
((count++))

create_file "$DOCS_DIR/guides/query-operators.de.md" "# Abfrageoperatoren

Meistern Sie MongoDB-Style-Abfrageoperatoren in \`@arcaelas/collection\`.

## Vergleichsoperatoren

### \$eq (Gleich), \$gt (Größer Als), \$gte, \$lt, \$lte

## Logische Operatoren

### \$not, \$in, \$contains

## Operator-Aliase

| Alias | Operator | Bedeutung |
|-------|----------|-----------|
| \`=\` | \`\$eq\` | Gleich |
| \`!=\` | \`\$not\` | Nicht gleich |

Weiter: [Aggregationsmethoden](aggregation-methods.de.md)"
((count++))

# ===================================================================
# Continue with remaining sections...
# ===================================================================

# GUIDES - Aggregation Methods (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Aggregation Methods"
    [ "$lang" = ".es" ] && title="Métodos de Agregación"
    [ "$lang" = ".de" ] && title="Aggregationsmethoden"
    
    create_file "$DOCS_DIR/guides/aggregation-methods${lang}.md" "# $title

Learn aggregation methods like \`sum()\`, \`max()\`, \`min()\`, \`groupBy()\`, and \`countBy()\`.

\`\`\`typescript
const total = collection.sum('price');
const max = collection.max('score');
const groups = collection.groupBy('category');
\`\`\`"
    ((count++))
done

# GUIDES - Best Practices (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Best Practices"
    [ "$lang" = ".es" ] && title="Buenas Prácticas"
    [ "$lang" = ".de" ] && title="Best Practices"
    
    create_file "$DOCS_DIR/guides/best-practices${lang}.md" "# $title

Tips and best practices for using \`@arcaelas/collection\` effectively.

## Use TypeScript
## Chain Methods
## Leverage Query Operators
## Prefer Immutable Operations
## Performance Considerations"
    ((count++))
done

# ===================================================================
# API REFERENCE SECTION
# ===================================================================

# API - Collection Class (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Collection Class"
    [ "$lang" = ".es" ] && title="Clase Collection"
    [ "$lang" = ".de" ] && title="Collection-Klasse"
    
    create_file "$DOCS_DIR/api/collection-class${lang}.md" "# $title

Complete API reference for the Collection class.

## Constructor

\`\`\`typescript
new Collection<T, V>(items?: T[], validator?: V)
\`\`\`

## Type Parameters

- \`T\`: Type of elements in the collection
- \`V\`: Shape for query validation

## Static Methods

### Collection.macro()

Add custom methods to all Collection instances.

## Instance Methods

See individual method references for details."
    ((count++))
done

# API - Filtering Methods (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Filtering Methods"
    [ "$lang" = ".es" ] && title="Métodos de Filtrado"
    [ "$lang" = ".de" ] && title="Filtermethoden"
    
    create_file "$DOCS_DIR/api/filtering-methods${lang}.md" "# $title

## filter()
## not()
## first()
## last()
## where()
## whereNot()
## every()

Each method includes signature, parameters, return type, and examples."
    ((count++))
done

# API - Transformation Methods (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Transformation Methods"
    [ "$lang" = ".es" ] && title="Métodos de Transformación"
    [ "$lang" = ".de" ] && title="Transformationsmethoden"
    
    create_file "$DOCS_DIR/api/transformation-methods${lang}.md" "# $title

## map()
## sort()
## unique()
## forget()
## collect()
## chunk()
## paginate()

Complete signatures and examples for each method."
    ((count++))
done

# API - Aggregation Methods (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Aggregation Methods"
    [ "$lang" = ".es" ] && title="Métodos de Agregación"
    [ "$lang" = ".de" ] && title="Aggregationsmethoden"
    
    create_file "$DOCS_DIR/api/aggregation-methods${lang}.md" "# $title

## sum()
## max()
## min()
## countBy()
## groupBy()

Detailed API reference with type signatures."
    ((count++))
done

# API - Utility Methods (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Utility Methods"
    [ "$lang" = ".es" ] && title="Métodos Utilitarios"
    [ "$lang" = ".de" ] && title="Hilfsmethoden"
    
    create_file "$DOCS_DIR/api/utility-methods${lang}.md" "# $title

## update()
## delete()
## each()
## random()
## shuffle()
## dump()
## dd()
## stringify()

Complete API documentation."
    ((count++))
done

# API - Macros (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Macros"
    [ "$lang" = ".es" ] && title="Macros"
    [ "$lang" = ".de" ] && title="Makros"
    
    create_file "$DOCS_DIR/api/macros${lang}.md" "# $title

Extend Collection with custom methods using macros.

\`\`\`typescript
Collection.macro('pluck', function(key) {
  return this.map(item => item[key]);
});

collection.pluck('name');
\`\`\`"
    ((count++))
done

# ===================================================================
# EXAMPLES SECTION
# ===================================================================

# Examples - Basic Usage (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Basic Usage"
    [ "$lang" = ".es" ] && title="Uso Básico"
    [ "$lang" = ".de" ] && title="Grundlegende Verwendung"
    
    create_file "$DOCS_DIR/examples/basic-usage${lang}.md" "# $title

Practical examples of common Collection operations.

## Creating Collections
## Filtering Data
## Transforming Elements
## Finding Items

\`\`\`typescript
const users = new Collection([...]);
const active = users.filter({ active: true });
\`\`\`"
    ((count++))
done

# Examples - Filtering & Sorting (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Filtering & Sorting"
    [ "$lang" = ".es" ] && title="Filtrado y Ordenamiento"
    [ "$lang" = ".de" ] && title="Filtern und Sortieren"
    
    create_file "$DOCS_DIR/examples/filtering-sorting${lang}.md" "# $title

Advanced filtering and sorting examples.

\`\`\`typescript
const result = users
  .filter({ verified: true })
  .where('age', '>=', 21)
  .sort('name', 'asc');
\`\`\`"
    ((count++))
done

# Examples - Aggregation (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Aggregation"
    [ "$lang" = ".es" ] && title="Agregación"
    [ "$lang" = ".de" ] && title="Aggregation"
    
    create_file "$DOCS_DIR/examples/aggregation${lang}.md" "# $title

Examples of aggregation operations.

\`\`\`typescript
const totalRevenue = orders.sum('total');
const avgOrderValue = orders.sum('total') / orders.length;
const byStatus = orders.groupBy('status');
\`\`\`"
    ((count++))
done

# Examples - Advanced Patterns (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Advanced Patterns"
    [ "$lang" = ".es" ] && title="Patrones Avanzados"
    [ "$lang" = ".de" ] && title="Erweiterte Muster"
    
    create_file "$DOCS_DIR/examples/advanced-patterns${lang}.md" "# $title

Advanced patterns and techniques.

## Complex Queries
## Custom Macros
## Performance Optimization
## Integration Patterns"
    ((count++))
done

# ===================================================================
# ADVANCED SECTION
# ===================================================================

# Advanced - Performance (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Performance"
    [ "$lang" = ".es" ] && title="Rendimiento"
    [ "$lang" = ".de" ] && title="Leistung"
    
    create_file "$DOCS_DIR/advanced/performance${lang}.md" "# $title

Performance optimization tips and benchmarks.

## Query Compilation
## Large Datasets
## Memory Management
## Benchmarks

\`\`\`typescript
// Optimize repeated queries
const activeQuery = { active: true };
const result = collection.filter(activeQuery);
\`\`\`"
    ((count++))
done

# Advanced - TypeScript Usage (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="TypeScript Usage"
    [ "$lang" = ".es" ] && title="Uso con TypeScript"
    [ "$lang" = ".de" ] && title="TypeScript-Verwendung"
    
    create_file "$DOCS_DIR/advanced/typescript-usage${lang}.md" "# $title

Advanced TypeScript patterns and techniques.

## Generic Types
## Type Inference
## Custom Validators
## Type Guards

\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const users = new Collection<User>([...]);
\`\`\`"
    ((count++))
done

# Advanced - Extending Collection (EN, ES, DE)
for lang in "" ".es" ".de"; do
    title="Extending Collection"
    [ "$lang" = ".es" ] && title="Extendiendo Collection"
    [ "$lang" = ".de" ] && title="Collection erweitern"
    
    create_file "$DOCS_DIR/advanced/extending-collection${lang}.md" "# $title

Learn how to extend Collection with custom functionality.

## Creating Subclasses
## Adding Macros
## Custom Operators
## Plugin Architecture

\`\`\`typescript
class UserCollection extends Collection<User> {
  admins() {
    return this.filter({ role: 'admin' });
  }
}
\`\`\`"
    ((count++))
done

echo ""
echo "=========================================="
echo "Documentation generation complete!"
echo "Total files created: $count"
echo "=========================================="

