'use strict'

const log = (line) => {
  if (!line) return

  const output = document.getElementById('output')
  let message

  if (line.message) {
    message = `Error: ${line.message.toString()}`
    console.error(line)
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

  container.ondrop = async (event) => {
    event.preventDefault()

    const files = Array.from(event.dataTransfer.items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .map(file => {
        return {
          path: file.name,
          content: file
        }
      })

    const progress = log(`IPFS: Adding...`)

    for await (const added of ipfs.addAll(files, {
      progress: (addedBytes) => {
        progress.textContent = `IPFS: Adding ${addedBytes} bytes\r\n`
      }
    })) {
      log(`IPFS: Added ${added.cid}`)

      document.querySelector('#cid').value = added.cid.toString()
    }

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
