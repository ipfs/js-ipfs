'use strict'

const CID = require('cids')
const {
  toPathComponents
} = require('../../src/core/utils')

module.exports = async (path, mfs) => {
  const parts = toPathComponents(path)
  const fileName = parts.pop()
  const directory = `/${parts.join('/')}`
  const files = (await mfs.ls(directory, {
    long: true
  }))

  const file = files
    .filter(file => file.name === fileName)
    .pop()

  return new CID(
    file.hash
  )
}
