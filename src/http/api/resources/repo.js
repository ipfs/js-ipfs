'use strict'

exports.gc = async (request, h) => {
  const { ipfs } = request.server.app
  await ipfs.repo.gc()
  return h.response()
}

exports.version = async (request, h) => {
  const { ipfs } = request.server.app
  const version = await ipfs.repo.version()
  return h.response({
    Version: version
  })
}

exports.stat = async (request, h) => {
  const { ipfs } = request.server.app
  const human = request.query.human === 'true'
  const stat = await ipfs.repo.stat({ human })

  return h.response({
    NumObjects: stat.numObjects,
    RepoSize: stat.repoSize,
    RepoPath: stat.repoPath,
    Version: stat.version,
    StorageMax: stat.storageMax
  })
}
