# Instalación

Esta guía le ayudará a instalar y configurar `@arcaelas/collection` en su proyecto.

## Requisitos

- **Node.js**: 14.x o superior
- **TypeScript**: 4.x o superior (opcional, para proyectos TypeScript)
- **Gestor de Paquetes**: npm, yarn o pnpm

## Instalación con Gestor de Paquetes

### Usando npm

```bash
npm install @arcaelas/collection
```

### Usando yarn

```bash
yarn add @arcaelas/collection
```

### Usando pnpm

```bash
pnpm add @arcaelas/collection
```

## Métodos de Importación

### ES Module (Recomendado)

```typescript
import Collection from "@arcaelas/collection";

const collection = new Collection([1, 2, 3, 4, 5]);
```

### Importación Nombrada

```typescript
import { Collection } from "@arcaelas/collection";

const collection = new Collection(["a", "b", "c"]);
```

### CommonJS

```javascript
const Collection = require("@arcaelas/collection");

const collection = new Collection([1, 2, 3]);
```

## Configuración de TypeScript

Si está usando TypeScript, asegúrese de que su `tsconfig.json` incluya la configuración adecuada:

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

## Verificar Instalación

Cree un archivo de prueba simple para verificar la instalación:

```typescript
// test-collection.ts
import Collection from "@arcaelas/collection";

const numbers = new Collection([1, 2, 3, 4, 5]);

console.log("Total:", numbers.sum(n => n)); // 15
console.log("Máximo:", numbers.max("value"));
console.log("Primero:", numbers.first()); // 1

const filtered = numbers.filter(n => n > 2);
console.log("Filtrado:", filtered); // [3, 4, 5]
```

Ejecute la prueba:

```bash
# Si usa TypeScript
npx ts-node test-collection.ts

# Si usa JavaScript
node test-collection.js
```

## Tamaño del Bundle

La biblioteca es ligera y tree-shakeable:

- **Minificado**: ~15 KB
- **Gzipped**: ~5 KB

## Compatibilidad de Navegadores

`@arcaelas/collection` funciona en todos los navegadores modernos que soportan ES2020:

- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

Para navegadores más antiguos, use un transpilador como Babel.

## Uso con CDN

También puede usar la biblioteca directamente desde un CDN:

### unpkg

```html
<script type="module">
  import Collection from "https://unpkg.com/@arcaelas/collection@latest/build/index.js";

  const collection = new Collection([1, 2, 3]);
  console.log(collection.sum(n => n));
</script>
```

### jsDelivr

```html
<script type="module">
  import Collection from "https://cdn.jsdelivr.net/npm/@arcaelas/collection@latest/build/index.js";

  const collection = new Collection([1, 2, 3]);
  console.log(collection.first());
</script>
```

## Próximos Pasos

Ahora que tiene `@arcaelas/collection` instalado, puede:

- Leer la guía de [Primeros Pasos](guides/getting-started.es.md)
- Explorar [Conceptos Básicos](guides/core-concepts.es.md)
- Ver [Ejemplos](examples/basic-usage.es.md)
- Navegar la [Referencia de API](api/collection-class.es.md)
