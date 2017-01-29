window.onerror = onError

const $startButton = document.querySelector('#start')
const $stopButton = document.querySelector('#stop')
const $peers = document.querySelector('#peers')
const $errors = document.querySelector('#errors')
const $filesStatus = document.querySelector('#filesStatus')
const $multihashInput = document.querySelector('#multihash')
const $catButton = document.querySelector('#cat')
const $connectPeer = document.querySelector('input.connect-peer')
const $connectPeerButton = document.querySelector('button.connect-peer')

let ipfs
let peerInfo

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
    ipfs.files.get(multihash, (err, stream) => {
      if (err) onError(err)
      console.log(stream)
      stream.on('data', (file) => {
        console.log(file)
        const buf = []
        if (file.content) {
          file.content.on('data', (data) => {
            console.log('file got data')
            buf.push(data)
          })
          file.content.on('end', (data) => {
            console.log('file got end')
            console.log(buf)
          })
        }
      })
      stream.on('end', () => {
        console.log('no more files')
      })
    })
  }
}

function onError (e) {
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

const onDragEnter = () => {
  document.querySelector('.dragover-popup').style.display = 'block'
  document.querySelector('.wrapper').style.filter = 'blur(5px)'
  document.querySelector('.header').style.filter = 'blur(5px)'
}

const onDragExit = () => {
  console.log('drag left')
  document.querySelector('.dragover-popup').style.display = 'none'
  document.querySelector('.wrapper').style.filter = ''
  document.querySelector('.header').style.filter = ''
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
  document.querySelector('body').addEventListener('dragenter', onDragEnter)
  document.querySelector('body').addEventListener('drop', onDrop)
  // TODO should work to hide the dragover-popup but doesn't...
  document.querySelector('body').addEventListener('dragleave', onDragExit)

  $startButton.addEventListener('click', start)
  $stopButton.addEventListener('click', stop)
  $catButton.addEventListener('click', catFile)
  $connectPeerButton.addEventListener('click', connectPeer)

  // TODO temporary default values, remove before merging
  $connectPeer.value = '/ip4/0.0.0.0/tcp/9999/ws/ipfs/QmSGmyZtL3BPLxkF9yyaitLsotvratuqeWq1UR8V9BDXcV'
  $multihashInput.value = 'QmXxyxhxbt9TU4pJFdpAnqAsTraCMvCNsWsyfe2ZZUjJUn'
}

const states = {
  ready: () => {
    const addressesHtml = peerInfo.addresses.map((address) => {
      return '<li><span class="address">' + address + '</span></li>'
    }).join('')
    document.querySelector('.id-container').innerText = peerInfo.id
    document.querySelector('.addresses-container').innerHTML = addressesHtml
    document.querySelectorAll('button:disabled').forEach(b => { b.disabled = false })
    document.querySelectorAll('input:disabled').forEach(b => { b.disabled = false })
    $peers.className = ''
    document.querySelector('#details').className = ''
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

setupEventListeners()
