'use strict'

module.exports = {
  add: require('./add'),
  init: require('./init'),
  start: require('./start'),
  stop: require('./stop'),
  legacy: {
    config: require('../components/config'),
    dag: require('../components/dag'),
    libp2p: require('../components/libp2p'),
    object: require('../components/object'),
    pin: require('../components/pin')
  }
}
