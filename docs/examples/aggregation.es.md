# Agregación

Examples of aggregation operations.

```typescript
const totalRevenue = orders.sum('total');
const avgOrderValue = orders.sum('total') / orders.length;
const byStatus = orders.groupBy('status');
```
