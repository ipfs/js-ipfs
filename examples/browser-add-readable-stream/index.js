'use strict'

/* global Ipfs */
/* eslint-env browser */

const main = async () => {
  const repoPath = `ipfs-${Math.random()}`
  const ipfs = await Ipfs.create({ repo: repoPath })

  const directoryName = 'directory'

  // Our list of files
  const inputFiles = createFiles(directoryName)

  const directoryHash = await streamFiles(ipfs, directoryName, inputFiles)

  log(`\n--\n\nDirectory contents:\n\n${directoryName}/ ${directoryHash}`)

  let index = 0

  for await (const file of ipfs.ls(directoryHash)) {
    log(` ${index < inputFiles.length - 1 ? '\u251C' : '\u2514'}\u2500 ${file.name} ${file.path} ${file.cid}`)
    index++
  }
}

const createFiles = (directory) => {
  return [{
    path: `${directory}/file1.txt`,

    // content could be a stream, a url, a Uint8Array, a File etc
    content: 'one'
  }, {
    path: `${directory}/file2.txt`,
    content: 'two'
  }, {
    path: `${directory}/file3.txt`,
    content: 'three'
  }]
}

const streamFiles = async (ipfs, directory, files) => {
  // Create a stream to write files to
  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < files.length; i++) {
        // Add the files one by one
        controller.enqueue(files[i])
      }

      // When we have no more files to add, close the stream
      controller.close()
    }
  })

  const data = await ipfs.add(stream)

  log(`Added ${data.path} hash: ${data.cid}`)

  // The last data event will contain the directory hash
  if (data.path === directory) {
    return data.cid
  }
}

const log = (line) => {
  document.getElementById('output').appendChild(document.createTextNode(`${line}\r\n`))
}

main()
