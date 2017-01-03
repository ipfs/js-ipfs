'use strict'

const mh = require('multihashes')
const Promise = require('bluebird')

const html = require('./utils/html')
const PathUtil = require('./utils/path')

const INDEX_HTML_FILES = [ 'index.html', 'index.htm', 'index.shtml' ]

const promisedFor = Promise.method((condition, action, value) => {
  if (!condition(value)) return value
  return action(value).then(promisedFor.bind(null, condition, action))
})

const resolveDirectory = (ipfs, path, multihash) => {
  return ipfs
          .object
          .get(multihash, { enc: 'base58' })
          .then((DAGNode) => {
            const links = DAGNode.links
            const indexFiles = links.filter((link) => INDEX_HTML_FILES.indexOf(link.name) !== -1)

            // found index file in links
            if (indexFiles.length > 0) {
              return indexFiles
            }

            return html.build(path, links)
          })
}

const resolveMultihash = (ipfs, path) => {
  const parts = PathUtil.splitPath(path)
  const partsLength = parts.length

  return promisedFor(
    (i) => i.index < partsLength,
    (i) => {
      const currentIndex = i.index
      const currentMultihash = i.multihash

      // throws error when invalid multihash is passed
      mh.validate(mh.fromB58String(currentMultihash))

      return ipfs
              .object
              .get(currentMultihash, { enc: 'base58' })
                .then((DAGNode) => {
                  if (currentIndex === partsLength - 1) {
                    // leaf node
                    return {
                      multihash: currentMultihash,
                      index: currentIndex + 1
                    }
                  } else {
                    // find multihash of requested named-file
                    // in current DAGNode's links
                    let multihashOfNextFile
                    const nextFileName = parts[currentIndex + 1]
                    const links = DAGNode.links

                    for (let link of links) {
                      if (link.name === nextFileName) {
                        // found multihash of requested named-file
                        multihashOfNextFile = mh.toB58String(link.multihash)
                        break
                      }
                    }

                    if (!multihashOfNextFile) {
                      throw new Error(`no link named "${nextFileName}" under ${currentMultihash}`)
                    }

                    return {
                      multihash: multihashOfNextFile,
                      index: currentIndex + 1
                    }
                  }
                })
    }, {
      multihash: parts[0],
      index: 0
    })
}

module.exports = {
  resolveDirectory,
  resolveMultihash
}
