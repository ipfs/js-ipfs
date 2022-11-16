
import { pushable } from 'it-pushable'

class MessageChannel {
  constructor () {
    this.source = pushable({ objectMode: true })
    this.sink = pushable({ objectMode: true })

    this.clientSink = pushable({ objectMode: true })
  }

  sendMetadata (metadata) {
    this.metadata = metadata
  }

  sendMessage (message) {
    setTimeout(() => {
      this.clientSink.push(message)
    }, 0)
  }

  sendTrailers (trailers) {
    this.trailers = trailers
  }

  end (error) {
    setTimeout(() => {
      this.clientSink.end(error)
    }, 0)
  }

  clientSend (message) {
    setTimeout(() => {
      this.source.push(message)
    }, 0)
  }

  clientEnd (err) {
    setTimeout(() => {
      this.source.end(err)
    }, 0)
  }
}

export function createChannel () {
  return new MessageChannel()
}
