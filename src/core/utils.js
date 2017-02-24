'use strict'

exports.ifRepoExists = (repo, cb) => {
  repo.exists((err, exists) => {
    if (err) {
      return cb(err)
    }

    if (exists === false) {
      return cb(new Error('no ipfs repo found'))
    }

    cb()
  })
}

exports.repoExists = (self) => {
  return (cb) => {
    self._repo.exists((err, exists) => {
      if (err) {
        return cb(err)
      }

      cb(err, exists)
    })
  }
}

exports.OFFLINE_ERROR = new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
