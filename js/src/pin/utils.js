'use strict'

const loadFixture = require('aegir/fixtures')

exports.fixtures = Object.freeze({
  files: Object.freeze([Object.freeze({
    data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core'),
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
  }), Object.freeze({
    data: loadFixture('js/test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
    cid: 'QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu'
  })])
})
