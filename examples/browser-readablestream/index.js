'use strict'

/* eslint-env browser */

const Ipfs = require('../../')
const videoStream = require('videostream')
const ipfs = new Ipfs({ repo: 'ipfs-' + Math.random() })
const {
  dragDrop,
  statusMessages,
  createVideoElement,
  log
} = require('./utils')

log('IPFS: Initialising')

ipfs.on('ready', () => {
  // Set up event listeners on the <video> element from index.html
  const videoElement = createVideoElement()
  const hashInput = document.getElementById('hash')
  const goButton = document.getElementById('gobutton')
  let stream

  goButton.onclick = function (event) {
    event.preventDefault()

    log(`IPFS: Playing ${hashInput.value.trim()}`)

    // Set up the video stream an attach it to our <video> element
    videoStream({
      createReadStream: function createReadStream (opts) {
        const start = opts.start

        // The videostream library does not always pass an end byte but when
        // it does, it wants bytes between start & end inclusive.
        // catReadableStream returns the bytes exclusive so increment the end
        // byte if it's been requested
        const end = opts.end ? start + opts.end + 1 : undefined

        log(`Stream: Asked for data starting at byte ${start} and ending at byte ${end}`)

        // If we've streamed before, clean up the existing stream
        if (stream && stream.destroy) {
          stream.destroy()
        }

        // This stream will contain the requested bytes
        stream = ipfs.catReadableStream(hashInput.value.trim(), {
          offset: start,
          length: end && end - start
        })

        // Log error messages
        stream.on('error', (error) => log(error))

        if (start === 0) {
          // Show the user some messages while we wait for the data stream to start
          statusMessages(stream, log)
        }

        return stream
      }
    }, videoElement)
  }

  // Allow adding files to IPFS via drag and drop
  dragDrop(ipfs, log)

  log('IPFS: Ready')
  log('IPFS: Drop an .mp4 file into this window to add a file')
  log('IPFS: Then press the "Go!" button to start playing a video')

  hashInput.disabled = false
  goButton.disabled = false
})
