'use strict'

const ipfs = window.IpfsApi()

const DOM = {
  status: document.getElementById('status'),
  buttons: document.getElementsByTagName('button'),
  publishNew: document.forms[0],
  publishPath: document.forms[1],
  resolveName: document.forms[2],
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
  for (let btn of DOM.buttons) {
    btn.disabled = false
  }
}

const init = () => {
  ipfs.id()
    .then(res => {
      showStatus(`daemon active\nid: ${res.ID}`, COLORS.success)
      enableForms()
    })
    .catch(err => {
      showStatus('daemon inactive', COLORS.error)
      console.error(err)
    })
}

// Adds a new file to IPFS and publish it
const addAndPublish = (e) => {
  e.preventDefault()

  let input = e.target.elements['text']
  let buffer = new Buffer(input.value)

  showStatus('adding to IPFS...', COLORS.active)

  ipfs.add(buffer)
    .then(res => {
      showStatus(`success!`, COLORS.success)

      publish(res[0].path)

      input.value = ''
    })
    .catch(err => {
      showStatus('failed to add the data', COLORS.error)
      console.error(err)
    })
}

// Publishes an IPFS file or directory under your node's identity
const publish = (path) => {
  showStatus(`publishing...`, COLORS.active)
  DOM.publishResultsDiv.classList.add('hidden')

  ipfs.name.publish(path)
    .then(res => {
      const name = res.Name
      showStatus('success!', COLORS.success)
      DOM.publishResultsDiv.classList.remove('hidden')
      DOM.publishResult.innerText = `/ipns/${name}`
      DOM.publishGatewayLink.href = `${IPFS_DOMAIN}/ipns/${name}`
    })
    .catch(err => {
      showStatus(`error publishing ${path}`, COLORS.error)
      console.error(err)
    })
}

// Resolves an IPNS name
const resolve = (name) => {
  showStatus(`resolving...`, COLORS.active)
  DOM.resolveResultsDiv.classList.add('hidden')

  ipfs.name.resolve(name)
    .then(res => {
      const path = res.Path

      showStatus('success!', COLORS.success)
      DOM.resolveResultsDiv.classList.remove('hidden')
      DOM.resolveResult.innerText = path
      DOM.resolveGatewayLink.href = `${IPFS_DOMAIN}${path}`
    })
    .catch(err => {
      showStatus(`error resolving ${name}`, COLORS.error)
      console.error(err)
    })
}

// Event listeners
DOM.publishNew.onsubmit = addAndPublish

DOM.publishPath.onsubmit = (e) => {
  e.preventDefault()
  let input = e.target.elements['path']
  publish(input.value)
  input.value = ''
}

DOM.resolveName.onsubmit = (e) => {
  e.preventDefault()
  let input = e.target.elements['name']
  resolve(input.value)
  input.value = ''
}

init()
