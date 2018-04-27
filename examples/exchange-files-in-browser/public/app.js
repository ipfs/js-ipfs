/* global self */
'use strict'

// Daemon
const $daemonId = document.querySelector('.daemon-id')
const $daemonAddresses = document.querySelector('.daemon-addresses')
const $logs = document.querySelector('#logs')
// Peers
const $peers = document.querySelector('#peers')
const $peersList = $peers.querySelector('tbody')
const $multiaddrInput = document.querySelector('#multiaddr-input')
const $connectButton = document.querySelector('#peer-btn')
// Files
const $multihashInput = document.querySelector('#multihash-input')
const $fetchButton = document.querySelector('#fetch-btn')
const $dragContainer = document.querySelector('#drag-container')
const $fileHistory = document.querySelector('#file-history tbody')
const $emptyRow = document.querySelector('.empty-row')
// Misc
const $allDisabledButtons = document.querySelectorAll('button:disabled')
const $allDisabledInputs = document.querySelectorAll('input:disabled')
const $allDisabledElements = document.querySelectorAll('.disabled')

let node
let info
let Buffer

/* ===========================================================================
   Start the IPFS node
   =========================================================================== */

function start () {
  if (!node) {
    const options = {
      repo: 'ipfs-' + Math.random(),
      config: {
        Addresses: {
          Swarm: ['/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star']
        }
      }
    }

    // node = new IPFS(options)
    node = new self.Ipfs(options)

    Buffer = node.types.Buffer

    node.once('start', () => {
      node.id()
        .then((id) => {
          info = id
          updateView('ready', node)
          onSuccess('Daemon is ready.')
          setInterval(refreshPeerList, 1000)
        })
        .catch((error) => onError(err))
    })
  }
}

/* ===========================================================================
   Files handling
   =========================================================================== */

function appendFile (name, hash, size, data) {
  const file = new window.Blob([data], { type: 'application/octet-binary' })
  const url = window.URL.createObjectURL(file)
  const row = document.createElement('tr')

  const nameCell = document.createElement('td')
  nameCell.innerHTML = name

  const hashCell = document.createElement('td')
  hashCell.innerHTML = hash

  const sizeCell = document.createElement('td')
  sizeCell.innerText = size

  const downloadCell = document.createElement('td')
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', name)
  link.innerHTML = '<img width=20 class="table-action" src="download.svg" alt="Download" />'
  downloadCell.appendChild(link)

  row.appendChild(nameCell)
  row.appendChild(hashCell)
  row.appendChild(sizeCell)
  row.appendChild(downloadCell)

  $fileHistory.insertBefore(row, $fileHistory.firstChild)
}

function getFile () {
  const cid = $multihashInput.value

  $multihashInput.value = ''

  if (!cid) {
    return onError('No multihash was inserted.')
  }

  node.files.get(cid)
    .then((files) => {
      files.forEach((file) => {
        if (file.content) {
          appendFile(file.name, cid, file.size, file.content)
          onSuccess(`The ${file.name} file was added.`)
          $emptyRow.style.display = 'none'
        }
      })
    })
    .catch((error) => onError('The inserted multihash is invalid.'))
}

/* Drag & Drop
   =========================================================================== */

const onDragEnter = () => $dragContainer.classList.add('dragging')

const onDragLeave = () => $dragContainer.classList.remove('dragging')

function onDrop (event) {
  onDragLeave()
  event.preventDefault()

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
    files.push(filesDropped[i])
  }

  files.forEach((file) => {
    readFileContents(file)
      .then((buffer) => {
        node.files.add({
          path: file.name,
          content: Buffer.from(buffer)
        }, { wrap: true }, (err, filesAdded) => {
          if (err) {
            return onError(err)
          }

          // As we are wrapping the content we use that hash to keep
          // the original file name when adding it to the table
          $multihashInput.value = filesAdded[1].hash

          getFile()
        })
      })
      .catch(onError)
  })
}

/* ===========================================================================
   Peers handling
   =========================================================================== */

function connectToPeer (event) {
  const multiaddr = $multiaddrInput.value

  if (!multiaddr) {
    return onError('No multiaddr was inserted.')
  }

  node.swarm.connect(multiaddr)
    .then(() => {
      onSuccess(`Successfully connected to peer.`)
      $multiaddrInput.value = ''
    })
    .catch((error) => onError('The inserted multiaddr is invalid.'))
}

function refreshPeerList () {
  node.swarm.peers()
    .then((peers) => {
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
          return `<tr><td>${addr}</td></tr>`
        }).join('')

        $peersList.innerHTML = peersAsHtml
    })
    .catch((error) => onError(error))
}

/* ===========================================================================
   Error handling
   =========================================================================== */

function onSuccess (msg) {
  $logs.classList.add('success')
  $logs.innerHTML = msg
}

function onError (err) {
  let msg = 'An error occured, check the dev console'

  if (err.stack !== undefined) {
    msg = err.stack
  } else if (typeof err === 'string') {
    msg = err
  }

  $logs.classList.remove('success')
  $logs.innerHTML = msg
}

window.onerror = onError

/* ===========================================================================
   App states
   =========================================================================== */

const states = {
  ready: () => {
    const addressesHtml = info.addresses.map((address) => {
      return `<li><pre>${address}</pre></li>`
    }).join('')
    $daemonId.innerText = info.id
    $daemonAddresses.innerHTML = addressesHtml
    $allDisabledButtons.forEach(b => { b.disabled = false })
    $allDisabledInputs.forEach(b => { b.disabled = false })
    $allDisabledElements.forEach(el => { el.classList.remove('disabled') })
  }
}

function updateView (state, ipfs) {
  if (states[state] !== undefined) {
    states[state]()
  } else {
    throw new Error('Could not find state "' + state + '"')
  }
}

/* ===========================================================================
   Boot the app
   =========================================================================== */

const startApplication = () => {
  // Setup event listeners
  $dragContainer.addEventListener('dragenter', onDragEnter)
  $dragContainer.addEventListener('drop', onDrop)
  $dragContainer.addEventListener('dragleave', onDragLeave)
  $fetchButton.addEventListener('click', getFile)
  $connectButton.addEventListener('click', connectToPeer)

  start();
}

startApplication()
