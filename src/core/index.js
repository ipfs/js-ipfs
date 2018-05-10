'use strict'

const core = {
  cp: require('./cp'),
  ls: require('./ls'),
  mkdir: require('./mkdir'),
  mv: require('./mv'),
  read: require('./read'),
  readPullStream: require('./read-pull-stream'),
  readReadableStream: require('./read-readable-stream'),
  rm: require('./rm'),
  stat: require('./stat'),
  write: require('./write')
}

module.exports = (ipfs) => {
  const mfs = {}

  for (let key in core) {
    if (core.hasOwnProperty(key)) {
      mfs[key] = core[key](ipfs)
    }
  }

  return mfs
}
