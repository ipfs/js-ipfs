## Install

### npm

This project is available through [npm](https://www.npmjs.com/). To install:

```bash
$ npm install ipfs --save
```

Requires npm@3 and node >= 4, tested on OSX & Linux, expected to work on Windows.

### Use in Node.js

To include this project programmatically:

```js
var IPFS = require('ipfs')

var node = new IPFS()
```

### Through command line tool

In order to use js-ipfs as a CLI, you must install it with the `global` flag. Run the following (even if you have ipfs installed locally):

```bash
$ npm install ipfs --global
```

The CLI is available by using the command `jsipfs` in your terminal. This is aliased, instead of using `ipfs`, to make sure it does not conflict with the Go implementation.

### Use in the browser with browserify, webpack or any bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust the asset management process.

```js
var ipfs = require('ipfs');
```

### Use in a browser using a script tag

Loading this module in a browser (using a `<script>` tag) makes the `Ipfs` object available in the global namespace.

The last published version of the package become [available for download](https://unpkg.com/ipfs/dist/) from [unpkg](https://unpkg.com/) and thus you may use it as the source:


```html
<!-- loading the minified version -->
<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version -->
<script src="https://unpkg.com/ipfs/dist/index.js"></script>
```
