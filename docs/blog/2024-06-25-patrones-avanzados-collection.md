---
slug: patrones-avanzados-collection
title: Patrones avanzados de uso en Arcaelas Collection
authors: [miguel]
tags: [colección, typescript, patrones, rendimiento]
---

# Patrones avanzados de uso en Arcaelas Collection

Arcaelas Collection no es solo una librería para manipular datos, sino una herramienta que permite implementar patrones de diseño avanzados con una sintaxis limpia y expresiva.

<!-- truncate -->

## Patrón Mediador con Collection

El patrón Mediador es ideal cuando necesitas centralizar la comunicación entre varios componentes. Utilizando Collection como mediador, puedes simplificar esta implementación:

```typescript
import { Collection } from '@arcaelas/collection';

// Definición de tipos para nuestro sistema de mensajería
type Mensaje = {
  id: string;
  origen: string;
  destino: string;
  contenido: string;
  timestamp: number;
  leído: boolean;
};

// Mediador basado en Collection
class MediadorMensajes {
  private mensajes = new Collection<Mensaje>([]);
  
  enviarMensaje(origen: string, destino: string, contenido: string): Mensaje {
    const mensaje: Mensaje = {
      id: `msg_${Date.now()}`,
      origen,
      destino,
      contenido,
      timestamp: Date.now(),
      leído: false
    };
    
    this.mensajes.push(mensaje);
    return mensaje;
  }
  
  obtenerMensajesParaUsuario(usuario: string): Collection<Mensaje> {
    return this.mensajes.where(m => m.destino === usuario);
  }
  
  marcarComoLeído(id: string): boolean {
    const mensaje = this.mensajes.find(m => m.id === id);
    if (mensaje) {
      mensaje.leído = true;
      return true;
    }
    return false;
  }
  
  // Método para análisis de comunicación
  obtenerEstadísticasConversación(usuario1: string, usuario2: string) {
    const conversacion = this.mensajes.where(m => 
      (m.origen === usuario1 && m.destino === usuario2) || 
      (m.origen === usuario2 && m.destino === usuario1)
    ).sortBy('timestamp');
    
    return {
      totalMensajes: conversacion.length,
      mensajesNoLeídos: conversacion.where({ leído: false }).length,
      primerMensaje: conversacion.first(),
      últimoMensaje: conversacion.last(),
      tiempoPromedioRespuesta: this.calcularTiempoPromedioRespuesta(conversacion)
    };
  }
  
  private calcularTiempoPromedioRespuesta(conversacion: Collection<Mensaje>): number {
    if (conversacion.length < 2) return 0;
    
    let tiempoTotal = 0;
    let contadorRespuestas = 0;
    
    conversacion.reduce((anterior, actual) => {
      if (anterior && anterior.origen !== actual.origen) {
        tiempoTotal += actual.timestamp - anterior.timestamp;
        contadorRespuestas++;
      }
      return actual;
    });
    
    return contadorRespuestas ? tiempoTotal / contadorRespuestas : 0;
  }
}
```

## Patrón Observador con encadenamiento

Collection permite implementar fácilmente un sistema de observadores con encadenamiento de métodos:

```typescript
import { Collection } from '@arcaelas/collection';

type Observer<T> = (data: T) => void;

class ObservableCollection<T> {
  private collection: Collection<T>;
  private observers = new Collection<Observer<Collection<T>>>([]);
  
  constructor(items: T[] = []) {
    this.collection = new Collection<T>(items);
  }
  
  // Métodos para suscribir/desuscribir observadores
  subscribe(observer: Observer<Collection<T>>): ObservableCollection<T> {
    this.observers.push(observer);
    return this;
  }
  
  unsubscribe(observer: Observer<Collection<T>>): ObservableCollection<T> {
    this.observers = this.observers.filter(o => o !== observer);
    return this;
  }
  
  // Notificar cambios
  private notify(): ObservableCollection<T> {
    this.observers.forEach(observer => observer(this.collection));
    return this;
  }
  
  // Operaciones que modifican la colección
  add(item: T): ObservableCollection<T> {
    this.collection.push(item);
    return this.notify();
  }
  
  remove(predicate: (item: T) => boolean): ObservableCollection<T> {
    this.collection = this.collection.reject(predicate);
    return this.notify();
  }
  
  update(predicate: (item: T) => boolean, updater: (item: T) => T): ObservableCollection<T> {
    this.collection = this.collection.map(item => {
      if (predicate(item)) {
        return updater(item);
      }
      return item;
    });
    return this.notify();
  }
  
  // Acceso a la colección interna para operaciones de consulta
  get(): Collection<T> {
    return this.collection;
  }
}

// Ejemplo de uso
type Tarea = {
  id: string;
  título: string;
  completada: boolean;
};

const gestor = new ObservableCollection<Tarea>([
  { id: '1', título: 'Aprender Collection', completada: false }
]);

// Registrar observadores
gestor.subscribe(colección => {
  console.log('Tareas actualizadas:', colección.toArray());
  console.log('Tareas pendientes:', colección.where({ completada: false }).length);
});

// Realizar operaciones
gestor
  .add({ id: '2', título: 'Implementar Observer', completada: false })
  .update(t => t.id === '1', t => ({ ...t, completada: true }));
```

## Patrón Estrategia para ordenación personalizada

Collection permite implementar fácilmente el patrón Estrategia para ordenaciones complejas:

