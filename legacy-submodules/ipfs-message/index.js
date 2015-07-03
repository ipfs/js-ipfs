var fs = require('fs')
var msgproto = require('msgproto')
var Message = msgproto.Message

module.exports = ipfsMessage

function ipfsMessage(src, dst, payloads) {
  if (!(this instanceof Message))
    return new ipfsMessage(src, dst, payloads)

  Message.call(this)

  this.source = src || new Buffer(0)
  this.destination = dst || new Buffer(0)
  this.payload = payloads || []
}

Message.inherits(ipfsMessage, Message)

ipfsMessage.prototype.getEncodedData = function() {
  // no super because Message doesn't do anything.
  return {
    source: this.source,
    destination: this.destination,
    payload: this.payload,
  }
}

ipfsMessage.prototype.setDecodedData = function(data) {
  // no super because Message doesn't do anything.
  this.payload = data.payload
  this.source = data.source
  this.destination = data.destination
}

var src = fs.readFileSync(__dirname + '/message.proto', 'utf-8')
var protos = msgproto.ProtobufCodec.fromProtoSrc(src)
ipfsMessage.codec = protos.Message
