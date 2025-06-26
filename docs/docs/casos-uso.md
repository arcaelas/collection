---
sidebar_position: 3
---

# Casos de uso

Esta sección presenta ejemplos prácticos de cómo utilizar Arcaelas Collection en diferentes escenarios.

## Gestión de productos

Ejemplo de gestión de un catálogo de productos con operaciones comunes.

```ts
import { Collection } from '@arcaelas/collection';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoría: string;
  stock: number;
  activo: boolean;
}

// Crear catálogo de productos
const catalogo = new Collection<Producto>([
  { id: 1, nombre: 'Mouse inalámbrico', precio: 25, categoría: 'periféricos', stock: 10, activo: true },
  { id: 2, nombre: 'Teclado mecánico', precio: 60, categoría: 'periféricos', stock: 5, activo: true },
  { id: 3, nombre: 'Monitor 24"', precio: 150, categoría: 'pantallas', stock: 3, activo: true },
  { id: 4, nombre: 'Auriculares Bluetooth', precio: 45, categoría: 'audio', stock: 0, activo: false },
  { id: 5, nombre: 'Webcam HD', precio: 35, categoría: 'periféricos', stock: 7, activo: true },
  { id: 6, nombre: 'Disco SSD 500GB', precio: 80, categoría: 'almacenamiento', stock: 12, activo: true },
]);

// Productos disponibles (con stock y activos)
const disponibles = catalogo
  .where('stock', '>', 0)
  .where('activo', true);

console.log(`Productos disponibles: ${disponibles.length}`); // 5

// Agrupar por categoría
const porCategoría = disponibles.groupBy('categoría');
console.log(`Categorías disponibles: ${Object.keys(porCategoría).length}`); // 3

// Productos por rango de precio
const económicos = catalogo.where('precio', '<', 50).where('stock', '>', 0);
const intermedios = catalogo.where('precio', '>=', 50).where('precio', '<', 100).where('stock', '>', 0);
const premium = catalogo.where('precio', '>=', 100).where('stock', '>', 0);

console.log(`Productos económicos: ${económicos.length}`); // 2
console.log(`Productos intermedios: ${intermedios.length}`); // 2
console.log(`Productos premium: ${premium.length}`); // 1

// Producto más caro y más barato
const masCaro = catalogo.max('precio');
const masBarato = catalogo.min('precio');

console.log(`Producto más caro: ${masCaro} (${catalogo.first('precio', masCaro)?.nombre})`);
console.log(`Producto más barato: ${masBarato} (${catalogo.first('precio', masBarato)?.nombre})`);

// Precio promedio
const precioPromedio = catalogo.avg('precio');
console.log(`Precio promedio: $${precioPromedio.toFixed(2)}`); // $65.83

// Valor total del inventario
const valorInventario = catalogo
  .where('stock', '>', 0)
  .sum(p => p.precio * p.stock);

console.log(`Valor total del inventario: $${valorInventario}`); // $1785

// Actualizar precios (10% de descuento en periféricos)
const perifericos = catalogo.where('categoría', 'periféricos');
perifericos.each(p => {
  p.precio = Math.round(p.precio * 0.9);
});

console.log('Precios actualizados:');
perifericos.each(p => {
  console.log(`${p.nombre}: $${p.precio}`);
});
```

## Análisis de datos de usuarios

Ejemplo de análisis de datos de usuarios para obtener estadísticas y segmentación.

