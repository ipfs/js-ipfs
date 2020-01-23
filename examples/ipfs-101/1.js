'use strict'

const IPFS = require('ipfs')

async function main () {
  const node = await IPFS.create()
  const version = await node.version()

  console.log('Version:', version.version)

  for await (const file of await node.add({
    path: 'hello.txt',
    content: Buffer.from('Hello World 101')
  })) {
    console.log('Added file:', file.path, file.cid.toString())

    const bufs = []

    for await (const buf of node.cat(file.cid)) {
      bufs.push(buf)
    }

    console.log('Added file contents:', Buffer.concat(bufs).toString())
  }
}

main()
