'use strict'

/* eslint-env browser */

const IPFS = require('ipfs')
const ipfs = new IPFS({
  repo: `ipfs-${Math.random()}`
})
const {
  dragDrop,
  log,
  bufferToArrayBuffer
} = require('./utils')
const {
  updateTree
} = require('./filetree')
const {
  mvForm,
  mkdirForm,
  rmForm,
  cpForm,
  statForm,
  readForm,
  hideForms
} = require('./forms')
const mime = require('mime-sniffer')

hideForms()

log('IPFS: Initialising')

ipfs.on('ready', () => {
  // Allow adding files to IPFS via drag and drop
  dragDrop(async (files) => {
    /* eslint-disable-next-line no-alert */
    const destinationDirectory = prompt(`Dropped ${files.length} file${files.length > 1 ? 's' : ''}, please enter a directory to store them in`, '/')

    if (!destinationDirectory || !`${destinationDirectory}`.trim()) {
      return
    }

    await Promise.all(
      files.map(file => {
        const path = `${destinationDirectory}/${file.name}`.replace(/\/\/+/g, '/')
        log(`ipfs.files.write('${path}', <File>, { create: true, parents: true })`)
        return ipfs.files.write(path, file, {
          create: true,
          parents: true
        })
          .catch(error => log(error))
      })
    )

    updateTree(ipfs)
  })

  mkdirForm(async (path, parents, format, hashAlg, flush) => {
    log(`ipfs.files.mkdir('${path}', ${JSON.stringify({
      parents,
      format,
      hashAlg,
      flush
    }, null, 2)})`)

    await ipfs.files.mkdir(path, {
      parents,
      format,
      hashAlg,
      flush
    })
      .catch(error => log(error))

    updateTree(ipfs)
  })

  mvForm(async (paths, destination, parents, format, hashAlg, flush) => {
    log(`ipfs.files.mv(${paths.map(path => `'${path}'`).join(', ')}, ${JSON.stringify({
      parents,
      format,
      hashAlg,
      flush
    }, null, 2)})`)

    await ipfs.files.mv.apply(null, paths.concat(destination, {
      parents,
      format,
      hashAlg,
      flush
    }))
      .catch(error => log(error))

    updateTree(ipfs)
  })

  rmForm(async (paths, recursive) => {
    log(`ipfs.files.rm(${paths.map(path => `'${path}'`).join(', ')}, ${JSON.stringify({
      recursive
    }, null, 2)})`)

    await ipfs.files.rm.apply(null, paths.concat({
      recursive
    }))
      .catch(error => log(error))

    updateTree(ipfs)
  })

  cpForm(async (paths, destination, parents, format, hashAlg, flush) => {
    log(`ipfs.files.cp(${paths.map(path => `'${path}'`).join(', ')}, '${destination}', ${JSON.stringify({
      parents,
      format,
      hashAlg,
      flush
    }, null, 2)})`)

    await ipfs.files.cp.apply(null, paths.concat(destination, {
      parents,
      format,
      hashAlg,
      flush
    }))
      .catch(error => log(error))

    updateTree(ipfs)
  })

  statForm(async (path, hash, size, withLocal) => {
    log(`ipfs.files.stat('${path}', ${JSON.stringify({
      hash,
      size,
      withLocal
    }, null, 2)})`)

    await ipfs.files.stat(path, {
      hash,
      size,
      withLocal
    })
      .then((stats) => log(stats))
      .catch(error => log(error))
  })

  readForm(async (path, offset, length) => {
    log(`ipfs.files.read('${path}', ${JSON.stringify({
      offset,
      length
    }, null, 2)})`)

    await ipfs.files.read(path, {
      offset,
      length
    })
      .then((buffer) => {
        mime.lookup(buffer, (error, result) => {
          // will cause file to be downloaded if we don't know what it is
          let mimeType = 'application/octet-stream'

          if (!error) {
            mimeType = result.mime
          }

          const data = bufferToArrayBuffer(buffer)
          const file = new Blob([data], {
            type: mimeType
          })
          const fileURL = URL.createObjectURL(file)
          window.open(fileURL)
        })
      })
      .catch(error => log(error))
  })

  log('IPFS: Ready')
  log('IPFS: Drop some files into this window to get started')
  log('')

  updateTree(ipfs)
})
