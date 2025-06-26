---
slug: caso-practico-analisis-datos
title: "Caso práctico: Análisis de datos con Arcaelas Collection"
authors: [miguel]
tags: [colección, casos-uso, rendimiento, typescript]
---

# Caso práctico: Análisis de datos con Arcaelas Collection

En este artículo exploraremos un caso de uso real de Arcaelas Collection aplicado al análisis de datos en una aplicación de comercio electrónico, mostrando cómo la API fluida y el tipado fuerte pueden transformar el código en soluciones más elegantes y mantenibles.

<!-- truncate -->

## El desafío: Análisis de ventas en un e-commerce

Imaginemos que estamos desarrollando el panel de análisis para una plataforma de comercio electrónico y necesitamos implementar funcionalidades para:

1. Analizar tendencias de ventas por período y categoría
2. Identificar productos más vendidos y rentables
3. Segmentar clientes y analizar comportamientos de compra
4. Generar informes agregados con métricas clave

Estas operaciones implican manipular grandes volúmenes de datos con estructuras complejas, filtrarlos, agruparlos y transformarlos.

## Modelado de datos

Primero, definamos los tipos de datos con los que trabajaremos:

```typescript
// Tipos para nuestro análisis
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoría: string;
  costo: number;
  stock: number;
  proveedor: string;
}

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  fechaRegistro: Date;
  ubicación: string;
  segmento: 'nuevo' | 'ocasional' | 'frecuente' | 'vip';
}

interface Venta {
  id: string;
  fecha: Date;
  clienteId: string;
  productos: Array<{
    productoId: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
  }>;
  total: number;
  método_pago: string;
  estado: 'completada' | 'cancelada' | 'reembolsada';
}
```

## Implementación tradicional vs. Collection

### Análisis de ventas por período y categoría

**Implementación tradicional:**

```typescript
function analizarVentasPorPeriodo(
  ventas: Venta[], 
  productos: Producto[],
  inicio: Date, 
  fin: Date, 
  categoría?: string
) {
  // Filtrar ventas por período
  const ventasFiltradas = ventas.filter(v => 
    v.fecha >= inicio && 
    v.fecha <= fin && 
    v.estado === 'completada'
  );
  
  // Preparar resultado
  const resultado: Record<string, number> = {};
  
  // Procesar cada venta
  ventasFiltradas.forEach(venta => {
    venta.productos.forEach(item => {
      const producto = productos.find(p => p.id === item.productoId);
      if (producto && (!categoría || producto.categoría === categoría)) {
        const mes = `${venta.fecha.getMonth() + 1}-${venta.fecha.getFullYear()}`;
        if (!resultado[mes]) resultado[mes] = 0;
        resultado[mes] += item.cantidad * item.precioUnitario;
      }
    });
  });
  
  return Object.entries(resultado)
    .map(([periodo, total]) => ({ periodo, total }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
```

**Con Arcaelas Collection:**

```typescript
import { Collection } from '@arcaelas/collection';

function analizarVentasPorPeriodo(
  ventas: Venta[], 
  productos: Producto[],
  inicio: Date, 
  fin: Date, 
  categoría?: string
) {
  const productosCollection = new Collection(productos);
  
  return new Collection(ventas)
    // Filtrar por período y estado
    .where(v => v.fecha >= inicio && v.fecha <= fin && v.estado === 'completada')
    // Expandir cada producto de cada venta
    .flatMap(venta => 
      venta.productos.map(item => ({
        fecha: venta.fecha,
        productoId: item.productoId,
        importe: item.cantidad * item.precioUnitario
      }))
    )
    // Filtrar por categoría si se especifica
    .filter(item => {
      if (!categoría) return true;
      const producto = productosCollection.find(p => p.id === item.productoId);
      return producto?.categoría === categoría;
    })
    // Agregar período (mes-año)
    .map(item => ({
      ...item,
      periodo: `${item.fecha.getMonth() + 1}-${item.fecha.getFullYear()}`
    }))
    // Agrupar por período y sumar importes
    .groupBy('periodo')
    .map(grupo => ({
      periodo: grupo.key,
      total: grupo.items.sum('importe')
    }))
    // Ordenar por período
    .sortBy('periodo');
}
```

### Productos más vendidos y rentables

**Implementación tradicional:**