```typescript
import { Collection } from '@arcaelas/collection';

// Definición de tipos para productos
type Producto = {
  id: string;
  nombre: string;
  precio: number;
  valoración: number;
  ventas: number;
  fecha: Date;
};

// Interfaz para estrategias de ordenación
interface EstrategiaOrdenación {
  ordenar(productos: Collection<Producto>): Collection<Producto>;
  nombre: string;
}

// Implementación de diferentes estrategias
class OrdenarPorPrecioAscendente implements EstrategiaOrdenación {
  nombre = 'Precio: menor a mayor';
  ordenar(productos: Collection<Producto>): Collection<Producto> {
    return productos.sortBy('precio');
  }
}

class OrdenarPorPrecioDescendente implements EstrategiaOrdenación {
  nombre = 'Precio: mayor a menor';
  ordenar(productos: Collection<Producto>): Collection<Producto> {
    return productos.sortByDesc('precio');
  }
}

class OrdenarPorRelevancia implements EstrategiaOrdenación {
  nombre = 'Relevancia';
  ordenar(productos: Collection<Producto>): Collection<Producto> {
    // Algoritmo personalizado que combina valoración y ventas
    return productos.sort((a, b) => {
      const scoreA = a.valoración * 0.7 + (Math.log(a.ventas) * 0.3);
      const scoreB = b.valoración * 0.7 + (Math.log(b.ventas) * 0.3);
      return scoreB - scoreA; // Orden descendente
    });
  }
}

class OrdenarPorNovedad implements EstrategiaOrdenación {
  nombre = 'Más recientes primero';
  ordenar(productos: Collection<Producto>): Collection<Producto> {
    return productos.sortByDesc('fecha');
  }
}

// Uso del contexto con estrategias intercambiables
class CatálogoProductos {
  private productos: Collection<Producto>;
  private estrategiaActual: EstrategiaOrdenación;
  private estrategiasDisponibles: Collection<EstrategiaOrdenación>;
  
  constructor(productos: Producto[]) {
    this.productos = new Collection(productos);
    
    // Inicializar estrategias disponibles
    this.estrategiasDisponibles = new Collection([
      new OrdenarPorRelevancia(),
      new OrdenarPorPrecioAscendente(),
      new OrdenarPorPrecioDescendente(),
      new OrdenarPorNovedad()
    ]);
    
    // Estrategia por defecto
    this.estrategiaActual = this.estrategiasDisponibles.first();
  }
  
  cambiarEstrategia(nombreEstrategia: string): boolean {
    const estrategia = this.estrategiasDisponibles.find(e => e.nombre === nombreEstrategia);
    if (estrategia) {
      this.estrategiaActual = estrategia;
      return true;
    }
    return false;
  }
  
  obtenerEstrategiasDisponibles(): string[] {
    return this.estrategiasDisponibles.map(e => e.nombre).toArray();
  }
  
  obtenerProductosOrdenados(): Collection<Producto> {
    return this.estrategiaActual.ordenar(this.productos);
  }
  
  // Método para filtrar y luego ordenar
  obtenerProductosFiltradosYOrdenados(filtro: (p: Producto) => boolean): Collection<Producto> {
    return this.estrategiaActual.ordenar(this.productos.where(filtro));
  }
}
```

## Implementando un Repositorio con Collection

Collection facilita la implementación del patrón Repositorio para acceso a datos:

```typescript
import { Collection } from '@arcaelas/collection';

// Definir entidad
interface Entidad {
  id: string;
}

// Repositorio genérico
abstract class Repositorio<T extends Entidad> {
  protected colección: Collection<T>;
  
  constructor(datos: T[] = []) {
    this.colección = new Collection<T>(datos);
  }
  
  // Métodos CRUD básicos
  obtenerTodos(): Collection<T> {
    return this.colección;
  }
  
  obtenerPorId(id: string): T | undefined {
    return this.colección.find(entidad => entidad.id === id);
  }
  
  crear(entidad: T): T {
    if (this.obtenerPorId(entidad.id)) {
      throw new Error(`Entidad con ID ${entidad.id} ya existe`);
    }
    this.colección.push(entidad);
    return entidad;
  }
  
  actualizar(entidad: T): boolean {
    const índice = this.colección.findIndex(e => e.id === entidad.id);
    if (índice === -1) return false;
    
    // Actualizar la entidad en la colección
    this.colección[índice] = entidad;
    return true;
  }
  
  eliminar(id: string): boolean {
    const longitudAnterior = this.colección.length;
    this.colección = this.colección.reject(e => e.id === id);
    return longitudAnterior > this.colección.length;
  }
  
  // Método para realizar consultas personalizadas
  consultar(predicado: (entidad: T) => boolean): Collection<T> {
    return this.colección.where(predicado);
  }
}

// Ejemplo de implementación concreta
interface Usuario extends Entidad {
  nombre: string;
  email: string;
  rol: string;
}

class RepositorioUsuarios extends Repositorio<Usuario> {
  // Métodos específicos para usuarios
  obtenerPorEmail(email: string): Usuario | undefined {
    return this.colección.find(u => u.email === email);
  }
  
  obtenerPorRol(rol: string): Collection<Usuario> {
    return this.colección.where({ rol });
  }
  
  cambiarRol(id: string, nuevoRol: string): boolean {
    const usuario = this.obtenerPorId(id);
    if (!usuario) return false;
    
    usuario.rol = nuevoRol;
    return this.actualizar(usuario);
  }
}
```

## Conclusión

Arcaelas Collection facilita la implementación de patrones de diseño avanzados gracias a su API fluida y expresiva. Al combinar estos patrones con las capacidades de filtrado, mapeo y agregación de Collection, puedes desarrollar aplicaciones más mantenibles y escalables.

Estos patrones son especialmente útiles cuando trabajas con aplicaciones de cierta complejidad, donde la manipulación de datos necesita ser organizada siguiendo principios de diseño sólidos.

¿Has implementado otros patrones con Arcaelas Collection? ¡Comparte tu experiencia en los comentarios!
