# ipfs-mfs JavaScript Implementation

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Build Status](https://travis-ci.org/ipfs/js-ipfs-mfs.svg?style=flat-square&branch=master)](https://travis-ci.org/ipfs/js-ipfs-mfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-mfs/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-mfs?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-mfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-mfs)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> JavaScript implementation of the IPFS Mutable File System

[The MFS spec can be found inside the ipfs/specs repository](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#mutable-file-system)

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Contribute](#contribute)
- [Changelog](#changelog)
- [License](#license)

## Install

### npm

```sh
> npm i ipfs-mfs
```

### Use in Node.js

```JavaScript
const mfs = require('ipfs-mfs')
```

### Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is an ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
const mfs = require('ipfs-mfs')
```

### Use in a browser using a script tag

Loading this module through a script tag will make the `mfs` obj available in the global namespace.

```html
<script src="https://npmcdn.com/ipfs-mfs/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/ipfs-mfs/dist/index.js"></script>
```

## Contribute

All are welcome, please join in!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Open an [issue](https://github.com/ipfs/js-ipfs-mfs/issues) or send a [PR](https://github.com/ipfs/js-ipfs-mfs/pulls) - see [CONTRIBUTING.md](./CONTRIBUTING.md) for how to make sure your branch is ready for PRing.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for details of what has changed between releases.

## License

[MIT](LICENSE)
