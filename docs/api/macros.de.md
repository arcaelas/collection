# Makros

Extend Collection with custom methods using macros.

```typescript
Collection.macro('pluck', function(key) {
  return this.map(item => item[key]);
});

collection.pluck('name');
```
