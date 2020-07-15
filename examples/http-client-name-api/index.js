/* eslint-disable no-console */
'use strict'
const { Buffer } = require('buffer')
const ipfsHttp = require('ipfs-http-client')
let ipfs

const DOM = {
  status: document.getElementById('status'),
  buttons: document.getElementsByTagName('button'),
  connect: document.getElementById('connect-to-http-api'),
  publishNew: document.getElementById('publish-text'),
  publishPath: document.getElementById('publish-path'),
  resolveName: document.getElementById('resolve-name'),
  publishResultsDiv: document.querySelector('.results--publish'),
  resolveResultsDiv: document.querySelector('.results--resolve'),
  publishResult: document.getElementById('publish-result'),
  resolveResult: document.getElementById('resolve-result'),
  publishGatewayLink: document.getElementById('publish-gateway-link'),
  resolveGatewayLink: document.getElementById('resolve-gateway-link')
}

const COLORS = {
  active: 'blue',
  success: 'green',
  error: 'red'
}

const IPFS_DOMAIN = 'https://ipfs.io'

const showStatus = (text, bg) => {
  DOM.status.innerText = text
  DOM.status.style.background = bg
}

const enableForms = () => {
  for (const btn of DOM.buttons) {
    btn.disabled = false
  }
}

const connect = async (e) => {
  e.preventDefault()

  const input = e.target.elements.text.value.trim()
  showStatus(`Connecting to ${input}`, COLORS.active)

  ipfs = ipfsHttp(input)
  ipfs.id()
    .then(res => {
      showStatus(`Daemon active\nID: ${res.id}`, COLORS.success)
      enableForms()
    })
    .catch(err => {
      showStatus('Failed to connect to daemon', COLORS.error)
      console.error(err)
    })
}

// Adds a new file to IPFS and publish it
const addAndPublish = async (e) => {
  e.preventDefault()

  const input = e.target.elements.text
  const buffer = Buffer.from(input.value)

  showStatus('Adding to IPFS...', COLORS.active)
  try {
    const file = await ipfs.add(buffer)
    showStatus('Success!', COLORS.success)

    publish(file.path)

    input.value = ''
  } catch (err) {
    showStatus('Failed to add the data', COLORS.error)
    console.error(err)
  }
}

// Publishes an IPFS file or directory under your node's identity
const publish = (path) => {
  showStatus('Publishing...', COLORS.active)
  DOM.publishResultsDiv.classList.add('hidden')

  ipfs.name.publish(path)
    .then(res => {
      const name = res.name
      showStatus('Success!', COLORS.success)
      DOM.publishResultsDiv.classList.remove('hidden')
      DOM.publishResult.innerText = `/ipns/${name}`
      DOM.publishGatewayLink.href = `${IPFS_DOMAIN}/ipns/${name}`
    })
    .catch(err => {
      showStatus(`Error publishing ${path}`, COLORS.error)
      console.error(err)
    })
}

// Resolves an IPNS name
const resolve = async (name) => {
  showStatus('Resolving...', COLORS.active)
  DOM.resolveResultsDiv.classList.add('hidden')
  try {
    for await (const path of ipfs.name.resolve(name)) {
      showStatus('Success!', COLORS.success)
      DOM.resolveResultsDiv.classList.remove('hidden')
      DOM.resolveResult.innerText = path
      DOM.resolveGatewayLink.href = `${IPFS_DOMAIN}${path}`
    }
  } catch (err) {
    showStatus(`Error resolving ${name}`, COLORS.error)
    console.error(err)
  }
}

// Event listeners
DOM.connect.onsubmit = connect

DOM.publishNew.onsubmit = addAndPublish

DOM.publishPath.onsubmit = (e) => {
  e.preventDefault()
  const input = e.target.elements.path
  publish(input.value)
  input.value = ''
}

DOM.resolveName.onsubmit = (e) => {
  e.preventDefault()
  const input = e.target.elements.name
  resolve(input.value)
  input.value = ''
}
