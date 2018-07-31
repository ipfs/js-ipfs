/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const bufferStream = require('pull-buffer-stream')

const {
  createMfs
} = require('./helpers')

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
        expect(error.message).to.contain('Please supply at least one source')
      })
  })

  it('refuses to copy files without files', () => {
    return mfs.cp('destination')
      .then(() => {
        throw new Error('No error was thrown for missing files')
      })
      .catch(error => {
        expect(error.message).to.contain('Please supply at least one source')
      })
  })

  it('refuses to copy files without files even with options', () => {
    return mfs.cp('destination', {})
      .then(() => {
        throw new Error('No error was thrown for missing files')
      })
      .catch(error => {
        expect(error.message).to.contain('Please supply at least one source')
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

  it('refuses to copy files to an exsting file', () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/dest-file-${Math.random()}.txt`

    return mfs.write(source, bufferStream(100), {
      create: true
    })
      .then(() => mfs.write(destination, bufferStream(100), {
        create: true
      }))
      .then(() => mfs.cp(source, destination))
      .then(() => {
        throw new Error('No error was thrown for a non-existent file')
      })
      .catch(error => {
        expect(error.message).to.contain('directory already has entry by that name')
      })
  })

  it('refuses to copy a file to itself', () => {
    const source = `/source-file-${Math.random()}.txt`

    return mfs.write(source, bufferStream(100), {
      create: true
    })
      .then(() => mfs.cp(source, source))
      .then(() => {
        throw new Error('No error was thrown for a non-existent file')
      })
      .catch(error => {
        expect(error.message).to.contain('directory already has entry by that name')
      })
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

  it('copies a file to a pre-existing directory', () => {
    const source = `/source-file-${Math.random()}.txt`
    const directory = `/dest-directory-${Math.random()}`
    const destination = `${directory}${source}`

    return mfs.write(source, bufferStream(500), {
      create: true
    })
      .then(() => mfs.mkdir(directory))
      .then(() => mfs.cp(source, directory))
      .then(() => mfs.stat(destination))
      .then((stats) => {
        expect(stats.size).to.equal(500)
      })
  })

  it('copies directories', () => {
    const source = `/source-directory-${Math.random()}`
    const destination = `/dest-directory-${Math.random()}`

    return mfs.mkdir(source)
      .then(() => mfs.cp(source, destination))
      .then(() => mfs.stat(destination))
      .then((stats) => {
        expect(stats.type).to.equal('directory')
      })
  })

  it('copies directories recursively', () => {
    const directory = `/source-directory-${Math.random()}`
    const subDirectory = `/source-directory-${Math.random()}`
    const source = `${directory}${subDirectory}`
    const destination = `/dest-directory-${Math.random()}`

    return mfs.mkdir(source, {
      parents: true
    })
      .then(() => mfs.cp(directory, destination))
      .then(() => mfs.stat(destination))
      .then((stats) => {
        expect(stats.type).to.equal('directory')
      })
      .then(() => mfs.stat(`${destination}/${subDirectory}`))
      .then((stats) => {
        expect(stats.type).to.equal('directory')
      })
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

  it('copies files from ipfs paths', () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/dest-file-${Math.random()}.txt`

    return mfs.write(source, bufferStream(100), {
      create: true
    })
      .then(() => mfs.stat(source))
      .then((stats) => {
        return mfs.cp(`/ipfs/${stats.hash}`, destination)
      })
      .then(() => mfs.stat(destination))
      .then((stats) => {
        expect(stats.size).to.equal(100)
      })
  })
})
