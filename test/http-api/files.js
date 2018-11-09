/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const DaemonFactory = require('ipfsd-ctl')
const expect = chai.expect
chai.use(dirtyChai)
const {
  FILE_TYPES
} = require('ipfs-mfs')

const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })

describe('.files', () => {
  let ipfs = null
  let ipfsd = null
  before(function (done) {
    this.timeout(20 * 1000)
    df.spawn({
      initOptions: { bits: 512 },
      config: { Bootstrap: [] }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api
      done()
    })
  })

  after(function (done) {
    this.timeout(20 * 1000)
    if (ipfsd) {
      ipfsd.stop(done)
    } else {
      done()
    }
  })

  describe('.add', function () {
    it('performs a speculative add, --only-hash', () => {
      const content = String(Math.random())

      return ipfs.add(Buffer.from(content), { onlyHash: true })
        .then(files => {
          const getAttempt = ipfs.object.get(files[0].hash)
            .then(() => {
              throw new Error('Should not find an object for content added with --only-hash')
            })

          return Promise.race([
            getAttempt,
            new Promise((resolve, reject) => setTimeout(resolve, 4000))
          ])
        })
    })
  })

  describe('.ls', function () {
    it('lists empty directory', () => {
      return ipfs.files.ls()
        .then(files => {
          expect(files).to.be.empty()
        })
    })

    it('lists files', () => {
      const fileName = `single-file-${Math.random()}.txt`

      return ipfs.files.write(`/${fileName}`, Buffer.from('Hello world'), {
        create: true
      })
        .then(() => ipfs.files.ls())
        .then(files => {
          expect(files.length).to.equal(1)
          expect(files[0].name).to.equal(fileName)
        })
    })

    it('lists files in directories', () => {
      const dirName = `dir-${Math.random()}`
      const fileName = `file-in-dir-${Math.random()}.txt`

      return ipfs.files.write(`/${dirName}/${fileName}`, Buffer.from('Hello world'), {
        create: true,
        parents: true
      })
        .then(() => ipfs.files.ls(`/${dirName}`))
        .then(files => {
          expect(files.length).to.equal(1)
          expect(files[0].name).to.equal(fileName)
        })
    })
  })

  describe('.cp', function () {
    it('copies a file', () => {
      const source = `source-file-${Math.random()}.txt`
      const destination = `destination-file-${Math.random()}.txt`

      return ipfs.files.write(`/${source}`, Buffer.from('Hello world'), {
        create: true
      })
        .then(() => ipfs.files.cp(`/${source}`, `/${destination}`))
        .then(() => ipfs.files.ls(`/`, {
          long: true
        }))
        .then(files => {
          const sourceFile = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceFile.type).to.equal(FILE_TYPES.file)

          const destFile = files
            .filter(file => file.name === destination)
            .pop()

          expect(destFile.type).to.equal(FILE_TYPES.file)
        })
    })

    it('copies a directory', () => {
      const source = `source-dir-${Math.random()}`
      const destination = `destination-dir-${Math.random()}`

      return ipfs.files.mkdir(`/${source}`)
        .then(() => ipfs.files.cp(`/${source}`, `/${destination}`))
        .then(() => ipfs.files.ls(`/`, {
          long: true
        }))
        .then(files => {
          const sourceDir = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceDir.type).to.equal(FILE_TYPES.directory)

          const destDir = files
            .filter(file => file.name === destination)
            .pop()

          expect(destDir.type).to.equal(FILE_TYPES.directory)
        })
    })

    it('copies a file with array args', () => {
      const source = `source-file-${Math.random()}.txt`
      const destination = `destination-file-${Math.random()}.txt`

      return ipfs.files.write(`/${source}`, Buffer.from('Hello world'), {
        create: true
      })
        .then(() => ipfs.files.cp([`/${source}`, `/${destination}`]))
        .then(() => ipfs.files.ls(`/`, {
          long: true
        }))
        .then(files => {
          const sourceFile = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceFile.type).to.equal(FILE_TYPES.file)

          const destFile = files
            .filter(file => file.name === destination)
            .pop()

          expect(destFile.type).to.equal(FILE_TYPES.file)
        })
    })

    it('copies a directory with array args', () => {
      const source = `source-dir-${Math.random()}`
      const destination = `destination-dir-${Math.random()}`

      return ipfs.files.mkdir(`/${source}`)
        .then(() => ipfs.files.cp([`/${source}`, `/${destination}`]))
        .then(() => ipfs.files.ls(`/`, {
          long: true
        }))
        .then(files => {
          const sourceDir = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceDir.type).to.equal(FILE_TYPES.directory)

          const destDir = files
            .filter(file => file.name === destination)
            .pop()

          expect(destDir.type).to.equal(FILE_TYPES.directory)
        })
    })
  })

  describe('.mkdir', function () {
    it('makes a directory', () => {
      const directory = `directory-${Math.random()}`

      return ipfs.files.mkdir(`/${directory}`)
        .then(() => ipfs.files.ls(`/`, {
          long: true
        }))
        .then(files => {
          const dir = files
            .filter(file => file.name === directory)
            .pop()

          expect(dir.type).to.equal(FILE_TYPES.directory)
        })
    })
  })

  describe('.mv', function () {
    it('moves a file', () => {
      const source = `source-file-${Math.random()}.txt`
      const destination = `destination-file-${Math.random()}.txt`

      return ipfs.files.write(`/${source}`, Buffer.from('Hello world'), {
        create: true
      })
        .then(() => ipfs.files.mv(`/${source}`, `/${destination}`))
        .then(() => ipfs.files.ls(`/`))
        .then(files => {
          const sourceFile = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceFile).to.not.exist()

          const destFile = files
            .filter(file => file.name === destination)
            .pop()

          expect(destFile.type).to.equal(FILE_TYPES.file)
        })
    })

    it('moves a directory', () => {
      const source = `source-dir-${Math.random()}`
      const destination = `destination-dir-${Math.random()}`

      return ipfs.files.mkdir(`/${source}`)
        .then(() => ipfs.files.mv(`/${source}`, `/${destination}`))
        .then(() => ipfs.files.ls(`/`, {
          long: true
        }))
        .then(files => {
          const sourceDir = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceDir).to.not.exist()

          const destDir = files
            .filter(file => file.name === destination)
            .pop()

          expect(destDir.type).to.equal(FILE_TYPES.directory)
        })
    })

    it('moves a file with array args', () => {
      const source = `source-file-${Math.random()}.txt`
      const destination = `destination-file-${Math.random()}.txt`

      return ipfs.files.write(`/${source}`, Buffer.from('Hello world'), {
        create: true
      })
        .then(() => ipfs.files.mv([`/${source}`, `/${destination}`]))
        .then(() => ipfs.files.ls(`/`))
        .then(files => {
          const sourceFile = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceFile).to.not.exist()

          const destFile = files
            .filter(file => file.name === destination)
            .pop()

          expect(destFile.type).to.equal(FILE_TYPES.file)
        })
    })

    it('moves a directory with array args', () => {
      const source = `source-dir-${Math.random()}`
      const destination = `destination-dir-${Math.random()}`

      return ipfs.files.mkdir(`/${source}`)
        .then(() => ipfs.files.mv([`/${source}`, `/${destination}`]))
        .then(() => ipfs.files.ls(`/`, {
          long: true
        }))
        .then(files => {
          const sourceDir = files
            .filter(file => file.name === source)
            .pop()

          expect(sourceDir).to.not.exist()

          const destDir = files
            .filter(file => file.name === destination)
            .pop()

          expect(destDir.type).to.equal(FILE_TYPES.directory)
        })
    })
  })

  describe('.read', function () {
    it('reads a file', () => {
      const fileName = `single-file-${Math.random()}.txt`
      const content = Buffer.from('Hello world')

      return ipfs.files.write(`/${fileName}`, content, {
        create: true
      })
        .then(() => ipfs.files.read(`/${fileName}`))
        .then(buffer => {
          expect(buffer).to.deep.equal(content)
        })
    })
  })

  describe('.rm', function () {
    it('removes a file', () => {
      const fileName = `single-file-${Math.random()}.txt`

      return ipfs.files.write(`/${fileName}`, Buffer.from('Hello world'), {
        create: true
      })
        .then(() => ipfs.files.rm(`/${fileName}`))
        .then(() => ipfs.files.ls(`/`))
        .then(files => {
          const file = files
            .filter(file => file.name === fileName)
            .pop()

          expect(file).to.not.exist()
        })
    })

    it('removes a directory', () => {
      const dirName = `dir-${Math.random()}`
      const fileName = `file-in-dir-${Math.random()}.txt`

      return ipfs.files.write(`/${dirName}/${fileName}`, Buffer.from('Hello world'), {
        create: true,
        parents: true
      })
        .then(() => ipfs.files.rm(`/${dirName}`, {
          recursive: true
        }))
        .then(() => ipfs.files.ls(`/`))
        .then(files => {
          const dir = files
            .filter(file => file.name === dirName)
            .pop()

          expect(dir).to.not.exist()
        })
    })
  })

  describe('.stat', function () {
    it('stats a file', () => {
      const fileName = `single-file-${Math.random()}.txt`

      return ipfs.files.write(`/${fileName}`, Buffer.from('Hello world'), {
        create: true
      })
        .then(() => ipfs.files.stat(`/${fileName}`))
        .then(stats => {
          expect(stats).to.deep.equal({
            blocks: 1,
            cumulativeSize: 69,
            hash: 'Qmetpc7cZmN25Wcc6R27cGCAvCDqCS5GjHG4v7xABEfpmJ',
            local: undefined,
            size: 11,
            sizeLocal: undefined,
            type: 'file',
            withLocality: false
          })
        })
    })

    it('stats a directory', () => {
      const dirName = `dir-${Math.random()}`

      return ipfs.files.mkdir(`/${dirName}`)
        .then(() => ipfs.files.stat(`/${dirName}`))
        .then(stats => {
          expect(stats).to.deep.equal({
            blocks: 0,
            cumulativeSize: 4,
            hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
            local: undefined,
            size: 0,
            sizeLocal: undefined,
            type: 'directory',
            withLocality: false
          })
        })
    })
  })
})
