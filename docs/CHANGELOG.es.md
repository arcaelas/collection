# Registro de Cambios

Todos los cambios notables en `@arcaelas/collection` se documentarán en este archivo.

## [2.1.2] - 2025-01-15

### Corregido
- Inferencia de tipos TypeScript corregida para sobrecargas del método `every()`
- Tipo de retorno corregido para el método `collect()` para mantener tipos genéricos
- Validación de consultas corregida para objetos anidados

### Mejorado
- Rendimiento mejorado del método `unique()` con grandes conjuntos de datos
- Compilación de consultas optimizada para operaciones de filtro repetidas
- Mejores mensajes de error para uso de operadores inválidos

## [2.1.1] - 2024-12-20

### Agregado
- Nuevo método `every()` con múltiples firmas de sobrecarga
- Soporte para notación de puntos en métodos `where()` y `whereNot()`
- Método `update()` mejorado con soporte de callback

## [2.1.0] - 2024-11-10

### Agregado
- Operadores de consulta estilo MongoDB
- Alias de operadores de consulta
- Métodos `macro()` estático e de instancia
- Método `stringify()` para serialización JSON

## [2.0.0] - 2024-09-15

### Agregado
- Reescritura completa en TypeScript
- Soporte completo de tipos genéricos
- Nuevos métodos de agregación y transformación

## Soporte de Versiones

| Versión | Estado | Node.js | TypeScript |
|---------|--------|---------|------------|
| 2.1.x   | Activa | 14+ | 4.x+ |
| 2.0.x   | Mantenimiento | 14+ | 4.x+ |
| 1.x     | Fin de vida | 12+ | 3.x+ |
