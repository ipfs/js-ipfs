/* eslint-disable no-console */
'use strict'

// Run `ipfs daemon` in your terminal to start the IPFS daemon
// Look for `API server listening on /ip4/127.0.0.1/tcp/5001`
const ipfs = require('../../src')('/ip4/127.0.0.1/tcp/5001')

const run = async () => {
  await ipfs.files.write(
    '/temp/hello-world',
    Buffer.from('Hello, world!'),
    { create: true, parents: true }
  )
  const source = ipfs.files.ls('/temp')

  for await (const file of source) {
    console.log(file)
  }
}

run()
