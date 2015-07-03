# ipfs-storage - storage modules for ipfs

IPFS nodes only require a very simple key-value store.

```js
var storage = require('ipfs-storage')
storage.put("hello", "world")
console.log(storage.get("hello"))
// "world"
```
