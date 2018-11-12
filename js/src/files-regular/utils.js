'use strict'

const loadFixture = require('aegir/fixtures')

exports.fixtures = Object.freeze({
  directory: Object.freeze({
    cid: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP',
    files: Object.freeze({
      'pp.txt': loadFixture('js/test/fixtures/test-folder/pp.txt', 'interface-ipfs-core'),
      'holmes.txt': loadFixture('js/test/fixtures/test-folder/holmes.txt', 'interface-ipfs-core'),
      'jungle.txt': loadFixture('js/test/fixtures/test-folder/jungle.txt', 'interface-ipfs-core'),
      'alice.txt': loadFixture('js/test/fixtures/test-folder/alice.txt', 'interface-ipfs-core'),
      'files/hello.txt': loadFixture('js/test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
      'files/ipfs.txt': loadFixture('js/test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core')
    })
  }),
  smallFile: Object.freeze({
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')
  }),
  bigFile: Object.freeze({
    cid: 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq',
    data: loadFixture('js/test/fixtures/15mb.random', 'interface-ipfs-core')
  }),
  sslOpts: Object.freeze({
    key: loadFixture('js/test/fixtures/ssl/privkey.pem', 'interface-ipfs-core'),
    cert: loadFixture('js/test/fixtures/ssl/cert.pem', 'interface-ipfs-core')
  })
})
