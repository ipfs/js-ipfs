'use strict'

module.exports = config => ({
  addLink: require('./add-link')(config),
  appendData: require('./append-data')(config),
  rmLink: require('./rm-link')(config),
  setData: require('./set-data')(config)
})
