window.onerror = onError

// const rootElement = document.getElementById('ipfs')
const startButton = document.getElementById('start')
const stopButton = document.getElementById('stop')
// const details = document.getElementById('details')
const peers = document.getElementById('peers')
const errors = document.getElementById('errors')
const filesStatus = document.getElementById('filesStatus')
const multihashInput = document.getElementById('multihash')
const catButton = document.getElementById('cat')
const $connectPeer = document.querySelector('input.connect-peer')
const $connectPeerButton = document.querySelector('button.connect-peer')

let ipfs
let peerInfo

// Start IPFS instance
function start () {
  if (!ipfs) {
    // Update the UI with initial settings
    updateView('starting', ipfs)

    window.createNode((err, node) => {
      if (err) {
        return onError(err)
      }

      ipfs = node

      // Get our IPFS instance's info: ID and address
      ipfs.id().then((id) => {
        peerInfo = id
        // Update the UI
        updateView('ready', ipfs)

        // Poll for peers from IPFS and display them
        setInterval(updatePeers, 1000)
        peers.innerHTML = '<h2>Peers</h2><i>Waiting for peers...</i>'
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
    $connectPeer.value = ''
    if (err) return onError(err)
    setTimeout(() => {
      e.target.disabled = false
    }, 500)
  })
}

// Fetch file contents from IPFS and display it
const catFile = () => {
  // Get the hash to cat from the input field
  const multihash = multihashInput.value
  multihashInput.value = ''

  errors.className = 'hidden'

  if (multihash) {
    ipfs.files.get(multihash, (err, stream) => {
      if (err) onError(err)
      // TODO files.get doesnt work properly...
      // when it's working, this should be used instead
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
      // TODO since .get doesn't work, we use the following code with .cat instead
      // const buf = []
      // stream.on('data', (data) => {
      //   buf.push(data.toString())
      // })
      // stream.on('end', () => {
      //   const downloadContent = window.btoa(window.unescape(window.encodeURIComponent(buf.join(''))))
      //   const downloadLink = 'data:application/octet-stream;charset=utf-8;base64,' + downloadContent
      //   const listItem = document.createElement('div')
      //   const link = document.createElement('a')
      //   link.setAttribute('href', downloadLink)
      //   link.setAttribute('download', multihash)
      //   const date = (new Date()).toLocaleTimeString()
      //   link.innerText = date + ' - ' + multihash
      //   const fileList = document.querySelector('.file-list')

      //   listItem.appendChild(link)
      //   fileList.insertBefore(listItem, fileList.firstChild)
      // })
    })
  }
}

function onError (e) {
  if (e.stack !== undefined) {
    console.error(e)
    errors.innerHTML = '<span class="error">' + e.stack + '</span>'
  }
  if (typeof e === 'string') {
    errors.innerHTML = '<span class="error">' + e + '</span>'
  }
  errors.className = 'error visible'
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
        return ipfs.files.add([{
          path: file.name,
          content: new ipfs.types.Buffer(buffer)
        }])
      })
      .then((files) => {
        console.log('Files added', files)
        multihashInput.value = files[0].hash
        filesStatus.innerHTML = files
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

      peers.innerHTML = res.length > 0
        ? '<h2>Remote Peers</h2><ul>' + peersAsHtml + '</ul>'
        : '<h2>Remote Peers</h2><i>Waiting for peers...</i>'
    } else {
    }
    numberOfPeersLastTime = res.length
  })
}

// TODO remove the whole initView, should be initial markup in index.html
function initView () {
  errors.innerHTML = ''
  errors.className = 'hidden'
  startButton.disabled = false
  stopButton.disabled = true

  // Setup event listeners for interaction
  document.querySelector('body').addEventListener('dragenter', onDragEnter)
  document.querySelector('body').addEventListener('drop', onDrop)
  // TODO should work to hide the dragover-popup but doesn't...
  document.querySelector('body').addEventListener('dragleave', onDragExit)

  startButton.addEventListener('click', start)
  stopButton.addEventListener('click', stop)
  catButton.addEventListener('click', catFile)
  $connectPeerButton.addEventListener('click', connectPeer)

  // TODO temporary default values, remove before merging
  $connectPeer.value = '/ip4/0.0.0.0/tcp/9999/ws/ipfs/QmSGmyZtL3BPLxkF9yyaitLsotvratuqeWq1UR8V9BDXcV'
  multihashInput.value = 'QmXxyxhxbt9TU4pJFdpAnqAsTraCMvCNsWsyfe2ZZUjJUn'
}

function updateView (state, ipfs) {
  if (state === 'ready') {
    const addressesHtml = peerInfo.addresses.map((address) => {
      return '<li><span class="address">' + address + '</span></li>'
    }).join('')
    document.querySelector('.id-container').innerText = peerInfo.id
    document.querySelector('.addresses-container').innerHTML = addressesHtml

    document.querySelectorAll('button:disabled').forEach(b => { b.disabled = false })
    document.querySelectorAll('input:disabled').forEach(b => { b.disabled = false })

    document.querySelector('#peers').className = ''
    document.querySelector('#details').className = ''

    stopButton.disabled = false
    startButton.disabled = true
  } else if (state === 'starting') {
    startButton.disabled = true
  } else if (state === 'stopped') {
    initView()
  }
}

// Start the app
initView()
