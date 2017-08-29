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
let peerInfo

/*
 * Start and stop the IPFS node
 */

function start () {
  if (!node) {
    updateView('starting', node)

    node = new self.Ipfs({repo: 'ipfs-' + Math.random()})

    node.on('start', () => {
      node.id().then((id) => {
        peerInfo = id
        updateView('ready', node)
        setInterval(refreshPeerList, 1000)
        $peers.innerHTML = '<h2>peers</h2><i>waiting for peers...</i>'
      })
    })
  }
}

function stop () {
  window.location.href = window.location.href // refresh page
}

/*
 * Fetch files and display them to the user
 */

function createFileBlob (data, multihash) {
  const file = new window.Blob(data, {type: 'application/octet-binary'})
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
  const multihash = $multihashInput.value

  $multihashInput.value = ''

  $errors.className = 'hidden'

  if (!multihash) {
    return console.log('no multihash was inserted')
  }

  // files.get documentation
  // https://github.com/ipfs/interface-ipfs-core/tree/master/API/files#get
  node.files.get(multihash, (err, filesStream) => {
    if (err) {
      return onError(err)
    }

    filesStream.on('data', (file) => {
      if (file.content) {
        const buf = []
        // buffer up all the data in the file
        file.content.on('data', (data) => buf.push(data))

        file.content.once('end', () => {
          const listItem = createFileBlob(buf, multihash)

          $filesList.insertBefore(listItem, $filesList.firstChild)
        })

        file.content.resume()
      }
    })
    filesStream.resume()

    filesStream.on('end', () => console.log('Every file was fetched for', multihash))
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
    onError('IPFS must be started before files can be added')
    return
  }
  const dt = event.dataTransfer
  const files = dt.files

  function readFileContents (file) {
    return new Promise((resolve) => {
      const reader = new window.FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.readAsArrayBuffer(file)
    })
  }

  let filesArray = []
  for (let i = 0; i < files.length; i++) {
    filesArray.push(files[i])
  }

  filesArray.map((file) => {
    readFileContents(file)
      .then((buffer) => {
        return node.files.add([{
          path: file.name,
          content: new node.types.Buffer(buffer)
        }])
      })
      .then((files) => {
        $multihashInput.value = files[0].hash
        $filesStatus.innerHTML = files
          .map((e) => `Added ${e.path} as ${e.hash}`)
          .join('<br>')
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
    if (err) {
      return onError(err)
    }

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
        const addr = peer.addr.toString()
        if (addr.indexOf('ipfs') >= 0) {
          return addr
        } else {
          return addr + peer.peer.id.toB58String()
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
    const addressesHtml = peerInfo.addresses.map((address) => {
      return '<li><span class="address">' + address + '</span></li>'
    }).join('')
    $idContainer.innerText = peerInfo.id
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
