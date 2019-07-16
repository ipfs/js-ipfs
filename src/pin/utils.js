'use strict'

const loadFixture = require('aegir/fixtures')

exports.fixtures = Object.freeze({
  // NOTE: files under 'directory' need to be different than standalone ones in 'files'
  directory: Object.freeze({
    cid: 'QmY8KdYQSYKFU5hM7F5ioZ5yYSgV5VZ1kDEdqfRL3rFgcd',
    files: Object.freeze([Object.freeze({
      path: 'test-folder/ipfs-add.js',
      data: loadFixture('test/fixtures/test-folder/ipfs-add.js', 'interface-ipfs-core'),
      cid: 'QmbKtKBrmeRHjNCwR4zAfCJdMVu6dgmwk9M9AE9pUM9RgG'
    }), Object.freeze({
      path: 'test-folder/files/ipfs.txt',
      data: loadFixture('test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core'),
      cid: 'QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w'
    })])
  }),
  files: Object.freeze([Object.freeze({
    data: loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core'),
    cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
  }), Object.freeze({
    data: loadFixture('test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
    cid: 'QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu'
  })])
})
