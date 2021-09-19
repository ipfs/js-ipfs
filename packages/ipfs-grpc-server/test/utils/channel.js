
import pushable from 'it-pushable'

class MessageChannel {
  constructor () {
    this.source = pushable()
    this.sink = pushable()

    this.clientSink = pushable()
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