```typescript
function obtenerProductosMasRentables(ventas: Venta[], productos: Producto[], límite = 10) {
  // Contabilizar ventas por producto
  const ventasPorProducto: Record<string, { unidades: number, ingresos: number }> = {};
  
  ventas.forEach(venta => {
    if (venta.estado !== 'completada') return;
    
    venta.productos.forEach(item => {
      if (!ventasPorProducto[item.productoId]) {
        ventasPorProducto[item.productoId] = { unidades: 0, ingresos: 0 };
      }
      ventasPorProducto[item.productoId].unidades += item.cantidad;
      ventasPorProducto[item.productoId].ingresos += item.cantidad * item.precioUnitario;
    });
  });
  
  // Calcular rentabilidad
  const resultados = productos.map(producto => {
    const ventas = ventasPorProducto[producto.id] || { unidades: 0, ingresos: 0 };
    const costoTotal = ventas.unidades * producto.costo;
    const rentabilidad = ventas.ingresos - costoTotal;
    const margen = ventas.ingresos > 0 ? (rentabilidad / ventas.ingresos) * 100 : 0;
    
    return {
      id: producto.id,
      nombre: producto.nombre,
      categoría: producto.categoría,
      unidadesVendidas: ventas.unidades,
      ingresos: ventas.ingresos,
      rentabilidad,
      margen
    };
  });
  
  // Ordenar y limitar resultados
  return resultados
    .sort((a, b) => b.rentabilidad - a.rentabilidad)
    .slice(0, límite);
}
```

**Con Arcaelas Collection:**

```typescript
function obtenerProductosMasRentables(ventas: Venta[], productos: Producto[], límite = 10) {
  const ventasCollection = new Collection(ventas).where({ estado: 'completada' });
  
  // Agregar ventas por producto
  const ventasPorProducto = ventasCollection
    .flatMap(v => v.productos)
    .groupBy('productoId')
    .map(grupo => ({
      productoId: grupo.key,
      unidades: grupo.items.sum('cantidad'),
      ingresos: grupo.items.sum(item => item.cantidad * item.precioUnitario)
    }))
    .keyBy('productoId');
  
  // Calcular rentabilidad para cada producto
  return new Collection(productos)
    .map(producto => {
      const ventas = ventasPorProducto.get(producto.id) || { unidades: 0, ingresos: 0 };
      const costoTotal = ventas.unidades * producto.costo;
      const rentabilidad = ventas.ingresos - costoTotal;
      
      return {
        id: producto.id,
        nombre: producto.nombre,
        categoría: producto.categoría,
        unidadesVendidas: ventas.unidades,
        ingresos: ventas.ingresos,
        rentabilidad,
        margen: ventas.ingresos > 0 ? (rentabilidad / ventas.ingresos) * 100 : 0
      };
    })
    .sortByDesc('rentabilidad')
    .take(límite);
}
```

### Segmentación de clientes

**Implementación tradicional:**

```typescript
function segmentarClientes(clientes: Cliente[], ventas: Venta[]) {
  const resultados: Record<string, number> = {
    nuevo: 0,
    ocasional: 0,
    frecuente: 0,
    vip: 0
  };
  
  // Contar clientes por segmento
  clientes.forEach(cliente => {
    resultados[cliente.segmento]++;
  });
  
  // Calcular valor medio por segmento
  const ventasPorCliente: Record<string, number[]> = {
    nuevo: [],
    ocasional: [],
    frecuente: [],
    vip: []
  };
  
  // Agrupar ventas por cliente
  const ventasAgrupadas: Record<string, Venta[]> = {};
  ventas.forEach(venta => {
    if (venta.estado !== 'completada') return;
    if (!ventasAgrupadas[venta.clienteId]) {
      ventasAgrupadas[venta.clienteId] = [];
    }
    ventasAgrupadas[venta.clienteId].push(venta);
  });
  
  // Calcular valor medio de compra por segmento
  clientes.forEach(cliente => {
    const clienteVentas = ventasAgrupadas[cliente.id] || [];
    const totalCompras = clienteVentas.reduce((suma, v) => suma + v.total, 0);
    if (clienteVentas.length > 0) {
      ventasPorCliente[cliente.segmento].push(totalCompras);
    }
  });
  
  // Calcular promedios
  const promedios: Record<string, number> = {};
  for (const segmento in ventasPorCliente) {
    const valores = ventasPorCliente[segmento];
    promedios[segmento] = valores.length > 0 
      ? valores.reduce((sum, val) => sum + val, 0) / valores.length 
      : 0;
  }
  
  return {
    distribución: resultados,
    valorMedio: promedios
  };
}
```

**Con Arcaelas Collection:**

```typescript
function segmentarClientes(clientes: Cliente[], ventas: Venta[]) {
  const clientesCollection = new Collection(clientes);
  const ventasCollection = new Collection(ventas).where({ estado: 'completada' });
  
  // Distribución por segmento
  const distribución = clientesCollection
    .countBy('segmento');
  
  // Valor medio por segmento
  const valorMedio = clientesCollection
    .map(cliente => ({
      cliente,
      ventas: ventasCollection
        .where({ clienteId: cliente.id })
        .sum('total')
    }))
    .where(item => item.ventas > 0)
    .groupBy(item => item.cliente.segmento)
    .map(grupo => ({
      segmento: grupo.key,
      valorMedio: grupo.items.average('ventas')
    }))
    .keyBy('segmento')
    .map(item => item.valorMedio)
    .toObject();
  
  return {
    distribución,
    valorMedio
  };
}
```

