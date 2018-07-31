/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const bufferStream = require('pull-buffer-stream')
const {
  createMfs
} = require('./helpers')
const {
  FILE_SEPARATOR
} = require('../src/core/utils')

describe('rm', function () {
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

  it('refuses to remove files without arguments', () => {
    return mfs.rm()
      .then(() => {
        throw new Error('No error was thrown for missing paths')
      })
      .catch(error => {
        expect(error.message).to.contain('Please supply at least one path to remove')
      })
  })

  it('refuses to remove the root path', () => {
    return mfs.rm(FILE_SEPARATOR)
      .then(() => {
        throw new Error('No error was thrown for missing paths')
      })
      .catch(error => {
        expect(error.message).to.contain('Cannot delete root')
      })
  })

  it('refuses to remove a directory without the recursive flag', () => {
    const path = `/directory-${Math.random()}`

    return mfs.mkdir(path)
      .then(() => mfs.rm(path))
      .then(() => {
        throw new Error('No error was thrown for missing recursive flag')
      })
      .catch(error => {
        expect(error.message).to.contain(`${path} is a directory, use -r to remove directories`)
      })
  })

  it('removes a file', () => {
    const file = `/some-file-${Math.random()}.txt`

    return mfs.write(file, bufferStream(100), {
      create: true,
      parents: true
    })
      .then(() => mfs.rm(file, {
        recursive: true
      }))
      .then(() => mfs.stat(file))
      .then(() => {
        throw new Error('File was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${file} did not exist`)
      })
  })

  it('removes multiple files', () => {
    const file1 = `/some-file-${Math.random()}.txt`
    const file2 = `/some-file-${Math.random()}.txt`

    return mfs.write(file1, bufferStream(100), {
      create: true,
      parents: true
    })
      .then(() => mfs.write(file2, bufferStream(100), {
        create: true,
        parents: true
      }))
      .then(() => mfs.rm(file1, file2, {
        recursive: true
      }))
      .then(() => mfs.stat(file1))
      .then(() => {
        throw new Error('File #1 was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${file1} did not exist`)
      })
      .then(() => mfs.stat(file2))
      .then(() => {
        throw new Error('File #2 was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${file2} did not exist`)
      })
  })

  it('removes a directory', () => {
    const directory = `/directory-${Math.random()}`

    return mfs.mkdir(directory)
      .then(() => mfs.rm(directory, {
        recursive: true
      }))
      .then(() => mfs.stat(directory))
      .then(() => {
        throw new Error('Directory was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${directory} did not exist`)
      })
  })

  it('recursively removes a directory', () => {
    const directory = `/directory-${Math.random()}`
    const subdirectory = `/directory-${Math.random()}`
    const path = `${directory}${subdirectory}`

    return mfs.mkdir(path, {
      parents: true
    })
      .then(() => mfs.rm(directory, {
        recursive: true
      }))
      .then(() => mfs.ls(subdirectory))
      .then(() => {
        throw new Error('File was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${subdirectory} did not exist`)
      })
      .then(() => mfs.ls(directory))
      .then(() => {
        throw new Error('Directory was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${directory} did not exist`)
      })
  })

  it('recursively removes a directory with files in', () => {
    const directory = `directory-${Math.random()}`
    const file = `/${directory}/some-file-${Math.random()}.txt`

    return mfs.write(file, bufferStream(100), {
      create: true,
      parents: true
    })
      .then(() => mfs.rm(`/${directory}`, {
        recursive: true
      }))
      .then(() => mfs.stat(file))
      .then(() => {
        throw new Error('File was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`Path ${file} did not exist`)
      })
      .then(() => mfs.stat(`/${directory}`))
      .then(() => {
        throw new Error('Directory was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain(`${directory} did not exist`)
      })
  })
})
