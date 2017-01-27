const rootElement = document.getElementById('ipfs')
const startButton = document.getElementById('start')
const output = document.getElementById('state')
const details = document.getElementById('details')
const peers = document.getElementById('peers')
const errors = document.getElementById('errors')
const directory = document.getElementById('directory')
const dirInput = document.getElementById('dir')
const signalServerInput = document.getElementById('signalServerInput')
const files = document.getElementById('files')
const multihashInput = document.getElementById('multihash')
const catButton = document.getElementById('cat')

const $connectPeer = document.querySelector('input.connect-peer')
const $connectPeerButton = document.querySelector('button.connect-peer')

let ipfs
let peerInfo

// See signal and data-directory option
// Click start ipfs daemon
// Connect to go-ipfs daemon
// Cat a file from go-ipfs daemon
// Add text in browser and cat with go-ipfs

$connectPeerButton.addEventListener('click', () => {
  console.log('connecting', $connectPeer.value)
  ipfs.swarm.connect($connectPeer.value, (err, res) => {
    console.log(err, res)
  })
})

// Start IPFS instance
function start () {
  if (!ipfs) {
    // Update the UI with initial settings
    updateView('starting', ipfs)

    /*
     * path - 'dirname' of where the IPFS repo is stored
     * signallAddr - address of the signalling server
     */
    const options = {
      path: dirInput.value,
      signalAddr: signalServerInput.value
    }

    // Create an IPFS instance
    window.createNode(options, (err, node) => {
      if (err) {
        return onError(err)
      }

      ipfs = node

      // Get our IPFS instance's info: ID and address
      ipfs.id().then((id) => {
        peerInfo = id
        // Update the UI
        updateView('ready', ipfs)

        setInterval(updatePeers, 1000)
        peers.innerHTML = '<h2>Peers</h2><i>Waiting for peers...</i>'
      })
    })
  }
}

// Stop IPFS instance
// const stop = () => {
//   if (ipfs) {
//     if (pollPeersTimer) {
//       clearInterval(pollPeersTimer)
//     }
//     ipfs.goOffline()
//     ipfs = null
//     updateView('stopped', ipfs)
//   }
// }

// Fetch file contents from IPFS and display it
const catFile = () => {
  // Get the hash to cat from the input field
  const multihash = multihashInput.value

  // Update UI
  errors.className = 'hidden'

  // Get the file from IPFS
  if (multihash) {
    // IPFS.files.cat()
    // https://github.com/ipfs/interface-ipfs-core/tree/master/API/files#javascript---ipfscatmultihash-callback
    ipfs.files.cat(multihash)
      .then((stream) => {
        // Buffer all contents of the file as text
        // and once buffered, create a blob for the picture
        let buf = []
        stream.on('data', (d) => buf.push(d))
        stream.on('end', () => {
          console.log(buf.join(''))
          // const blob = new window.Blob(buf)
          // picture.src = window.URL.createObjectURL(blob)
        })
      })
      .catch(onError)
  }
}

// Display an error
const onError = (e) => {
  console.error(e)
  errors.innerHTML = "<br/><span class='error'>' + e.stack + '</span>"
  errors.className = 'error visible'
}

// Handle file drop
const onDrop = (event) => {
  errors.className = 'hidden'

  event.preventDefault()
  var dt = event.dataTransfer
  var files = dt.files

  const readFileContents = (file) => {
    return new Promise((resolve) => {
      const reader = new window.FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.readAsArrayBuffer(file)
    })
  }

  // TODO: Promise reduce?
  for (var i = 0; i < files.length; i++) {
    const file = files[i]
    console.log('Add file', file.name, file.size)
    readFileContents(file)
      .then((buffer) => {
        // IPFS.files.add()
        // https://github.com/ipfs/interface-ipfs-core/tree/master/API/files#javascript---ipfsfilesadddata-options-callback
        return ipfs.files.add([{
          path: file.name,
          content: new ipfs.types.Buffer(buffer)
        }])
      })
      .then((files) => {
        console.log('Files added', files)
        multihashInput.value = files[0].hash
      })
      .catch(onError)
  }
}

let numberOfPeersLastTime = 0
// Get peers from IPFS and display them
const updatePeers = () => {
  ipfs.swarm.peers((err, res) => {
    if (err) {
      // TODO ??
    }
    // PeerId.toJSON()
    // https://github.com/libp2p/js-peer-id/blob/3ef704ba32a97a9da26a1f821702cdd3f09c778f/src/index.js#L106
    // Multiaddr.toString()
    // https://multiformats.github.io/js-multiaddr/#multiaddrtostring
    if (res.length === numberOfPeersLastTime) {
      return
    }
    numberOfPeersLastTime = res.length
    const peersAsHtml = res
      .map((e, idx) => {
        return '<div class="peer-item">' +
          e.addr.toString() +
          '</div>'
      })
      .join('')

    peers.innerHTML = res.length > 0
      ? '<h2>Connected Peers</h2>' + peersAsHtml
      : '<h2>Connected Peers</h2><i>Waiting for peers...</i>'
  })
}

/* UI functions */
function initView () {
  const initElement = (e, className) => {
    e.innerHTML = ''
    e.className = className
  }

  // Initial view
  const elements = [errors, details, peers]
  elements.map((e) => initElement(e, 'hidden'))
  errors.innerHTML = ''
  dirInput.value = '/ipfs/' + new Date().getTime()
  directory.className = 'visible'
  files.className = 'hidden'
  startButton.disabled = false
  multihashInput.value = null
  // Remove old event listeners
  rootElement.removeEventListener('drop', onDrop)
  startButton.removeEventListener('click', start)
  catButton.removeEventListener('click', catFile)
  // Setup event listeners for interaction
  rootElement.addEventListener('drop', onDrop)
  startButton.addEventListener('click', start)
  catButton.addEventListener('click', catFile)
}

function updateView (state, ipfs) {
  if (state === 'ready') {
    // Set the header to display the current state
    output.innerHTML = 'IPFS running now'
    // Display IPFS info
    details.innerHTML = '<div class="id">' +
      '<strong>Your ID: </strong><br>' +
      peerInfo.id + '<br><br>'
    // Set the file status
    details.className = 'visible'
    peers.className = 'visible'
    files.className = 'visible'
  } else if (state === 'starting') {
    output.innerHTML = 'IPFS daemon is starting...'
    startButton.disabled = true
    directory.className = 'hidden'
  } else if (state === 'stopped') {
    initView()
  }
}

// Start the app
initView()
