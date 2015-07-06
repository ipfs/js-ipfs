var bunyan = require('bunyan')

exports = module.exports

var loggers = {}
var enabled

exports.group = function (name) {
  if (loggers[name]) {
    return loggers[name]
  }

  if (enabled === true || enabled[name]) {
    loggers[name] = createLogger()
    return loggers[name]
  }

  loggers[name] = new NoopLogger()
  return loggers[name]

  function createLogger () {
    var logger = bunyan.createLogger({name: name + '\t'})
    loggers[name] = logger
    return logger
  }
}

if (process.env.IPFS_LOG) {
  if (process.env.IPFS_LOG === '*') {
    enabled = true
  } else {
    enabled = {}
    process.env.IPFS_LOG.split(',').map(function (logGroup) {
      enabled[logGroup] = true
    })
  }
} else {
  enabled = false
}

function NoopLogger () {
  var self = this

  self.trace = function () {}
  self.debug = function () {}
  self.info = function () {}
  self.warn = function () {}
  self.error = function () {}
  self.fatal = function () {}
}
