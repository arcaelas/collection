# Changelog

All notable changes to `@arcaelas/collection` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2025-01-15

### Fixed
- Fixed TypeScript type inference for `every()` method overloads
- Corrected return type for `collect()` method to maintain generic types
- Fixed query validation for nested objects

### Improved
- Enhanced performance for `unique()` method with large datasets
- Optimized query compilation for repeated filter operations
- Better error messages for invalid operator usage

## [2.1.1] - 2024-12-20

### Added
- New `every()` method with multiple overload signatures
- Support for dot-notation in `where()` and `whereNot()` methods
- Enhanced `update()` method with callback support

### Fixed
- Fixed `sort()` method handling of undefined values
- Corrected `paginate()` method edge cases

## [2.1.0] - 2024-11-10

### Added
- MongoDB-style query operators: `$eq`, `$not`, `$gt`, `$lt`, `$gte`, `$lte`, `$in`, `$includes`
- Query operator aliases for convenience: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `includes`
- New `macro()` static and instance methods for extensibility
- `stringify()` method for JSON serialization

### Changed
- Improved TypeScript generic types for better type inference
- Refactored query engine for better performance

### Deprecated
- None

## [2.0.1] - 2024-10-01

### Fixed
- Fixed npm package build configuration
- Corrected TypeScript declaration exports

## [2.0.0] - 2024-09-15

### Added
- Complete TypeScript rewrite
- Full generic type support: `Collection<T, V>`
- New methods: `chunk()`, `countBy()`, `groupBy()`, `unique()`
- Debug methods: `dd()` and `dump()`
- Aggregation methods: `max()`, `min()`, `sum()`
- Random methods: `random()` and `shuffle()`

### Changed
- **Breaking**: Minimum Node.js version is now 14.x
- **Breaking**: ES2020 target for better performance
- Improved `filter()` to support both callbacks and query objects
- Enhanced `update()` with merge functionality

### Removed
- **Breaking**: Removed deprecated `pluck()` method (use `map()` instead)
- **Breaking**: Removed legacy callback format

## [1.5.0] - 2024-06-01

### Added
- `where()` and `whereNot()` convenience methods
- `not()` method for inverse filtering
- `forget()` method to remove fields
- `first()` and `last()` methods with query support

### Improved
- Better documentation with more examples
- Performance optimizations for large collections

## [1.4.0] - 2024-03-15

### Added
- `update()` method for bulk updates
- `delete()` method for removing elements
- `collect()` method to create new instances

### Fixed
- Fixed collection mutation issues
- Corrected prototype chain for extended collections

## [1.3.0] - 2024-01-10

### Added
- `paginate()` method for pagination support
- `each()` method with break support

### Improved
- Enhanced error handling
- Better TypeScript types

## [1.2.0] - 2023-11-01

### Added
- Initial query DSL support
- Basic filtering with objects

## [1.1.0] - 2023-09-15

### Added
- `sort()` method with direction support
- Aggregation methods

## [1.0.0] - 2023-08-01

### Added
- Initial release
- Basic Collection class extending Array
- Core filtering and transformation methods

---

## Version Support

| Version | Status | Node.js | TypeScript |
|---------|--------|---------|------------|
| 2.1.x   | Active | 14+ | 4.x+ |
| 2.0.x   | Maintenance | 14+ | 4.x+ |
| 1.x     | End of Life | 12+ | 3.x+ |

## Migration Guides

### Migrating from 1.x to 2.x

**Breaking Changes:**

1. **Minimum Node.js version increased to 14.x**
   ```javascript
   // Ensure you're using Node.js 14 or higher
   node --version  // Should be v14.0.0 or higher
   ```

2. **ES2020 target**
   ```json
   // Update your tsconfig.json
   {
     "compilerOptions": {
       "target": "ES2020"
     }
   }
   ```

3. **Removed `pluck()` method**
   ```typescript
   // Before (1.x)
   collection.pluck('name');

   // After (2.x)
   collection.map(item => item.name);
   ```

4. **New generic type signatures**
   ```typescript
   // Before (1.x)
   const collection = new Collection(items);

   // After (2.x) - with type safety
   interface User {
     name: string;
     age: number;
   }
   const collection = new Collection<User>(items);
   ```

### Upgrading to 2.1.x

**New Features:**

1. **Query operators**
   ```typescript
   // New MongoDB-style operators
   collection.filter({
     age: { $gte: 18 },
     status: { $in: ['active', 'pending'] }
   });
   ```

2. **Method overloads**
   ```typescript
   // every() now supports multiple signatures
   collection.every('active');
   collection.every('age', '>=', 18);
   collection.every({ verified: true });
   ```

## Future Roadmap

### Planned for 2.2.0
- [ ] LazyCollection with generator support
- [ ] AsyncCollection for promises and streams
- [ ] Additional query operators: `$regex`, `$exists`, `$size`
- [ ] Performance improvements for large datasets

### Planned for 3.0.0
- [ ] Remove lodash dependency
- [ ] Native ES modules only
- [ ] Improved tree-shaking
- [ ] YAML/CSV serialization support

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/arcaelas/collection/blob/main/CONTRIBUTING.md) for details.

## Support

- **Documentation**: [https://arcaelas.github.io/collection](https://arcaelas.github.io/collection)
- **Issues**: [GitHub Issues](https://github.com/arcaelas/collection/issues)
- **Discussions**: [GitHub Discussions](https://github.com/arcaelas/collection/discussions)
