'use strict'

module.exports = (self) => {
  const filesRegular = {
    add: require('./add')(self),
    addFromFs: require('./add-from-fs')(self),
    addFromStream: require('./add-from-stream')(self),
    addFromURL: require('./add-from-url')(self),
    addPullStream: require('./add-pull-stream')(self),
    addReadableStream: require('./add-readable-stream')(self),
    _addAsyncIterator: require('./add-async-iterator')(self),
    cat: require('./cat')(self),
    catPullStream: require('./cat-pull-stream')(self),
    catReadableStream: require('./cat-readable-stream')(self),
    get: require('./get')(self),
    getPullStream: require('./get-pull-stream')(self),
    getReadableStream: require('./get-readable-stream')(self),
    ls: require('./ls')(self),
    lsPullStream: require('./ls-pull-stream')(self),
    lsReadableStream: require('./ls-readable-stream')(self),
    refs: require('./refs')(self),
    refsReadableStream: require('./refs-readable-stream')(self),
    refsPullStream: require('./refs-pull-stream')(self)
  }
  filesRegular.refs.local = require('./refs-local')(self)
  filesRegular.refs.localReadableStream = require('./refs-local-readable-stream')(self)
  filesRegular.refs.localPullStream = require('./refs-local-pull-stream')(self)
  return filesRegular
}
