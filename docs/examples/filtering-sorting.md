# Filtering & Sorting

Advanced filtering and sorting examples.

```typescript
const result = users
  .filter({ verified: true })
  .where('age', '>=', 21)
  .sort('name', 'asc');
```
