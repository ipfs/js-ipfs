var xtend = require('xtend')
var stream = require('readable-stream')
var netpipe = require('../ipfs-network-pipe')
var noop = function() {}

module.exports = ipfsNetwork

var sopts = {objectMode: true, highWaterMark: 16}


//             multiplexes protocols over the netpipe wire
//  dht --->                                                   ---> dht
// xchg ---> outgoing --> join --> wire --> split --> incoming ---> xchng
// idnt --->                                                   ---> idnt
function ipfsNetwork(opts, protocolStreams) {

  // main network pipe
  var wire = netpipe(opts)

  // make the multiplexing pipes
  var unknown = stream.PassThrough(sopts)
  var outgoing = stream.PassThrough(sopts)
  var incoming = stream.Writable(sopts)
  incoming._write = multiplexInput
  outgoing._read = noop

  // wire pipes
  outgoing.pipe(joinPayloads()).pipe(wire)
  wire.pipe(splitPayloads()).pipe(incoming)

  // proto pipes (using numbers)
  var protocols = {}
  for (var k in protocolStreams) {
    var s = protocolStreams[k]
    protocols[protoTable[k]] = s
    s.pipe(outgoing) // pipe all into outgoing
  }

  return segment({
    wire: wire,
    unknown: unknown,
    protocols: protocols,
  })

  function multiplexInput(item, enc, next) {
    var proto = protocols[item.protocol]
    if (proto) {
      proto.push(item)
    } else {
      unknown.push({
        error: new Error('unknown protocol'),
        message: item,
      })
    }
    next()
  }
}

var protoTable = {
  identity: 1,
  routing: 2,
  exchange: 3,
}

// splits all the payloads in each message
function splitPayloads() {
  return through2.obj(function(msg, enc, next) {
    for (var p in msg.payload) {
      var pp = msg.payload[p]
      this.push({
        data: pp.data,
        protocol: pp.protocol,
        source: msg.source,
        destination: msg.destination,
      })
    }
    next()
  })
}

// joins payloads in a stream into one packet
// for now, one payload / pkt. coalesce smartly later.
function joinPayloads() {
  return through2.obj(function(p, enc, next) {
    this.push(ipfsMessage(p.source, p.destination,
        [ {data: p.data, protocol: p.protocol} ]))
    next()
  })
}
