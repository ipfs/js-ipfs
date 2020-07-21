'use strict'

const IPFS = require('ipfs')

document.addEventListener('DOMContentLoaded', async () => {
  const node = await IPFS.create({ repo: String(Math.random() + Date.now()) })

  console.log('IPFS node is ready')

  async function store () {
    const toStore = document.getElementById('source').value

    const file = await node.add(toStore)

    console.log('successfully stored', file.cid)

    await display(file.cid)
  }

  async function display (cid) {
    for await (const data of node.cat(cid)) {
      document.getElementById('cid').innerText = cid
      document.getElementById('content').innerText = data
      document.getElementById('output').setAttribute('style', 'display: block')
    }
  }

  document.getElementById('store').onclick = store
})
