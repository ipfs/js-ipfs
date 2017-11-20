'use strict'

const SendFilesStream = require('../utils/send-files-stream')
const toPull = require('stream-to-pull-stream')

module.exports = (send) => (options) => toPull(SendFilesStream(send, 'add')(options))
