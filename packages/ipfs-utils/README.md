# js-ipfs-utils

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-utils)](https://travis-ci.com/ipfs/js-ipfs-utils)
[![Codecov branch](https://img.shields.io/codecov/c/github/ipfs/js-ipfs-utils/master.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-utils)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-utils.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-utils)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> This package serves as a central repository for shared logic and dependencies for all IPFS packages, using `ipfs-utils` helps to easily re-use small scoped blocks of logic across all the js core interface implementations and also as a dependency proxy (think `aegir` for domain logic dependencies).

`ipfs-utils` aims to provide single function default export per file (with a few exceptions) scoped in 3 general categories:
-  General use
-  Data structs wrangling (arrays, objects, streams, etc)
-  IPFS core subsystems   

*General use* and *Data structs wrangling* should try to be just re-exports of community packages.   

The IPFS ecosystem has lots of repos with it comes several problems like: 
- Domain logic dedupe - all interface-core implementations shared a lot of logic like validation, streams handling, etc.
- Dependencies management - it's really easy with so many repos for dependencies to go out of control, they become outdated, different repos use different modules to do the same thing (like merging defaults options), browser bundles ends up with multiple versions of the same package, bumping versions is cumbersome to do because we need to go through several repos, etc.

These problems are the motivation for this package, having shared logic in this package avoids creating cyclic dependencies, centralizes common use modules/functions (exactly like aegir does for the tooling), semantic versioning for 3rd party dependencies is handled in one single place (a good example is going from streams 2 to 3) and maintainers should only care about having `ipfs-utils` updated.

## Lead Maintainer

[Hugo Dias](https://github.com/hugomrdias)

## Install


```bash
$ npm install --save ipfs-utils
```

## Usage
Each function should be imported directly.

```js
const validateAddInput = require('ipfs-utils/src/files/add-input-validation')

validateAddInput(Buffer.from('test'))
// true
```

## Functions

### General Use
#### TODO
### Data Struct Wrangling 
#### TODO
### Core API
#### TODO


## Contribute

Contributions welcome. Please check out [the issues](https://github.com/ipfs/js-ipfs-utils/issues).

Check out our [contributing document](https://github.com/ipfs/community/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

## License

[MIT](LICENSE) © Protocol Labs Inc.
