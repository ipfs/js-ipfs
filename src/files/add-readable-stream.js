'use strict'

const SendFilesStream = require('../utils/send-files-stream')

module.exports = (send) => SendFilesStream(send, 'add')
