'use strict'

const loadFixture = require('aegir/fixtures')

exports.fixture = Object.freeze({
  data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core'),
  cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
})
