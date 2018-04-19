'use strict'

const unmarshal = require('ipfs-unixfs').unmarshal

const findFileSize = (dagNode) => {
  const meta = unmarshal(dagNode.data)

  if (meta.blockSizes.length) {
    return meta.blockSizes.reduce((acc, curr) => acc + curr, 0)
  }

  return meta.data.length
}

module.exports = findFileSize
