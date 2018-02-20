'use strict'

const log = (line) => {
  const output = document.getElementById('output')
  let message

  if (line.message) {
    message = `Error: ${line.message.toString()}`
  } else {
    message = line
  }

  if (message) {
    const node = document.createTextNode(`${message}\r\n`)
    output.appendChild(node)

    output.scrollTop = output.offsetHeight

    return node
  }
}

const dragDrop = (ipfs) => {
  const container = document.querySelector('#container')

  container.ondragover = (event) => {
    event.preventDefault()
  }

  container.ondrop = (event) => {
    event.preventDefault()

    Array.prototype.slice.call(event.dataTransfer.items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .forEach(file => {
        const progress = log(`IPFS: Adding ${file.name} 0%`)

        const reader = new window.FileReader()
        reader.onload = (event) => {
          ipfs.files.add({
            path: file.name,
            content: ipfs.types.Buffer.from(event.target.result)
          }, {
            progress: (addedBytes) => {
              progress.textContent = `IPFS: Adding ${file.name} ${parseInt((addedBytes / file.size) * 100)}%\r\n`
            }
          }, (error, added) => {
            if (error) {
              return log(error)
            }

            const hash = added[0].hash

            log(`IPFS: Added ${hash}`)

            document.querySelector('#hash').value = hash
          })
        }

        reader.readAsArrayBuffer(file)
      })

    if (event.dataTransfer.items && event.dataTransfer.items.clear) {
      event.dataTransfer.items.clear()
    }

    if (event.dataTransfer.clearData) {
      event.dataTransfer.clearData()
    }
  }
}

module.exports.statusMessages = (stream) => {
  let time = 0
  const timeouts = [
    'Stream: Still loading data from IPFS...',
    'Stream: This can take a while depending on content availability',
    'Stream: Hopefully not long now',
    'Stream: *Whistles absentmindedly*',
    'Stream: *Taps foot*',
    'Stream: *Looks at watch*',
    'Stream: *Stares at floor*',
    'Stream: *Checks phone*',
    'Stream: *Stares at ceiling*',
    'Stream: Got anything nice planned for the weekend?'
  ].map(message => {
    time += 5000

    return setTimeout(() => {
      log(message)
    }, time)
  })

  stream.once('data', () => {
    log('Stream: Started receiving data')
    timeouts.forEach(clearTimeout)
  })
  stream.once('error', () => {
    timeouts.forEach(clearTimeout)
  })
}

const createVideoElement = () => {
  const videoElement = document.getElementById('video')
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play()
      .catch(log)
  })

  const events = [
    'playing',
    'waiting',
    'seeking',
    'seeked',
    'ended',
    'loadedmetadata',
    'loadeddata',
    'canplay',
    'canplaythrough',
    'durationchange',
    'play',
    'pause',
    'suspend',
    'emptied',
    'stalled',
    'error',
    'abort'
  ]
  events.forEach(event => {
    videoElement.addEventListener(event, () => {
      log(`Video: ${event}`)
    })
  })

  videoElement.addEventListener('error', () => {
    log(videoElement.error)
  })

  return videoElement
}

module.exports.log = log
module.exports.dragDrop = dragDrop
module.exports.createVideoElement = createVideoElement
