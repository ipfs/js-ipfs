/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const bufferStream = require('pull-buffer-stream')
const {
  createMfs
} = require('./helpers')

describe('mv', function () {
  this.timeout(30000)

  let mfs

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  after((done) => {
    mfs.node.stop(done)
  })

  it('refuses to move files without arguments', () => {
    return mfs.mv()
      .then(() => {
        throw new Error('No error was thrown for missing files')
      })
      .catch(error => {
        expect(error.message).to.contain('Please supply at least one source')
      })
  })

  it('refuses to move files without enough arguments', () => {
    return mfs.mv('destination')
      .then(() => {
        throw new Error('No error was thrown for missing files')
      })
      .catch(error => {
        expect(error.message).to.contain('Please supply at least one source')
      })
  })

  it('moves a file', () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/dest-file-${Math.random()}.txt`
    let data = Buffer.alloc(0)

    return mfs.write(source, bufferStream(500, {
      collector: (bytes) => {
        data = Buffer.concat([data, bytes])
      }
    }), {
      create: true
    })
      .then(() => mfs.mv(source, destination))
      .then(() => mfs.read(destination))
      .then((buffer) => {
        expect(buffer).to.deep.equal(data)
      })
      .then(() => mfs.stat(source))
      .then(() => {
        throw new Error('File was copied but not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${source} did not exist`)
      })
  })

  it('moves a directory', () => {
    const source = `/source-directory-${Math.random()}`
    const destination = `/dest-directory-${Math.random()}`

    return mfs.mkdir(source)
      .then(() => mfs.mv(source, destination, {
        recursive: true
      }))
      .then(() => mfs.stat(destination))
      .then((stats) => {
        expect(stats.type).to.equal('directory')
      })
      .then(() => mfs.stat(source))
      .then(() => {
        throw new Error('Directory was copied but not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${source} did not exist`)
      })
  })

  it('moves directories recursively', () => {
    const directory = `source-directory-${Math.random()}`
    const subDirectory = `/source-directory-${Math.random()}`
    const source = `/${directory}${subDirectory}`
    const destination = `/dest-directory-${Math.random()}`

    return mfs.mkdir(source)
      .then(() => mfs.mv(`/${directory}`, destination, {
        recursive: true
      }))
      .then(() => mfs.stat(destination))
      .then((stats) => {
        expect(stats.type).to.equal('directory')
      })
      .then(() => mfs.stat(`${destination}${subDirectory}`))
      .then((stats) => {
        expect(stats.type).to.equal('directory')
      })
      .then(() => mfs.stat(source))
      .then(() => {
        throw new Error('Directory was copied but not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Cannot find ${source} - ${directory} did not exist`)
      })
  })
})
