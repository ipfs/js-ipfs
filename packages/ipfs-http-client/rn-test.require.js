'use strict'

require('react-native-get-random-values')
const { polyfill: polyfillReadableStream } = require('react-native-polyfill-globals/src/readable-stream')
const { polyfill: polyfillEncoding } = require('react-native-polyfill-globals/src/encoding')
const { polyfill: polyfillURL } = require('react-native-polyfill-globals/src/url')

polyfillReadableStream()
polyfillEncoding()
polyfillURL()
