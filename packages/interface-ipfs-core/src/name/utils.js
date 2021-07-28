'use strict'

const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')

exports.fixture = Object.freeze({
  cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
  data: uint8ArrayFromString('Plz add me!\n')
})