```ts
import { Collection } from '@arcaelas/collection';

interface Usuario {
  id: number;
  nombre: string;
  edad: number;
  país: string;
  fechaRegistro: Date;
  ultimoAcceso: Date | null;
  compras: number;
  gastoTotal: number;
}

// Crear colección de usuarios
const usuarios = new Collection<Usuario>([
  { 
    id: 1, 
    nombre: 'Ana García', 
    edad: 28, 
    país: 'España', 
    fechaRegistro: new Date('2023-01-15'), 
    ultimoAcceso: new Date('2023-06-20'), 
    compras: 5, 
    gastoTotal: 320 
  },
  { 
    id: 2, 
    nombre: 'Carlos Rodríguez', 
    edad: 34, 
    país: 'México', 
    fechaRegistro: new Date('2022-11-05'), 
    ultimoAcceso: new Date('2023-06-18'), 
    compras: 12, 
    gastoTotal: 840 
  },
  { 
    id: 3, 
    nombre: 'Elena Martínez', 
    edad: 22, 
    país: 'Argentina', 
    fechaRegistro: new Date('2023-03-28'), 
    ultimoAcceso: null, 
    compras: 1, 
    gastoTotal: 50 
  },
  { 
    id: 4, 
    nombre: 'David López', 
    edad: 45, 
    país: 'España', 
    fechaRegistro: new Date('2022-08-12'), 
    ultimoAcceso: new Date('2023-06-15'), 
    compras: 8, 
    gastoTotal: 620 
  },
  { 
    id: 5, 
    nombre: 'María Fernández', 
    edad: 31, 
    país: 'Colombia', 
    fechaRegistro: new Date('2023-02-20'), 
    ultimoAcceso: new Date('2023-06-19'), 
    compras: 3, 
    gastoTotal: 180 
  },
]);

// Usuarios activos (con acceso en el último mes)
const hoy = new Date();
const unMesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());

const usuariosActivos = usuarios.filter(u => 
  u.ultimoAcceso !== null && u.ultimoAcceso > unMesAtras
);

console.log(`Usuarios activos en el último mes: ${usuariosActivos.length}`); // 4

// Agrupar por país
const porPaís = usuarios.groupBy('país');
console.log('Usuarios por país:');
Object.entries(porPaís).forEach(([país, usuarios]) => {
  console.log(`${país}: ${usuarios.length}`);
});

// Segmentación por edad
const [jóvenes, adultos] = usuarios.partition(u => u.edad < 30);
console.log(`Usuarios jóvenes (<30): ${jóvenes.length}`); // 2
console.log(`Usuarios adultos (≥30): ${adultos.length}`); // 3

// Estadísticas de compras
const estadísticas = {
  totalCompras: usuarios.sum('compras'),
  promedioCompras: usuarios.avg('compras'),
  gastoTotal: usuarios.sum('gastoTotal'),
  gastoPromedio: usuarios.avg('gastoTotal'),
  gastoPromedioPorCompra: usuarios.sum('gastoTotal') / usuarios.sum('compras')
};

console.log('Estadísticas de compras:');
console.log(`Total de compras: ${estadísticas.totalCompras}`); // 29
console.log(`Promedio de compras por usuario: ${estadísticas.promedioCompras.toFixed(1)}`); // 5.8
console.log(`Gasto total: $${estadísticas.gastoTotal}`); // $2010
console.log(`Gasto promedio por usuario: $${estadísticas.gastoPromedio.toFixed(2)}`); // $402.00
console.log(`Gasto promedio por compra: $${estadísticas.gastoPromedioPorCompra.toFixed(2)}`); // $69.31

// Usuarios de alto valor (más de 5 compras y gasto superior a $500)
const usuariosValiosos = usuarios.filter(u => 
  u.compras > 5 && u.gastoTotal > 500
);

console.log('Usuarios de alto valor:');
usuariosValiosos.each(u => {
  console.log(`${u.nombre} - ${u.compras} compras - $${u.gastoTotal}`);
});

// Ordenar por gasto total (descendente)
const topGastadores = usuarios
  .sort('gastoTotal', 'desc')
  .map(u => ({
    nombre: u.nombre,
    gastoTotal: u.gastoTotal,
    compras: u.compras,
    promedioGasto: Math.round(u.gastoTotal / u.compras)
  }));

console.log('Top gastadores:');
topGastadores.each(u => {
  console.log(`${u.nombre} - $${u.gastoTotal} (promedio: $${u.promedioGasto} por compra)`);
});
```

