# ipfs-block - the unit of data

```js
var Block = require('ipfs-block')
var a = Block(buffer)
var hash = a.hash()
a.hashMatches(hash) // true
```
