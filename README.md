
![Arcaelas Insiders Banner](https://raw.githubusercontent.com/arcaelas/dist/main/banner/svg/dark.svg#gh-dark-mode-only)

![Arcaelas Insiders Banner](https://raw.githubusercontent.com/arcaelas/dist/main/banner/svg/light.svg#gh-light-mode-only)

  

# Welcome to Arcaelas Insiders!

Hello, if this is your first time reading the **[Arcaelas Insiders](https://github.com/arcaelas)**  **documentation**, let me tell you that you have found a good place to learn.  

**Our team** and *community* are happy to write and make methods simple to implement and understand, but I think you already know that.

> The documentation for this tool is open to edits and suggestions.

Let's start with the basic implementation steps.
```bash
> npm i --save @arcaelas/collection
> yarn add --save @arcaelas/collection
```


## Implementation
```javascript
// Class Import Statement
import Collection from  '@arcaelas/Collection'

// Function import statement
import { Collection } from  '@arcaelas/collection'

// EsModule
const Collection =  require('@arcaelas/collection')
```


## Motivation
In object-oriented programming we find common situations, such as those where we want to order, filter and modify elements of a list, however the "Array Prototypes" are not very complete in some cases, for these situations the **Arcaelas Insiders** team has designed useful tools that allow these actions within "Collections".

### Curiosities
As an interesting part of this tool, we have the B-JSON notation that Atlas implements in its MongoDB database engine, only some of them are implemented here, but we will explain how to extend them and create your own validators.


## Get Started
```typescript
import Collection from "@arcaelas/collection"

const collection = new Collection([ ... ])
```

### **find()**
> All matched elements fro collection, you can use callback or QueryHandler:
```typescript
// Using callback to filtering...
collection.find(item=>{
	return item.age >= 18;
});

// or match expressions...
collection.find({
	age:{ $gte: 18 }
});

// veteran level.
collection.find({
	name: /Alejandro/,
	skills:{
		$contains: "Liberty"
	},
	gender:{
		$not:{
			$in: ['animal','fruit'],
		}
	},
	work:{
		$not:{
			$in: ["work", "without", "coffe"]
		}
	}
});
```

### **not()**
> Get all elements that not matched with expression or handler.
```typescript
users.find({
	online: { $not: false }
})
user.not({
	online: false
})
```

### **first()**
> Get first matched element, using **QueryHandler**
```typescript
users.first({
	_id: "...",
	age:{ $gte: 18 },
	role:{
		$not:{
			$in:["admin"]
		}
	}
})
```

### **last()**
> Get last matched element, using **QueryHandler**
```typescript
users.last({
	_id: "...",
	age:{ $gte: 18 },
	role:{
		$not:{
			$in:["admin"]
		}
	}
})
```

### **where()**
> Use this shorthand to filter items
```typescript
const offline = users.where("online", false)
const online = users.where("online", "==", false)
```

### **whereNot()**
> Is opposite of **where()**
```typescript
const offline = users.whereNot("online", true)
const online = users.whereNot("online", "==", true)
```

### **update()**
> Updates information for items that match a specific or general filter expression.
```typescript
// set all "item.status" to "false"
collection.update({ status: false })

// Filtering
collection.update({
	expireAt: { 
	   $lte: new Date() // where expireAt is past
	}
}, {
	online: false // Set online to false
})
```

### **delete()**
> Remove matched elementos from collection
> **NOTE:** This method mutate collection
```typescript
// Remove all elements where "deletedAt" is not "nullable"
collection.delete({
	deletedAt: {
		$exists: true
	}
})
```




### **all()**
> Return all elements as Plain JSON
```typescript
collection.all() // Expected: [ {...}, ... ]
```

### **collect()**
> Create a collection with parent collection prototypes.
```typescript
collection.collect([...]) // Expected: Collection
```

### **count()**
> Count items length into collection.
```typescript
collection.count() // 0 - Infinity
```

### **dd()**
> The dd method will console.log the collection and exit the current process
```typescript
collection.dd()
// Collection { items: [ 1, 2, 3 ] }
// (Exits node.js process)
```

### **dump()**
> Print collection and continue.
```typescript
collection.dump()
```

### **max()**
> The max method returns the maximum value of a given key.
```typescript
pictures.max("upvotes")
```

### **min()**
> The min method returns the minimum value of a given key.
```typescript
pictures.min("upvotes")
```

### **random()**
> Get random elements, with the argument "length" the number of elements is indicated.
```typescript
collection.random() // All elements random sorted
collection.random(2) // Two random elements
```

### **shuffle()**
> This method set items order as random and mutate collection.
```typescript
collection.shuffle()
```

### **sum()**
> Sum the elements values according to a specific key.
```typescript
const to_pay = shop_cart.sum("articles.price")
```

### **chunk()**
> Break the collection into multiple, smaller collections of a given size.
```typescript
paginate = posts.chunks(100)
```

### **countBy()**
> Group items by key and count
```typescript
products.countBy("buyed")
```

### **each()**
> Iterate over each collection elements, if return false break iteration
```typescript
sockets.each(socket=>{
	if( !socket.online ) return false// This stop iteration
	else if( socket.name ) return // Iteration skip current cycle, not stoped.
	socket.send("ping")
})
```

### **forget()**
> Remove a specific fields from each items
```typescript
	sessions.forget("access_token")
```

### **groupBy()**
> Group items by key
```typescript
const online = followers.grupBy("online") // { ... }
const offline = online.false
```

### **paginate()**
> Wrap element in X number of items and return specific page.
```typescript
const page_one = post.paginate(1) // 1 - 20
const page_two = post.paginate(2, 500) // 501 - 1000
```

### **unique()**
> Filter elements and return only elements that key/value is unique.
```typescript
const unlinked = links.unique("_id")
const removed = trash.unique((item)=>{
	return item.id
})
```

### **macro()**
> Adding custom methods for current collection.
```typescript
collection.macro("getName", (item)=>{
	return item.name
}) // Expected: Collection

collection.getName() // Expected: [ Joe, Julia, ... ]

```

### **join()**
> Returns a string with the values of the specified key in each object.
```typescript

collection.join("email")
// dany@email.com,julia@email.com,rose@email.com

collection.join("folders", "-")
// dany@email.com-julia@email.com-rose@email.com

collection.join("email", ", ", " and ")
// dany@email.com, julia@email.com and rose@email.com
```


### **sort()**
> The sort method sorts the collection.
```typescript
collection.sort((a, b)=> a.age > b.age ? 1 : -1)
// or
collection.sort("age", "desc")
```

### **every()**
> "Every" can verify that all elements satisfy a certain expression.
> Read [Array.prototype.every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
```typescript
// Check if every items have "_id" field
collection.every('_id')

// All items have "status" == "enabled"
collection.every('status', 'enabled')

// All prices items is greater than zero "0"
collection.every('price', '>', 0)

// Using QueryHandler to match every items.
collection.every({
	expired: { $not: true } // All "expired" items is ddifferent that "true"
})
```

### macro (static)
> Adding custom method for all Collections
```typescript
Collection.macro("get", (item, key)=>{...})

const pictures = new Collection([...])

pictures.get("url") // Expected: [...]
```

### concat
> Read [Array.prototype.concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)

### map
> Read [Array.prototype.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)

### pop
> Read [Array.prototype.pop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)

### slice
> Read [Array.prototype.slice](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)

### splice
> Read [Array.prototype.splice](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)

### shift
> Read [Array.prototype.shift](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)

### unshift
>  Read [Array.prototype.unshift](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)

<hr/>

<div  style="text-align:center;margin-top:50px;">
	<p  align="center">
		<img  src="https://raw.githubusercontent.com/arcaelas/dist/main/logo/svg/64.svg"  height="32px">
	<p>

¿Want to discuss any of my open source projects, or something else?Send me a direct message on [Twitter](https://twitter.com/arcaelas).</br> If you already use these libraries and want to support us to continue development, you can sponsor us at [Github Sponsors](https://github.com/sponsors/arcaelas).

</div>