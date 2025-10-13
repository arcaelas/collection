# Extending Collection

Learn how to extend Collection with custom functionality.

## Creating Subclasses
## Adding Macros
## Custom Operators
## Plugin Architecture

```typescript
class UserCollection extends Collection<User> {
  admins() {
    return this.filter({ role: 'admin' });
  }
}
```
