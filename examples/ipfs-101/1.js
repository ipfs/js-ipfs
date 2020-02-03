'use strict'

const IPFS = require('ipfs')
const all = require('it-all')

async function main () {
  const node = await IPFS.create()
  const version = await node.version()

  console.log('Version:', version.version)

  for await (const file of await node.add({
    path: 'hello.txt',
    content: Buffer.from('Hello World 101')
  })) {
    console.log('Added file:', file.path, file.cid.toString())

    const data = Buffer.concat(await all(node.cat(file.cid)))

    console.log('Added file contents:', data.toString())
  }
}

main()