## Manipulación de datos JSON

Ejemplo de procesamiento de datos JSON obtenidos de una API.

```ts
import { Collection } from '@arcaelas/collection';

// Simular datos de una API
const datosAPI = [
  { id: 'post_1', título: 'Introducción a TypeScript', autor: 'user_1', etiquetas: ['typescript', 'javascript', 'programación'], comentarios: 12, likes: 45 },
  { id: 'post_2', título: 'Patrones de diseño en JavaScript', autor: 'user_2', etiquetas: ['javascript', 'patrones', 'arquitectura'], comentarios: 8, likes: 32 },
  { id: 'post_3', título: 'React vs Angular', autor: 'user_1', etiquetas: ['react', 'angular', 'frontend'], comentarios: 24, likes: 56 },
  { id: 'post_4', título: 'Optimización de rendimiento web', autor: 'user_3', etiquetas: ['rendimiento', 'web', 'frontend'], comentarios: 5, likes: 18 },
  { id: 'post_5', título: 'TypeScript avanzado', autor: 'user_2', etiquetas: ['typescript', 'avanzado'], comentarios: 15, likes: 38 },
];

// Crear colección a partir de los datos
const posts = new Collection(datosAPI);

// Indexar por ID para acceso rápido
const postsIndexados = posts.keyBy('id');
console.log(postsIndexados.post_3.título); // 'React vs Angular'

// Encontrar posts populares (más de 10 comentarios y 30 likes)
const postsPopulares = posts.filter(p => 
  p.comentarios > 10 && p.likes > 30
);

console.log(`Posts populares: ${postsPopulares.length}`); // 3

// Agrupar por autor
const postsPorAutor = posts.groupBy('autor');
console.log('Posts por autor:');
Object.entries(postsPorAutor).forEach(([autor, posts]) => {
  console.log(`${autor}: ${posts.length}`);
});

// Encontrar todas las etiquetas únicas
const todasEtiquetas = posts
  .map(p => p.etiquetas)
  .reduce((todas, etiquetas) => {
    return todas.concat(etiquetas);
  }, [])
  .unique();

console.log('Etiquetas únicas:', todasEtiquetas);

// Contar posts por etiqueta
const conteoEtiquetas = {};
posts.each(post => {
  post.etiquetas.forEach(etiqueta => {
    conteoEtiquetas[etiqueta] = (conteoEtiquetas[etiqueta] || 0) + 1;
  });
});

console.log('Conteo de posts por etiqueta:');
console.log(conteoEtiquetas);

// Transformar datos para una API
const datosTransformados = posts.map(p => ({
  id: p.id,
  título: p.título,
  autor: p.autor,
  popularidad: p.likes + (p.comentarios * 2), // fórmula de popularidad
  etiquetasPrincipales: p.etiquetas.slice(0, 2)
}));

console.log('Datos transformados para API:');
console.log(datosTransformados.toArray());
```

## Gestión de tareas

Ejemplo de una aplicación de gestión de tareas con filtrado y agrupación.

