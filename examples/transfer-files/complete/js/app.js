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

let ipfs
let peerInfo

// TODO groups to refactor into
// ipfs stuff
//  start node
//  get details
//  get peers
//  connect to peer
//  get contents of hash
//  add files to ipfs
// creating html stuff
//  list of peers / peers state
//  add file to download list
//  error handling
//  show ipfs id
//  show ipfs addressess
// drag-and-drop
// event listeners
// states

function start () {
  if (!ipfs) {
    updateView('starting', ipfs)
    window.createNode((err, node) => {
      if (err) {
        return onError(err)
      }
      ipfs = node
      ipfs.id().then((id) => {
        peerInfo = id
        updateView('ready', ipfs)
        setInterval(updatePeers, 1000)
        $peers.innerHTML = '<h2>Peers</h2><i>Waiting for peers...</i>'
      })
    })
  }
}

const stop = () => {
  window.location.href = window.location.href
}

const connectPeer = (e) => {
  e.target.disabled = true
  // Connect directly to a peer via it's multiaddr
  ipfs.swarm.connect($connectPeer.value, (err) => {
    console.log(err)
    if (err) return onError(err)
    $connectPeer.value = ''
    setTimeout(() => {
      e.target.disabled = false
    }, 500)
  })
}

const catFile = () => {
  const multihash = $multihashInput.value
  $multihashInput.value = ''
  $errors.className = 'hidden'
  if (multihash) {
    // Get a file or many files
    ipfs.files.get(multihash, (err, stream) => {
      if (err) {
        onError(err)
      }
      console.log(stream)

      // .get gives us a stream of files
      stream.on('data', (file) => {
        console.log('got file', file)

        const buf = []

        if (file.content) {
          // once we get a file, we also want to read the data for that file
          file.content.on('data', (data) => buf.push(data))

          file.content.on('end', () => {
            console.log('The buf', buf)

            const content = new window.Blob(buf, {type: 'application/octet-binary'})
            const contentUrl = window.URL.createObjectURL(content)

            const listItem = document.createElement('div')
            const link = document.createElement('a')
            link.setAttribute('href', contentUrl)
            link.setAttribute('download', multihash)
            const date = (new Date()).toLocaleTimeString()

            link.innerText = date + ' - ' + multihash + ' - Size: ' + file.size
            const fileList = document.querySelector('.file-list')

            listItem.appendChild(link)
            fileList.insertBefore(listItem, fileList.firstChild)
          })

          file.content.resume()
        }
      })

      stream.on('end', () => console.log('no more files'))
    })
  }
}

const onError = (e) => {
  console.error(e)
  let msg = 'An error occured, check the dev console'
  if (e.stack !== undefined) {
    msg = e.stack
  } else if (typeof e === 'string') {
    msg = e
  }
  $errors.innerHTML = '<span class="error">' + msg + '</span>'
  $errors.className = 'error visible'
}
window.onerror = onError

const onDragEnter = () => {
  $dragoverPopup.style.display = 'block'
  $wrapper.style.filter = 'blur(5px)'
  $header.style.filter = 'blur(5px)'
}

const onDragExit = () => {
  console.log('drag left')
  $dragoverPopup.style.display = 'none'
  $wrapper.style.filter = ''
  $header.style.filter = ''
}

// Handle file drop
const onDrop = (event) => {
  onDragExit()
  $errors.className = 'hidden'
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
        return ipfs.files.add([{
          path: file.name,
          content: new ipfs.types.Buffer(buffer)
        }])
      })
      .then((files) => {
        console.log('Files added', files)
        $multihashInput.value = files[0].hash
        $filesStatus.innerHTML = files
          .map((e) => `Added ${e.path} as ${e.hash}`)
          .join('<br>')
      })
      .catch(onError)
  }
}

// Get peers from IPFS and display them
let numberOfPeersLastTime = 0
const updatePeers = () => {
  // Once in a while, we need to refresh our list of peers in the UI
  // .swarm.peers returns an array with all our currently connected peer
  ipfs.swarm.peers((err, res) => {
    if (err) onError(err)
    if (numberOfPeersLastTime !== res.length) {
      const peersAsHtml = res.map((p) => p.addr.toString())
        .map((p) => {
          return '<li>' + p + '</li>'
        }).join()

      $peers.innerHTML = res.length > 0
        ? '<h2>Remote Peers</h2><ul>' + peersAsHtml + '</ul>'
        : '<h2>Remote Peers</h2><i>Waiting for peers...</i>'
    }
    numberOfPeersLastTime = res.length
  })
}

function setupEventListeners () {
  $body.addEventListener('dragenter', onDragEnter)
  $body.addEventListener('drop', onDrop)
  // TODO should work to hide the dragover-popup but doesn't...
  $body.addEventListener('dragleave', onDragExit)

  $startButton.addEventListener('click', start)
  $stopButton.addEventListener('click', stop)
  $catButton.addEventListener('click', catFile)
  $connectPeerButton.addEventListener('click', connectPeer)
}

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

const startApplication = () => {
  setupEventListeners()
}

startApplication()
