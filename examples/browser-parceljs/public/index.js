import IPFS from 'ipfs'
import uint8ArrayConcat from 'uint8arrays/concat'
import uint8ArrayToString from 'uint8arrays/to-string'

document.addEventListener('DOMContentLoaded', async () => {
  // IPFS node setup
  const node = await IPFS.create({ repo: String(Math.random() + Date.now()) })

  // UI elements
  const status = document.getElementById('status')
  const output = document.getElementById('output')

  output.textContent = ''

  function log (txt) {
    console.info(txt)
    output.textContent += `${txt.trim()}\n`
  }

  status.innerText = 'Connected to IPFS :)'

  const version = await node.version()

  log(`The IPFS node version is ${version.version}`)

  const entry = await node.add({
    path: 'hello-parcel.txt',
    content: 'Hello from parcel.js bundled ipfs example'
  })
  log(`This page deployed ${entry.path} to IPFS and its CID is ${entry.cid}`)

  const buffers = []

  for await (const buf of node.cat(entry.cid)) {
    buffers.push(buf)
  }

  log(`The contents of the file was: ${uint8ArrayToString(uint8ArrayConcat(buffers))}`)
})
