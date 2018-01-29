'use strict'

exports = module.exports

exports.version = (request, reply) => {
  const ipfs = request.server.app.ipfs

  ipfs.repo.version((err, version) => {
    if (err) {
      return reply({
        Message: err.toString(),
        Code: 0
      }).code(500)
    }

    reply({
      Version: version
    })
  })
}

exports.stat = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const human = request.query.human === 'true'

  ipfs.repo.stat({human: human}, (err, stat) => {
    if (err) {
      return reply({
        Message: err.toString(),
        Code: 0
      }).code(500)
    }

    reply({
      NumObjects: stat.numObjects,
      RepoSize: stat.repoSize,
      RepoPath: stat.repoPath,
      Version: stat.version,
      StorageMax: stat.storageMax
    })
  })
}
