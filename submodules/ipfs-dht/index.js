
module.exports = DHT

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
  this.config = config || {}
}

// findNode looks for a particular node
// callback returns a (nodeId, nodeAddr) tuple
// callback errors: {TimeoutExceeded, NotFound}
DHT.prototype.findNode = function findNode(nodeId, cb) {
  throw NotImplemented
}

// ping tests connectivity + latency to a particular node
// callback returns connectivity info
// callback errors: {TimeoutExceeded, NotFound}
DHT.prototype.pingNode = function ping(nodeId, nodeAddr, cb) {
  throw NotImplemented
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
