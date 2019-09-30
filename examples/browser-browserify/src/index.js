'use strict'

const IPFS = require('ipfs')

document.addEventListener('DOMContentLoaded', async () => {
  const node = await IPFS.create({ repo: String(Math.random() + Date.now()) })

  console.log('IPFS node is ready')

  async function store () {
    const toStore = document.getElementById('source').value

    const res = await node.add(toStore)

    res.forEach((file) => {
      if (file && file.hash) {
        console.log('successfully stored', file.hash)
        display(file.hash)
      }
    })
  }

  async function display (hash) {
    // buffer: true results in the returned result being a buffer rather than a stream
    const data = await node.cat(hash)
    document.getElementById('hash').innerText = hash
    document.getElementById('content').innerText = data
  }

  document.getElementById('store').onclick = store
})
