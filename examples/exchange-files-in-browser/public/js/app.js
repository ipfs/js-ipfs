'use strict'
/* global self */

const $startButton = document.querySelector('#start')
const $stopButton = document.querySelector('#stop')
const $peers = document.querySelector('#peers')
const $errors = document.querySelector('#errors')
const $filesStatus = document.querySelector('#filesStatus')
const $multihashInput = document.querySelector('#multihash')
const $catButton = document.querySelector('#cat')
const $connectPeer = document.querySelector('input.connect-peer')
const $connectPeerButton = document.querySelector('button.connect-peer')
const $dragoverPopup = document.querySelector('.dragover-popup')
const $wrapper = document.querySelector('.wrapper')
const $header = document.querySelector('.header')
const $body = document.querySelector('body')
const $idContainer = document.querySelector('.id-container')
const $addressesContainer = document.querySelector('.addresses-container')
const $details = document.querySelector('#details')
const $allDisabledButtons = document.querySelectorAll('button:disabled')
const $allDisabledInputs = document.querySelectorAll('input:disabled')
const $filesList = document.querySelector('.file-list')

let node
let info

/*
 * Start and stop the IPFS node
 */

function start () {
  if (!node) {
    updateView('starting', node)

    // DEV: To test with latest js-ipfs
    const IPFS = require('../../../..')
    node = new IPFS({ repo: 'ipfs-' + Math.random() })

    // EXAMPLE
    // node = new self.Ipfs({ repo: 'ipfs-' + Math.random() })

    node.once('start', () => node.id((err, id) => {
      if (err) { return onError(err) }

      info = id
      updateView('ready', node)
      setInterval(refreshPeerList, 1000)
      $peers.innerHTML = '<h2>peers</h2><i>waiting for peers...</i>'
    }))
  }
}

function stop () {
  window.location.href = window.location.href // refresh page
}

/*
 * Fetch files and display them to the user
 */

function createFileBlob (data, multihash) {
  const file = new window.Blob(data, { type: 'application/octet-binary' })
  const fileUrl = window.URL.createObjectURL(file)

  const listItem = document.createElement('div')
  const link = document.createElement('a')
  link.setAttribute('href', fileUrl)
  link.setAttribute('download', multihash)
  const date = (new Date()).toLocaleTimeString()

  link.innerText = date + ' - ' + multihash + ' - Size: ' + file.size
  listItem.appendChild(link)
  return listItem
}

function getFile () {
  const cid = $multihashInput.value

  $multihashInput.value = ''

  $errors.className = 'hidden'

  if (!cid) { return console.log('no multihash was inserted') }

  node.files.get(cid, (err, files) => {
    if (err) { return onError(err) }

    files.forEach((file) => {
      if (file.content) {
        console.log('Fetched file:', cid, file.content.length)

        // TODO: FIX calling createFileBlob makes the Chrome go "Oh Snap"
        const listItem = createFileBlob(file.content, cid)
        $filesList.insertBefore(listItem, $filesList.firstChild)
      }
    })
  })
}

/*
 * Drag and drop
 */
function onDrop (event) {
  onDragExit()
  $errors.className = 'hidden'
  event.preventDefault()

  if (!node) {
    return onError('IPFS must be started before files can be added')
  }
  const dt = event.dataTransfer
  const filesDropped = dt.files

  function readFileContents (file) {
    return new Promise((resolve) => {
      const reader = new window.FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.readAsArrayBuffer(file)
    })
  }

  const files = []
  for (let i = 0; i < filesDropped.length; i++) {
    files.pUsh(filesDropped[i])
  }

  files.forEach((file) => {
    readFileContents(file)
      .then((buffer) => {
        node.files.add(Buffer.from(buffer), (err, filesAdded) => {
          if (err) { return onError(err) }

          const fl = filesAdded[0]
          $multihashInput.value = fl.hash
          $filesStatus.innerHTML = `Added ${file.name} as ${fl.hash}`
        })
      })
      .catch(onError)
  })
}

/*
 * Network related functions
 */

// Get peers from IPFS and display them

function connectToPeer (event) {
  event.target.disabled = true
  node.swarm.connect($connectPeer.value, (err) => {
    if (err) { return onError(err) }

    $connectPeer.value = ''

    setTimeout(() => {
      event.target.disabled = false
    }, 500)
  })
}

function refreshPeerList () {
  node.swarm.peers((err, peers) => {
    if (err) {
      return onError(err)
    }
    const peersAsHtml = peers
      .map((peer) => {
        if (peer.addr) {
          const addr = peer.addr.toString()
          if (addr.indexOf('ipfs') >= 0) {
            return addr
          } else {
            return addr + peer.peer.id.toB58String()
          }
        }
      })
      .map((addr) => {
        return '<li>' + addr + '</li>'
      }).join('')

    $peers.innerHTML = peers.length > 0
      ? '<h2>Remote Peers</h2><ul>' + peersAsHtml + '</ul>'
      : '<h2>Remote Peers</h2><i>Waiting for peers...</i>'
  })
}

/*
 * UI functions
 */

function onError (err) {
  let msg = 'An error occured, check the dev console'

  if (err.stack !== undefined) {
    msg = err.stack
  } else if (typeof err === 'string') {
    msg = err
  }

  $errors.innerHTML = '<span class="error">' + msg + '</span>'
  $errors.className = 'error visible'
}

window.onerror = onError

function onDragEnter () {
  $dragoverPopup.style.display = 'block'
  $wrapper.style.filter = 'blur(5px)'
  $header.style.filter = 'blur(5px)'
}

function onDragExit () {
  $dragoverPopup.style.display = 'none'
  $wrapper.style.filter = ''
  $header.style.filter = ''
}

/*
 * App states
 */
const states = {
  ready: () => {
    const addressesHtml = info.addresses.map((address) => {
      return '<li><span class="address">' + address + '</span></li>'
    }).join('')
    $idContainer.innerText = info.id
    $addressesContainer.innerHTML = addressesHtml
    $allDisabledButtons.forEach(b => { b.disabled = false })
    $allDisabledInputs.forEach(b => { b.disabled = false })
    $peers.className = ''
    $details.className = ''
    $stopButton.disabled = false
    $startButton.disabled = true
  },
  starting: () => {
    $startButton.disabled = true
  }
}

function updateView (state, ipfs) {
  if (states[state] !== undefined) {
    states[state]()
  } else {
    throw new Error('Could not find state "' + state + '"')
  }
}

/*
 * Boot this application!
 */
const startApplication = () => {
  // Setup event listeners
  $body.addEventListener('dragenter', onDragEnter)
  $body.addEventListener('drop', onDrop)
  // TODO should work to hide the dragover-popup but doesn't...
  $body.addEventListener('dragleave', onDragExit)

  $startButton.addEventListener('click', start)
  $stopButton.addEventListener('click', stop)
  $catButton.addEventListener('click', getFile)
  $connectPeerButton.addEventListener('click', connectToPeer)
}

startApplication()
