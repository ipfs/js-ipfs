/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const bufferStream = require('./fixtures/buffer-stream')

const {
  createMfs
} = require('./fixtures')

describe('cp', function () {
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

  it('refuses to copy files without arguments', () => {
    return mfs.cp()
      .then(() => {
        throw new Error('No error was thrown for missing files')
      })
      .catch(error => {
        expect(error.message).to.contain('Please specify a source(s) and a destination')
      })
  })

  it('refuses to copy files without files', () => {
    return mfs.cp('destination')
      .then(() => {
        throw new Error('No error was thrown for missing files')
      })
      .catch(error => {
        expect(error.message).to.contain('Please specify a source(s) and a destination')
      })
  })

  it('refuses to copy files without files', () => {
    return mfs.cp('destination', {})
      .then(() => {
        throw new Error('No error was thrown for missing files')
      })
      .catch(error => {
        expect(error.message).to.contain('Please specify a path to copy')
      })
  })

  it('refuses to copy a file to a non-existent directory', () => {
    return mfs.cp('/i-do-not-exist', '/output')
      .then(() => {
        throw new Error('No error was thrown for a non-existent file')
      })
      .catch(error => {
        expect(error.message).to.contain('did not exist')
      })
  })

  it.skip('refuses to copy multiple files to one file', () => {

  })

  it('copies a file to new location', () => {
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
      .then(() => mfs.cp(source, destination))
      .then(() => mfs.read(destination))
      .then((buffer) => {
        expect(buffer).to.deep.equal(data)
      })
  })

  it.skip('copies a file to a directory', () => {

  })

  it.skip('copies directories', () => {

  })

  it.skip('refuses to copy directories recursively without the recursive flag', () => {

  })

  it.skip('copies directories recursively', () => {

  })

  it('copies multiple files to new location', () => {
    const sources = [{
      path: `/source-file-${Math.random()}.txt`,
      data: Buffer.alloc(0)
    }, {
      path: `/source-file-${Math.random()}.txt`,
      data: Buffer.alloc(0)
    }]
    const destination = `/dest-dir-${Math.random()}`

    // Do the writes sequentially until the race condition is solved..
    return mfs.write(sources[0].path, bufferStream(500, {
      collector: (bytes) => {
        sources[0].data = Buffer.concat([sources[0].data, bytes])
      }
    }), {
      create: true
    })
      .then(() => mfs.write(sources[1].path, bufferStream(500, {
        collector: (bytes) => {
          sources[1].data = Buffer.concat([sources[1].data, bytes])
        }
      }), {
        create: true
      }))
      .then(() => mfs.cp(sources[0].path, sources[1].path, destination, {
        parents: true
      }))
      .then(() => Promise.all(
        sources.map((source, index) => mfs.read(`${destination}${source.path}`)
          .then((buffer) => {
            expect(buffer).to.deep.equal(sources[index].data)
          })
        )
      ))
  })
})