## Generación de informes con datos agregados

Para finalizar, veamos cómo crear un informe completo de rendimiento del negocio:

```typescript
import { Collection } from '@arcaelas/collection';

function generarInformeRendimiento(ventas: Venta[], productos: Producto[], clientes: Cliente[], periodo: { inicio: Date, fin: Date }) {
  const ventasCollection = new Collection(ventas)
    .where(v => v.fecha >= periodo.inicio && v.fecha <= periodo.fin);
  
  const ventasCompletadas = ventasCollection.where({ estado: 'completada' });
  const ventasCanceladas = ventasCollection.where({ estado: 'cancelada' });
  
  // Métricas generales
  const ingresoTotal = ventasCompletadas.sum('total');
  const numeroVentas = ventasCompletadas.length;
  const ticketMedio = numeroVentas > 0 ? ingresoTotal / numeroVentas : 0;
  const tasaCancelación = ventasCollection.length > 0 
    ? (ventasCanceladas.length / ventasCollection.length) * 100 
    : 0;
  
  // Ventas por día
  const ventasPorDía = ventasCompletadas
    .groupBy(v => v.fecha.toISOString().substring(0, 10))
    .map(grupo => ({
      fecha: grupo.key,
      ventas: grupo.items.length,
      ingresos: grupo.items.sum('total')
    }))
    .sortBy('fecha');
  
  // Top categorías
  const productosCollection = new Collection(productos);
  const topCategorías = ventasCompletadas
    .flatMap(v => v.productos.map(p => ({
      productoId: p.productoId,
      importe: p.cantidad * p.precioUnitario
    })))
    .map(item => {
      const producto = productosCollection.find(p => p.id === item.productoId);
      return {
        categoría: producto?.categoría || 'Desconocida',
        importe: item.importe
      };
    })
    .groupBy('categoría')
    .map(grupo => ({
      categoría: grupo.key,
      importe: grupo.items.sum('importe')
    }))
    .sortByDesc('importe')
    .take(5);
  
  // Tasa de conversión por segmento
  const clientesCollection = new Collection(clientes);
  const conversionPorSegmento = clientesCollection
    .groupBy('segmento')
    .map(grupo => {
      const clientesIds = grupo.items.map(c => c.id);
      const compras = ventasCompletadas.where(v => clientesIds.includes(v.clienteId));
      const clientesCompraron = new Collection(compras.map(c => c.clienteId)).unique().length;
      
      return {
        segmento: grupo.key,
        total: grupo.items.length,
        compraron: clientesCompraron,
        tasa: (clientesCompraron / grupo.items.length) * 100
      };
    })
    .sortByDesc('tasa');
  
  return {
    período: {
      inicio: periodo.inicio,
      fin: periodo.fin
    },
    general: {
      ingresoTotal,
      numeroVentas,
      ticketMedio,
      tasaCancelación
    },
    tendencias: {
      ventasPorDía,
      topCategorías,
      conversionPorSegmento
    }
  };
}
```

## Beneficios observados

Al comparar ambos enfoques, podemos observar varias ventajas clave de utilizar Arcaelas Collection:

1. **Código más expresivo**: Las operaciones encadenadas comunican claramente el flujo de transformación de datos.

2. **Menos código boilerplate**: No hay necesidad de crear colecciones temporales ni gestionar manualmente estructuras intermedias.

3. **Mejor mantenibilidad**: La estructura declarativa es más fácil de comprender y modificar.

4. **Tipado fuerte**: TypeScript proporciona autocompletado y detección temprana de errores en toda la cadena.

5. **Rendimiento optimizado**: Las operaciones están optimizadas para conjuntos de datos grandes.

## Conclusión

Este caso práctico demuestra cómo Arcaelas Collection puede transformar código complejo de análisis de datos en código más limpio, expresivo y mantenible. Al utilizar la API fluida y las capacidades de agregación, podemos:

- Reducir drásticamente la cantidad de código necesario
- Mejorar la legibilidad y mantenibilidad
- Mantener el tipado fuerte en todas las operaciones
- Obtener mejor rendimiento en conjuntos grandes de datos

Para equipos que trabajan con análisis de datos en TypeScript, Arcaelas Collection ofrece una alternativa potente a los métodos tradicionales, reduciendo la complejidad y el riesgo de errores.

¿Has implementado análisis de datos con otras librerías? ¿Cómo se compara tu experiencia con la API de Arcaelas Collection? ¡Comparte tus pensamientos en los comentarios!
