'use strict'

/* global Ipfs */
/* eslint-env browser */

const { Buffer } = Ipfs

const main = async () => {
  const repoPath = `ipfs-${Math.random()}`
  const ipfs = await Ipfs.create({ repo: repoPath })

  const directoryName = 'directory'

  // Our list of files
  const inputFiles = createFiles(directoryName)

  const directoryHash = await streamFiles(ipfs, directoryName, inputFiles)

  const fileList = await ipfs.ls(directoryHash)

  log(`\n--\n\nDirectory contents:\n\n${directoryName}/ ${directoryHash}`)

  fileList.forEach((file, index) => {
    log(` ${index < fileList.length - 1 ? '\u251C' : '\u2514'}\u2500 ${file.name} ${file.path} ${file.hash}`)
  })
}

const createFiles = (directory) => {
  return [{
    path: `${directory}/file1.txt`,

    // content could be a stream, a url etc
    content: Buffer.from('one', 'utf8')
  }, {
    path: `${directory}/file2.txt`,
    content: Buffer.from('two', 'utf8')
  }, {
    path: `${directory}/file3.txt`,
    content: Buffer.from('three', 'utf8')
  }]
}

const streamFiles = (ipfs, directory, files) => new Promise((resolve, reject) => {
  // Create a stream to write files to
  const stream = ipfs.addReadableStream()

  stream.on('data', (data) => {
    log(`Added ${data.path} hash: ${data.hash}`)

    // The last data event will contain the directory hash
    if (data.path === directory) {
      resolve(data.hash)
    }
  })

  stream.on('error', reject)

  // Add the files one by one
  files.forEach(file => stream.write(file))

  // When we have no more files to add, close the stream
  stream.end()
})

const log = (line) => {
  document.getElementById('output').appendChild(document.createTextNode(`${line}\r\n`))
}

main()
