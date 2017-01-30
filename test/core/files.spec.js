/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pull = require('pull-stream')
const series = require('async/series')
const concat = require('concat-stream')
const through = require('through2')

const IPFS = require('../../src/core')
const createTempRepo = require('../utils/create-repo-node.js')

describe('files', () => {
  const rootHash = 'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK'
  let ipfs

  before((done) => {
    const repo = createTempRepo()
    ipfs = new IPFS(repo)
    series([
      (cb) => ipfs.init({ bits: 1024 }, cb),
      (cb) => ipfs.load(cb)
    ], done)
  })

  it('can add deeply nested heterogeneous dirs', done => {
    const files = [
      { path: 'a/b/c/d/e', content: pull.values([new Buffer('banana')]) },
      { path: 'a/b/c/d/f', content: pull.values([new Buffer('strawberry')]) },
      { path: 'a/b/g', content: pull.values([new Buffer('ice')]) },
      { path: 'a/b/h', content: pull.values([new Buffer('cream')]) }
    ]

    ipfs.files.add(files, (err, res) => {
      expect(err).to.not.exist
      const root = res[res.length - 1]

      expect(root.path).to.equal('a')
      expect(root.hash).to.equal(rootHash)
      done()
    })
  })

  it('can export that dir', done => {
    ipfs.files.get(rootHash, (err, stream) => {
      expect(err).to.not.exist

      // accumulate the files and their content
      var files = []
      stream.pipe(through.obj((file, enc, next) => {
        if (file.content) {
          file.content.pipe(concat((content) => {
            files.push({
              path: file.path,
              content: content
            })
            next()
          }))
        } else {
          files.push(file)
          next()
        }
      }, () => {
        files = files.sort(byPath)
        // Check paths
        var paths = files.map((file) => file.path)
        expect(paths).to.include.members([
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK',
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK/b',
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK/b/c',
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK/b/c/d',
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK/b/c/d/e',
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK/b/c/d/f',
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK/b/g',
          'QmdCrquDwd7RfZ6GCZFEVADwe8uyyw1YmF9mtAB7etDgmK/b/h'
        ])

        // Check contents
        var contents = files.map(function (file) {
          return file.content ? file.content.toString() : null
        })

        expect(contents).to.include.members([
          'banana',
          'strawberry',
          'ice',
          'cream'
        ])
        done()
      }))
    })
  })
})

function byPath (a, b) {
  if (a.path > b.path) return 1
  if (a.path < b.path) return -1
  return 0
}
