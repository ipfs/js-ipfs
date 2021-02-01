'use strict'

const path = require('path')

module.exports = {
  require: path.join(__dirname, 'rn-test.require.js'),
  runner: 'mocha',
  modules: [
    'react-native-get-random-values',
    'react-native-url-polyfill',
    'web-streams-polyfill'
  ],
  patches: [{
    path: require.resolve('react-native-polyfill-globals/patches/react-native+0.63.3.patch')
  }]
}