```ts
import { Collection } from '@arcaelas/collection';

interface Tarea {
  id: number;
  título: string;
  descripción: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaCreación: Date;
  fechaVencimiento: Date | null;
  etiquetas: string[];
  asignadoA: string | null;
}

// Crear colección de tareas
const tareas = new Collection<Tarea>([
  {
    id: 1,
    título: 'Diseñar página de inicio',
    descripción: 'Crear mockups para la nueva página de inicio',
    estado: 'completada',
    prioridad: 'alta',
    fechaCreación: new Date('2023-06-01'),
    fechaVencimiento: new Date('2023-06-10'),
    etiquetas: ['diseño', 'frontend'],
    asignadoA: 'ana'
  },
  {
    id: 2,
    título: 'Implementar autenticación',
    descripción: 'Integrar sistema de login con OAuth',
    estado: 'en_progreso',
    prioridad: 'urgente',
    fechaCreación: new Date('2023-06-05'),
    fechaVencimiento: new Date('2023-06-15'),
    etiquetas: ['backend', 'seguridad'],
    asignadoA: 'carlos'
  },
  {
    id: 3,
    título: 'Optimizar consultas SQL',
    descripción: 'Mejorar rendimiento de consultas principales',
    estado: 'pendiente',
    prioridad: 'media',
    fechaCreación: new Date('2023-06-08'),
    fechaVencimiento: new Date('2023-06-20'),
    etiquetas: ['backend', 'base de datos', 'rendimiento'],
    asignadoA: 'elena'
  },
  {
    id: 4,
    título: 'Corregir bugs de UI',
    descripción: 'Resolver problemas reportados en formularios',
    estado: 'pendiente',
    prioridad: 'alta',
    fechaCreación: new Date('2023-06-10'),
    fechaVencimiento: new Date('2023-06-12'),
    etiquetas: ['frontend', 'bugs'],
    asignadoA: 'ana'
  },
  {
    id: 5,
    título: 'Actualizar documentación',
    descripción: 'Actualizar guía de API para desarrolladores',
    estado: 'pendiente',
    prioridad: 'baja',
    fechaCreación: new Date('2023-06-12'),
    fechaVencimiento: null,
    etiquetas: ['documentación'],
    asignadoA: null
  },
]);

// Tareas pendientes ordenadas por prioridad
const prioridadOrden = { 'urgente': 0, 'alta': 1, 'media': 2, 'baja': 3 };
const pendientes = tareas
  .where('estado', 'pendiente')
  .sort((a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]);

console.log('Tareas pendientes por prioridad:');
pendientes.each(t => {
  console.log(`[${t.prioridad.toUpperCase()}] ${t.título}`);
});

// Tareas vencidas
const hoy = new Date();
const vencidas = tareas.filter(t => 
  t.estado !== 'completada' && 
  t.estado !== 'cancelada' && 
  t.fechaVencimiento !== null && 
  t.fechaVencimiento < hoy
);

console.log(`Tareas vencidas: ${vencidas.length}`);

// Agrupar por estado
const porEstado = tareas.groupBy('estado');
console.log('Tareas por estado:');
Object.entries(porEstado).forEach(([estado, tareas]) => {
  console.log(`${estado}: ${tareas.length}`);
});

// Tareas por persona
const porPersona = tareas
  .where('asignadoA', '!=', null)
  .groupBy('asignadoA');

console.log('Carga de trabajo por persona:');
Object.entries(porPersona).forEach(([persona, tareas]) => {
  const pendientes = tareas.filter(t => t.estado !== 'completada' && t.estado !== 'cancelada').length;
  console.log(`${persona}: ${pendientes} pendientes de ${tareas.length} totales`);
});

// Estadísticas de etiquetas
const etiquetasUnicas = tareas
  .map(t => t.etiquetas)
  .reduce((todas, etiquetas) => todas.concat(etiquetas), [])
  .unique();

const conteoEtiquetas = {};
tareas.each(tarea => {
  tarea.etiquetas.forEach(etiqueta => {
    conteoEtiquetas[etiqueta] = (conteoEtiquetas[etiqueta] || 0) + 1;
  });
});

console.log('Distribución de etiquetas:');
console.log(conteoEtiquetas);

// Buscar tareas con múltiples criterios
const busquedaAvanzada = tareas.filter(t => 
  (t.estado === 'pendiente' || t.estado === 'en_progreso') &&
  (t.prioridad === 'alta' || t.prioridad === 'urgente') &&
  (t.etiquetas.includes('frontend') || t.etiquetas.includes('backend'))
);

console.log('Resultados de búsqueda avanzada:');
busquedaAvanzada.each(t => {
  console.log(`${t.título} [${t.estado}] [${t.prioridad}]`);
});
```
