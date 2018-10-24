'use strict'

module.exports = (send) => ({
  cancel: require('./cancel')(send),
  state: require('./state')(send),
  subs: require('./subs')(send)
})
