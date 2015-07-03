var _ = require('underscore')
var multihashing = require('multihashing')

module.exports = DHT

var log = function(s) {
  console.log('ipfs-dht: ' + s)
}

// returned when the given key (node id or value key) is not found
var NotFound = DHT.NotFound = new Error('Not Found')

// returned when the DHT service is not available
var NotAvailable = DHT.NotAvailable = new Error('Not Available')

// thrown when the function is not yet implemented (dev only)
var NotImplemented = DHT.NotImplemented = new Error('Not Implemented')

// returned when the the query's timeout has exceeded
var TimeoutExceeded = DHT.TimeoutExceeded = new Error('Timeout Exceeded')


// IPFS DHT is really a DSHT.
// A combination of Coral + S/Kademlia

function DHT(config) {
  this.config = _.defaults(config || {}, this.defaultConfig)

  if (!config.network)
    throw new Error('ipfs-dht requires config.network stream')

  this.network = DHTStream(config.network)

  // locally stored blocks to periodically republish
  // Note: should probably query live storage.
  this.republish = { sloppy: [], strict: [] } // [ [ key, val, timeLastPublished ] ]
}

// default configuration
DHT.prototype.defaultConfig = {

  // time to wait between republishing intervals (in ms)
  republishInterval: 2 * 60 * 1000, // 2 minutes. TODO change to 1 hr

  // hash function multihash code
  multihashFn: 'sha1',

}

// findNode looks for a particular node
// callback returns a (peer)
// callback errors: {TimeoutExceeded, NotFound}
DHT.prototype.findNode = function findNode(nodeId, cb) {
  throw NotImplemented
}

// ping tests connectivity + latency to a particular node
// callback returns connectivity info
// callback errors: {TimeoutExceeded}
DHT.prototype.pingNode = function ping(peer, timeout, cb) {
  timeout = timeout || this.config.pingWait
  this.request(peer, pkt.Ping(), function(err, res) {

  })
}

// getValue looks for a particular key and returns the associated value
// callback returns a Buffer
// callback errors: {TimeoutExceeded, NotFound}
DHT.prototype.getValue = function getValue(key, cb) {
  throw NotImplemented
}

// setValue stores a value for a particular key
// callback returns null
// callback errors: {NotAvailable}
DHT.prototype.setValue = function setValue(key, value, cb) {
  key = this._coerceMultihash(key)
  throw NotImplemented
}

// getSloppyValues finds (at least) a number of values for given key
// callback returns [Value, ...]
// callback errors: {TimeoutExceeded, NotFound}
// Note: TimeoutExceeded callback may include less than num values
DHT.prototype.getSloppyValues = function getSloppyValues(key, num, cb) {
  throw NotImplemented
}

// setSloppyValues sets a value for given key
// callback returns null
// callback errors: {NotAvailable}
DHT.prototype.setSloppyValue = function setSloppyValue(key, value, cb) {
  throw NotImplemented
}


// _periodicRepublish scans + re-publishes list of published key/values
DHT.prototype._periodicRepublish = function() {
  var self = this
  var now = new Date()

  function shouldRepublish(lastTime) {
    return (now - lastTime) > self.republishInterval
  }

  _.map(this.republish.strict, function(item) {
    log('considering republishing ' + item[0])
    if (shouldRepublish(item[2]))
      self.setValue(item[0], item[1])
  })

  _.map(this.republish.sloppy, function(item) {
    log('considering republishing ' + item[0])
    if (shouldRepublish(item[2]))
      self.setSloppyValue(item[0], item[1])
  })

  // rerun this callback every 5 seconds.
  _.delay(this._periodicRepublish.bind(this), 5 * 1000)
}

// _handleMessage unpacks + figures out what to do with an incoming message
DHT.prototype._handleMessage = function(msg) {

}

DHT.prototype._coerceMultihash = function coerceMultihash(hash) {
  if (!(hash instanceof Buffer))
    hash = new Buffer(hash)

  if (multihashing.multihash.validate(hash) !== false)
    hash = multihashing(hash, this.config.multihashFn)

  return hash
}


