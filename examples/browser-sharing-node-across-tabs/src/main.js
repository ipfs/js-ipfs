'use strict'

import IPFSClient from "ipfs-message-port-client"


const main = async () => {
  // connect / spawn shared ipfs worker & create a client.
  const worker = new SharedWorker('./worker.js', { type: 'module' })
  const ipfs = IPFSClient.from(worker.port)

  const path = location.hash.slice(1)
  if (path.startsWith('/ipfs/')) {
    await viewer(ipfs, path)
  } else {
    await uploader(ipfs)
  }
}

const uploader = async (ipfs) => {
  document.body.outerHTML += '<div>Adding "hello world!" to shared IPFS node</div>'
  const entry = await ipfs.add(ipfs, new Blob(['hello world!'], { type: "text/plain" }))
  const path = `/ipfs/${entry.cid}/`
  document.body.outerHTML += `<div class="ipfs-add">File was added:
  <a target="_blank" href="${new URL(`#${path}`, location)}">${path}</a>
</div>`
}

const viewer = async (ipfs, path) => {
  document.body.outerHTML += `<div class="loading">Loading ${path}</div>`
  try {
    const chunks = []
    for await (const chunk of await ipfs.cat(path)) {
      chunks.push(chunk)
    }
    const blob = new Blob(chunks)
    const url = URL.createObjectURL(blob)
    document.body.outerHTML +=
      `<iframe id="content" sandbox src=${url} style="background:white;top:0;left:0;border:0;width:100%;height:100%;position:absolute;z-index:2;"></iframe>`

  } catch(error) {
    document.body.outerHTML += `<div class="error">${error}</div>`
  }
}

onload = main