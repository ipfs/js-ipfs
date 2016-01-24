const isNode = !global.window

module.exports = isNode
  ? require('./node')
  : require('./browser')
