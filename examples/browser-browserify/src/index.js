'use strict'

const IPFS = require('ipfs')

document.addEventListener('DOMContentLoaded', async () => {
  const node = await IPFS.create({ repo: String(Math.random() + Date.now()) })

  console.log('IPFS node is ready')

  async function store () {
    const toStore = document.getElementById('source').value
    const result = await node.add(toStore)

    for (const file of result) {
      if (file && file.hash) {
        console.log('successfully stored', file.hash)

        await display(file.hash)
      }
    }
  }

  async function display (hash) {
    const data = await node.cat(hash)

    document.getElementById('hash').innerText = hash
    document.getElementById('content').innerText = data
    document.getElementById('output').setAttribute('style', 'display: block')
  }

  document.getElementById('store').onclick = store
})
