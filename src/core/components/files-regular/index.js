module.exports = self => ({
  add: require('./add')(self),
  addPullStream: require('./add-pull-stream')(self),
  addReadableStream: require('./add-readable-stream')(self),
  cat: require('./cat')(self),
  catPullStream: require('./cat-pull-stream')(self),
  catReadableStream: require('./cat-readable-stream')(self),
  get: require('./get')(self),
  getPullStream: require('./get-pull-stream')(self),
  getReadableStream: require('./get-readable-stream')(self),
  ls: require('./ls')(self),
  lsPullStream: require('./ls-pull-stream')(self),
  lsReadableStream: require('./ls-readable-stream')(self)
})
