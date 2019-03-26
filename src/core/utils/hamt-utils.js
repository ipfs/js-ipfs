'use strict'

const {
  DAGNode
} = require('ipld-dag-pb')
const waterfall = require('async/waterfall')
const whilst = require('async/whilst')
const series = require('async/series')
const Bucket = require('hamt-sharding/src/bucket')
const DirSharded = require('ipfs-unixfs-importer/src/importer/dir-sharded')
const log = require('debug')('ipfs:mfs:core:utils:hamt-utils')
const UnixFS = require('ipfs-unixfs')

const updateHamtDirectory = (context, links, bucket, options, callback) => {
  // update parent with new bit field
  waterfall([
    (cb) => {
      const data = Buffer.from(bucket._children.bitField().reverse())
      const dir = new UnixFS('hamt-sharded-directory', data)
      dir.fanout = bucket.tableSize()
      dir.hashType = DirSharded.hashFn.code

      DAGNode.create(dir.marshal(), links, cb)
    },
    (parent, done) => {
      // Persist the new parent DAGNode
      context.ipld.put(parent, {
        version: options.cidVersion,
        format: options.codec,
        hashAlg: options.hashAlg,
        hashOnly: !options.flush
      }, (error, cid) => done(error, {
        node: parent,
        cid
      }))
    }
  ], callback)
}

const recreateHamtLevel = (links, rootBucket, parentBucket, positionAtParent, callback) => {
  // recreate this level of the HAMT
  const bucket = new Bucket({
    hashFn: DirSharded.hashFn,
    hash: parentBucket ? parentBucket._options.hash : undefined
  }, parentBucket, positionAtParent)

  if (parentBucket) {
    parentBucket._putObjectAt(positionAtParent, bucket)
  }

  addLinksToHamtBucket(links, bucket, rootBucket, callback)
}

const addLinksToHamtBucket = (links, bucket, rootBucket, callback) => {
  Promise.all(
    links.map(link => {
      if (link.name.length === 2) {
        const pos = parseInt(link.name, 16)

        bucket._putObjectAt(pos, new Bucket({
          hashFn: DirSharded.hashFn
        }, bucket, pos))

        return Promise.resolve()
      }

      return (rootBucket || bucket).put(link.name.substring(2), {
        size: link.size,
        multihash: link.cid
      })
    })
  )
    .then(() => callback(null, bucket), callback)
}

const toPrefix = (position) => {
  return position
    .toString('16')
    .toUpperCase()
    .padStart(2, '0')
    .substring(0, 2)
}

const generatePath = (context, fileName, rootNode, callback) => {
  // start at the root bucket and descend, loading nodes as we go
  recreateHamtLevel(rootNode.links, null, null, null, async (err, rootBucket) => {
    if (err) {
      return callback(err)
    }

    const position = await rootBucket._findNewBucketAndPos(fileName)

    // the path to the root bucket
    let path = [{
      bucket: position.bucket,
      prefix: toPrefix(position.pos)
    }]
    let currentBucket = position.bucket

    while (currentBucket !== rootBucket) {
      path.push({
        bucket: currentBucket,
        prefix: toPrefix(currentBucket._posAtParent)
      })

      currentBucket = currentBucket._parent
    }

    path[path.length - 1].node = rootNode

    let index = path.length

    // load DAGNode for each path segment
    whilst(
      () => index > 0,
      (next) => {
        index--

        const segment = path[index]

        // find prefix in links
        const link = segment.node.links
          .filter(link => link.name.substring(0, 2) === segment.prefix)
          .pop()

        if (!link) {
          // reached bottom of tree, file will be added to the current bucket
          log(`Link ${segment.prefix}${fileName} will be added`)
          return next(null, path)
        }

        if (link.name === `${segment.prefix}${fileName}`) {
          log(`Link ${segment.prefix}${fileName} will be replaced`)
          // file already existed, file will be added to the current bucket
          return next(null, path)
        }

        // found subshard
        log(`Found subshard ${segment.prefix}`)
        context.ipld.get(link.cid, (err, result) => {
          if (err) {
            return next(err)
          }

          // subshard hasn't been loaded, descend to the next level of the HAMT
          if (!path[index - 1]) {
            log(`Loaded new subshard ${segment.prefix}`)
            const node = result.value

            return recreateHamtLevel(node.links, rootBucket, segment.bucket, parseInt(segment.prefix, 16), async (err, bucket) => {
              if (err) {
                return next(err)
              }

              const position = await rootBucket._findNewBucketAndPos(fileName)

              index++
              path.unshift({
                bucket: position.bucket,
                prefix: toPrefix(position.pos),
                node: node
              })

              next()
            })
          }

          const nextSegment = path[index - 1]

          // add intermediate links to bucket
          addLinksToHamtBucket(result.value.links, nextSegment.bucket, rootBucket, (error) => {
            nextSegment.node = result.value

            next(error)
          })
        })
      },
      async (err, path) => {
        await rootBucket.put(fileName, true)

        callback(err, { rootBucket, path })
      }
    )
  })
}

const createShard = (context, contents, options, callback) => {
  const shard = new DirSharded({
    root: true,
    dir: true,
    parent: null,
    parentKey: null,
    path: '',
    dirty: true,
    flat: false,

    ...options
  })

  const operations = contents.map(contents => {
    return (cb) => {
      shard.put(contents.name, {
        size: contents.size,
        multihash: contents.multihash
      }, cb)
    }
  })

  return series(
    operations,
    (err) => {
      if (err) {
        return callback(err)
      }

      shard.flush('', context.ipld, null, callback)
    }
  )
}

module.exports = {
  generatePath,
  updateHamtDirectory,
  recreateHamtLevel,
  addLinksToHamtBucket,
  toPrefix,
  createShard
}
