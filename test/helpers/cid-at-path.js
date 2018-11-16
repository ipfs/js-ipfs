'use strict'

const CID = require('cids')

module.exports = async (path, mfs) => {
  const parts = path.split('/')
  const fileName = parts.pop()
  const directory = `/${parts.join('/')}`

  return new CID(
    (await mfs.ls(directory, {
      long: true
    }))
      .filter(file => file.name === fileName)
      .pop()
      .hash
  )
}
