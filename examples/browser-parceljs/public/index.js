import 'babel-polyfill'
import IPFS from 'ipfs'

// IPFS node setup
const node = new IPFS({ repo: String(Math.random() + Date.now()) })

// UI elements
const status = document.getElementById('status')
const output = document.getElementById('output')

output.textContent = ''

function log (txt) {
  console.info(txt)
  output.textContent += `${txt.trim()}\n`
}

node.on('ready', async () => {
  status.innerText = 'Connected to IPFS :)'

  const version = await node.version()

  log(`The IPFS node version is ${version.version}`)

  const filesAdded = await node.add({
    path: 'hello-parcel.txt',
    content: Buffer.from('Hello from parcel.js bundled ipfs example')
  })

  log(`This page deployed ${filesAdded[0].path} to IPFS and its hash is ${filesAdded[0].hash}`)

  const fileBuffer = await node.cat(filesAdded[0].hash)

  log(`The contents of the file was: ${fileBuffer.toString()}`)
})
