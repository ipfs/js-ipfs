'use strict'

module.exports = async (request, h) => {
  const { ipfs } = request.server.app
  const version = await ipfs.version()

  return h.response({
    Version: version.version,
    Commit: version.commit,
    Repo: version.repo
  })
}
