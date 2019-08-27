<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-multipart/compare/v0.1.1...v0.2.0) (2019-08-27)


### Chores

* refactor to async/await ([#17](https://github.com/ipfs/js-ipfs-multipart/issues/17)) ([55d926e](https://github.com/ipfs/js-ipfs-multipart/commit/55d926e))


### BREAKING CHANGES

* This module used to export a class that extended EventEmitter,
now it exports a function that returns an async iterable.

I also updated the deps to use the latest http api, though it's removed
the ability to add whole paths at once, along with some special logic
to handle symlinks.  The `Dicer` module that this module depends on
will still emit events for when it encounters symlinks so I left the
handlers in though am unsure if we actually use them.



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipfs/js-ipfs-multipart/compare/v0.1.0...v0.1.1) (2019-07-12)



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipfs/js-ipfs-multipart/compare/v0.0.2...v0.1.0) (2016-03-14)



<a name="0.0.2"></a>
## 0.0.2 (2016-03-14)



