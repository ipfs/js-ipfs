'use strict'

/* global Ipfs */
/* eslint-env browser */

const repoPath = 'ipfs-' + Math.random()
const ipfs = new Ipfs({ repo: repoPath })

ipfs.on('ready', () => {
  const directory = 'directory'

  // Our list of files
  const files = createFiles(directory)

  streamFiles(directory, files, (err, directoryHash) => {
    if (err) {
      return log(`There was an error adding the files ${err}`)
    }

    ipfs.ls(directoryHash, (err, files) => {
      if (err) {
        return log(`There was an error listing the files ${err}`)
      }

      log(`
--

Directory contents:

${directory}/ ${directoryHash}`)

      files.forEach((file, index) => {
        log(` ${index < files.length - 1 ? '\u251C' : '\u2514'}\u2500 ${file.name} ${file.path} ${file.hash}`)
      })
    })
  })
})

const createFiles = (directory) => {
  return [{
    path: `${directory}/file1.txt`,

    // content could be a stream, a url etc
    content: ipfs.types.Buffer.from('one', 'utf8')
  }, {
    path: `${directory}/file2.txt`,
    content: ipfs.types.Buffer.from('two', 'utf8')
  }, {
    path: `${directory}/file3.txt`,
    content: ipfs.types.Buffer.from('three', 'utf8')
  }]
}

const streamFiles = (directory, files, cb) => {
  // Create a stream to write files to
  const stream = ipfs.files.addReadableStream()
  stream.on('data', function (data) {
    log(`Added ${data.path} hash: ${data.hash}`)

    // The last data event will contain the directory hash
    if (data.path === directory) {
      cb(null, data.hash)
    }
  })

  // Add the files one by one
  files.forEach(file => stream.write(file))

  // When we have no more files to add, close the stream
  stream.end()
}

const log = (line) => {
  document.getElementById('output').appendChild(document.createTextNode(`${line}\r\n`))
}
