'use strict'

const errCode = require('err-code')
const log = require('debug')('ipfs:mfs:mkdir')
const exporter = require('ipfs-unixfs-exporter')
const createNode = require('./utils/create-node')
const toPathComponents = require('./utils/to-path-components')
const updateMfsRoot = require('./utils/update-mfs-root')
const updateTree = require('./utils/update-tree')
const addLink = require('./utils/add-link')
const withMfsRoot = require('./utils/with-mfs-root')
const applyDefaultOptions = require('./utils/apply-default-options')
const {
  FILE_SEPARATOR
} = require('./utils/constants')

const defaultOptions = {
  parents: false,
  hashAlg: 'sha2-256',
  cidVersion: 0,
  shardSplitThreshold: 1000,
  format: 'dag-pb',
  flush: true
}

module.exports = (context) => {
  return async function mfsMkdir (path, options) {
    options = applyDefaultOptions(options, defaultOptions)

    if (!path) {
      throw new Error('no path given to Mkdir')
    }

    path = path.trim()

    if (path === FILE_SEPARATOR) {
      if (options.parents) {
        return
      }

      throw errCode(new Error(`cannot create directory '${FILE_SEPARATOR}': Already exists`), 'ERR_INVALID_PATH')
    }

    if (path.substring(0, 1) !== FILE_SEPARATOR) {
      throw errCode(new Error('paths must start with a leading /'), 'ERR_INVALID_PATH')
    }

    log(`Creating ${path}`)

    const pathComponents = toPathComponents(path)

    if (pathComponents[0] === 'ipfs') {
      throw errCode(new Error("path cannot have the prefix 'ipfs'"), 'ERR_INVALID_PATH')
    }

    const root = await withMfsRoot(context)
    let parent
    const trail = []
    const emptyDir = await createNode(context, 'directory', options)

    // make sure the containing folder exists, creating it if necessary
    for (let i = 0; i <= pathComponents.length; i++) {
      const subPathComponents = pathComponents.slice(0, i)
      const subPath = `/ipfs/${root}/${subPathComponents.join('/')}`

      try {
        parent = await exporter(subPath, context.ipld)
        log(`${subPath} existed`)
        log(`${subPath} had children ${parent.node.Links.map(link => link.Name)}`)

        if (i === pathComponents.length) {
          if (options.parents) {
            return
          }

          throw errCode(new Error('file already exists'), 'ERR_ALREADY_EXISTS')
        }

        trail.push({
          name: parent.name,
          cid: parent.cid
        })
      } catch (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          if (i < pathComponents.length && !options.parents) {
            throw errCode(new Error(`Intermediate directory path ${subPath} does not exist, use the -p flag to create it`), 'ERR_NOT_FOUND')
          }

          // add the intermediate directory
          await addEmptyDir(context, subPathComponents[subPathComponents.length - 1], emptyDir, trail[trail.length - 1], trail, options)
        } else {
          throw err
        }
      }
    }

    // add an empty dir to the last path component
    // await addEmptyDir(context, pathComponents[pathComponents.length - 1], emptyDir, parent, trail)

    // update the tree from the leaf to the root
    const newRootCid = await updateTree(context, trail, options)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid)
  }
}

const addEmptyDir = async (context, childName, emptyDir, parent, trail, options) => {
  log(`Adding empty dir called ${childName} to ${parent.cid}`)

  const result = await addLink(context, {
    parent: parent.node,
    parentCid: parent.cid,
    size: emptyDir.node.size,
    cid: emptyDir.cid,
    name: childName,
    format: options.format,
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion
  })

  trail[trail.length - 1].cid = result.cid

  trail.push({
    name: childName,
    cid: emptyDir.cid
  })
}
