---
sidebar_position: 2
---

# Guía de inicio

Esta guía te ayudará a comenzar con Arcaelas Collection, desde la instalación hasta los primeros ejemplos de uso.

## Requisitos previos

- Node.js ≥ 14.x
- npm ≥ 6.x o yarn ≥ 1.22.x

## Instalación

### Usando npm

```bash
npm install @arcaelas/collection
```

### Usando yarn

```bash
yarn add @arcaelas/collection
```

## Configuración con TypeScript

Arcaelas Collection está completamente tipada y funciona perfectamente con TypeScript. Para obtener el máximo beneficio, asegúrate de que tu `tsconfig.json` tenga habilitado el modo estricto:

```json
{
  "compilerOptions": {
    "strict": true,
    // otras opciones...
  }
}
```

## Uso básico

### Importación

```ts
// ESM (recomendado)
import { Collection } from '@arcaelas/collection';

// CommonJS
const { Collection } = require('@arcaelas/collection');
```

### Creación de colecciones

```ts
// Colección vacía
const coleccionVacia = new Collection();

// Desde un array
const numeros = new Collection([1, 2, 3, 4, 5]);

// Desde objetos tipados
interface Usuario {
  id: number;
  nombre: string;
  edad: number;
}

const usuarios = new Collection<Usuario>([
  { id: 1, nombre: 'Ana', edad: 28 },
  { id: 2, nombre: 'Carlos', edad: 34 },
  { id: 3, nombre: 'Elena', edad: 25 }
]);
```

### Operaciones básicas

```ts
// Añadir elementos
usuarios.push({ id: 4, nombre: 'David', edad: 31 });

// Filtrar elementos
const mayoresDe30 = usuarios.where('edad', '>', 30);
console.log(mayoresDe30.length); // 2

// Obtener el primer elemento que cumple una condición
const primerMayorDe30 = usuarios.first('edad', '>', 30);
console.log(primerMayorDe30?.nombre); // 'Carlos'

// Mapear elementos (preservando la instancia Collection)
const nombres = usuarios.map(u => u.nombre);
console.log(nombres); // Collection ['Ana', 'Carlos', 'Elena', 'David']

// Encadenamiento de métodos
const resultado = usuarios
  .where('edad', '<', 35)
  .where('edad', '>', 25)
  .map(u => ({ nombre: u.nombre, edadEnMeses: u.edad * 12 }));
```

## Compatibilidad con Array

Arcaelas Collection extiende la clase nativa `Array`, por lo que todos los métodos de Array están disponibles:

```ts
// Métodos nativos de Array
usuarios.forEach(u => console.log(u.nombre));
const algunosMayoresDe30 = usuarios.some(u => u.edad > 30);
const todosConNombre = usuarios.every(u => u.nombre.length > 0);

// Desestructuración
const [primerUsuario, segundoUsuario] = usuarios;

// Spread operator
const copiaUsuarios = [...usuarios];

// Métodos de Array que devuelven un nuevo array
// Nota: estos métodos devuelven una instancia de Collection, no un Array
const edades = usuarios.map(u => u.edad); // Collection<number>
```

## Próximos pasos

Ahora que conoces los conceptos básicos, puedes explorar las secciones de API y casos de uso avanzados para aprovechar todo el potencial de Arcaelas Collection.
