# Query Operators

Master MongoDB-style query operators in `@arcaelas/collection`.

## Comparison Operators

### $eq (Equal)

```typescript
collection.filter({ age: { $eq: 25 } });
// or shorthand
collection.filter({ age: 25 });
```

### $gt (Greater Than)

```typescript
collection.filter({ age: { $gt: 18 } });
```

### $gte (Greater Than or Equal)

```typescript
collection.filter({ age: { $gte: 18 } });
```

### $lt (Less Than)

```typescript
collection.filter({ age: { $lt: 65 } });
```

### $lte (Less Than or Equal)

```typescript
collection.filter({ age: { $lte: 65 } });
```

## Logical Operators

### $not (Not)

```typescript
collection.filter({ 
  $not: { age: { $lt: 18 } }
});
```

### $in (In Array)

```typescript
collection.filter({
  status: { $in: ['active', 'pending', 'verified'] }
});
```

### $contains (Contains)

```typescript
collection.filter({
  skills: { $contains: 'TypeScript' }
});
```

## Operator Aliases

For convenience, use shorthand aliases:

```typescript
// These are equivalent
collection.where('age', '>=', 18);
collection.filter({ age: { $gte: 18 } });
```

| Alias | Operator | Meaning |
|-------|----------|---------|
| `=` | `$eq` | Equal |
| `!=` | `$not` | Not equal |
| `>` | `$gt` | Greater than |
| `<` | `$lt` | Less than |
| `>=` | `$gte` | Greater or equal |
| `<=` | `$lte` | Less or equal |
| `in` | `$in` | In array |
| `includes` | `$includes` | Contains |

Next: [Aggregation Methods](aggregation-methods.md)
