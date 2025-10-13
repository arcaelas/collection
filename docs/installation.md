# Installation

This guide will help you install and set up `@arcaelas/collection` in your project.

## Requirements

- **Node.js**: 14.x or higher
- **TypeScript**: 4.x or higher (optional, for TypeScript projects)
- **Package Manager**: npm, yarn, or pnpm

## Package Manager Installation

### Using npm

```bash
npm install @arcaelas/collection
```

### Using yarn

```bash
yarn add @arcaelas/collection
```

### Using pnpm

```bash
pnpm add @arcaelas/collection
```

## Import Methods

### ES Module (Recommended)

```typescript
import Collection from "@arcaelas/collection";

const collection = new Collection([1, 2, 3, 4, 5]);
```

### Named Import

```typescript
import { Collection } from "@arcaelas/collection";

const collection = new Collection(["a", "b", "c"]);
```

### CommonJS

```javascript
const Collection = require("@arcaelas/collection");

const collection = new Collection([1, 2, 3]);
```

## TypeScript Configuration

If you're using TypeScript, ensure your `tsconfig.json` includes proper configuration:

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

## Verify Installation

Create a simple test file to verify the installation:

```typescript
// test-collection.ts
import Collection from "@arcaelas/collection";

const numbers = new Collection([1, 2, 3, 4, 5]);

console.log("Total:", numbers.sum(n => n)); // 15
console.log("Max:", numbers.max("value")); // Works with objects
console.log("First:", numbers.first()); // 1

const filtered = numbers.filter(n => n > 2);
console.log("Filtered:", filtered); // [3, 4, 5]
```

Run the test:

```bash
# If using TypeScript
npx ts-node test-collection.ts

# If using JavaScript
node test-collection.js
```

## Bundle Size

The library is lightweight and tree-shakeable:

- **Minified**: ~15 KB
- **Gzipped**: ~5 KB

## Browser Compatibility

`@arcaelas/collection` works in all modern browsers that support ES2020:

- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

For older browsers, use a transpiler like Babel.

## CDN Usage

You can also use the library directly from a CDN:

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

## Development Installation

If you want to contribute or work on the library itself:

```bash
# Clone the repository
git clone https://github.com/arcaelas/collection.git
cd collection

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Troubleshooting

### Module Not Found Error

If you encounter module resolution issues:

```
Error: Cannot find module '@arcaelas/collection'
```

**Solutions:**

1. Clear your package manager cache:
   ```bash
   npm cache clean --force
   # or
   yarn cache clean
   ```

2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check your `package.json` to ensure the package is listed in `dependencies`.

### TypeScript Declaration Errors

If TypeScript can't find type declarations:

```
Could not find a declaration file for module '@arcaelas/collection'
```

**Solutions:**

1. The library includes TypeScript declarations. Ensure you're using TypeScript 4.x or higher.

2. Check your `tsconfig.json` includes:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

### Import/Export Syntax Errors

If you see syntax errors related to imports:

**Solutions:**

1. Ensure your Node.js version supports ES modules (14.x+)

2. Add `"type": "module"` to your `package.json` for ES modules:
   ```json
   {
     "type": "module"
   }
   ```

3. Or use `.mjs` extension for module files

## Next Steps

Now that you have `@arcaelas/collection` installed, you can:

- Read the [Getting Started](guides/getting-started.md) guide
- Explore [Core Concepts](guides/core-concepts.md)
- Check out [Examples](examples/basic-usage.md)
- Browse the [API Reference](api/collection-class.md)

## Support

If you encounter any issues during installation:

- Check the [GitHub Issues](https://github.com/arcaelas/collection/issues)
- Ask for help in [Discussions](https://github.com/arcaelas/collection/discussions)
- Contact us at [community@arcaelas.com](mailto:community@arcaelas.com)
