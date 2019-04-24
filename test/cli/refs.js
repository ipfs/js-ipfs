/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('refs', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
    return ipfs('add -r test/fixtures/test-data/refs')
  })

  it('prints added files', function () {
    this.timeout(20 * 1000)
    return ipfs('refs QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then((out) => {
        expect(out).to.eql(
          'QmdUmXjesQaPAk7NNw7epwcU1uytoJrH1qaaHHVAeZQvJJ\n' +
          'QmcSVZRN5E814KkPy4EHnftNAR7htbFvVhRKKqFs4FBwDG\n' +
          'QmXcybpFANuQw1VqvTAvB3gGNZp3fZtfzRfq7R7MNZvUBA\n' +
          'QmVwtsLUHurA6wUirPSdGeEW5tfBEqenXpeRaqr8XN7bNY\n'
        )
      })
  })

  it('prints files in edges format', function () {
    this.timeout(20 * 1000)
    return ipfs('refs -e QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then((out) => {
        expect(out).to.eql(
          'QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 -> QmdUmXjesQaPAk7NNw7epwcU1uytoJrH1qaaHHVAeZQvJJ\n' +
          'QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 -> QmcSVZRN5E814KkPy4EHnftNAR7htbFvVhRKKqFs4FBwDG\n' +
          'QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 -> QmXcybpFANuQw1VqvTAvB3gGNZp3fZtfzRfq7R7MNZvUBA\n' +
          'QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 -> QmVwtsLUHurA6wUirPSdGeEW5tfBEqenXpeRaqr8XN7bNY\n'
        )
      })
  })

  it('prints files in custom format', function () {
    this.timeout(20 * 1000)
    return ipfs('refs --format "<linkname>: <src> => <dst>" QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then((out) => {
        expect(out).to.eql(
          'animals: QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 => QmdUmXjesQaPAk7NNw7epwcU1uytoJrH1qaaHHVAeZQvJJ\n' +
          'atlantic-animals: QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 => QmcSVZRN5E814KkPy4EHnftNAR7htbFvVhRKKqFs4FBwDG\n' +
          'fruits: QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 => QmXcybpFANuQw1VqvTAvB3gGNZp3fZtfzRfq7R7MNZvUBA\n' +
          'mushroom.txt: QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4 => QmVwtsLUHurA6wUirPSdGeEW5tfBEqenXpeRaqr8XN7bNY\n'
        )
      })
  })

  it('follows a path, <hash>/<subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('refs --format="<linkname>" /ipfs/QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4/animals')
      .then((out) => {
        expect(out).to.eql(
          'land\n' +
          'sea\n'
        )
      })
  })

  it('follows a path, <hash>/<subdir>/<subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('refs --format="<linkname>" /ipfs/QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4/animals/land')
      .then((out) => {
        expect(out).to.eql(
          'african.txt\n' +
          'americas.txt\n' +
          'australian.txt\n'
        )
      })
  })

  it('follows a path with recursion, <hash>/<subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('refs -r --format="<linkname>" /ipfs/QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4/animals')
      .then((out) => {
        expect(out).to.eql(
          'land\n' +
          'african.txt\n' +
          'americas.txt\n' +
          'australian.txt\n' +
          'sea\n' +
          'atlantic.txt\n' +
          'indian.txt\n'
        )
      })
  })

  //
  // Directory structure:
  //
  // animals
  //   land
  //     african.txt
  //     americas.txt
  //     australian.txt
  //   sea
  //     atlantic.txt
  //     indian.txt
  // fruits
  //   tropical.txt
  // mushroom.txt
  //

  it('recursively follows folders, -r', function () {
    this.slow(2000)
    this.timeout(20 * 1000)

    return ipfs('refs -r --format="<linkname>" QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then(out => {
        expect(out).to.eql(
          'animals\n' +
          'land\n' +
          'african.txt\n' +
          'americas.txt\n' +
          'australian.txt\n' +
          'sea\n' +
          'atlantic.txt\n' +
          'indian.txt\n' +
          'atlantic-animals\n' +
          'fruits\n' +
          'tropical.txt\n' +
          'mushroom.txt\n'
        )
      })
  })

  it('recursive with unique option', function () {
    this.slow(2000)
    this.timeout(20 * 1000)

    return ipfs('refs -u -r --format="<linkname>" QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then(out => {
        expect(out).to.eql(
          'animals\n' +
          'land\n' +
          'african.txt\n' +
          'americas.txt\n' +
          'australian.txt\n' +
          'sea\n' +
          'atlantic.txt\n' +
          'indian.txt\n' +
          'fruits\n' +
          'tropical.txt\n' +
          'mushroom.txt\n'
        )
      })
  })

  it('max depth of 1', function () {
    this.timeout(20 * 1000)
    return ipfs('refs -r --max-depth=1 --format="<linkname>" QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then((out) => {
        expect(out).to.eql(
          'animals\n' +
          'atlantic-animals\n' +
          'fruits\n' +
          'mushroom.txt\n'
        )
      })
  })

  it('max depth of 2', function () {
    this.timeout(20 * 1000)
    return ipfs('refs -r --max-depth=2 --format="<linkname>" QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then((out) => {
        expect(out).to.eql(
          'animals\n' +
          'land\n' +
          'sea\n' +
          'atlantic-animals\n' +
          'fruits\n' +
          'tropical.txt\n' +
          'mushroom.txt\n'
        )
      })
  })

  it('max depth of 3', function () {
    this.timeout(20 * 1000)
    return ipfs('refs -r --max-depth=3 --format="<linkname>" QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then((out) => {
        expect(out).to.eql(
          'animals\n' +
          'land\n' +
          'african.txt\n' +
          'americas.txt\n' +
          'australian.txt\n' +
          'sea\n' +
          'atlantic.txt\n' +
          'indian.txt\n' +
          'atlantic-animals\n' +
          'fruits\n' +
          'tropical.txt\n' +
          'mushroom.txt\n'
        )
      })
  })

  it('max depth of 0', function () {
    this.timeout(20 * 1000)
    return ipfs('refs -r --max-depth=0 --format="<linkname>" QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4')
      .then((out) => expect(out).to.eql(''))
  })

  it('follows a path with max depth 1, <hash>/<subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('refs -r --max-depth=1 --format="<linkname>" /ipfs/QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4/animals')
      .then((out) => {
        expect(out).to.eql(
          'land\n' +
          'sea\n'
        )
      })
  })

  it('follows a path with max depth 2, <hash>/<subdir>', function () {
    this.timeout(20 * 1000)

    return ipfs('refs -r --max-depth=2 --format="<linkname>" /ipfs/QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4/animals')
      .then((out) => {
        expect(out).to.eql(
          'land\n' +
          'african.txt\n' +
          'americas.txt\n' +
          'australian.txt\n' +
          'sea\n' +
          'atlantic.txt\n' +
          'indian.txt\n'
        )
      })
  })

  it('cannot specify edges and format', function () {
    this.timeout(20 * 1000)
    // If the daemon is off, refs should fail
    // If the daemon is on, refs should search until it hits a timeout
    return Promise.race([
      ipfs.fail('refs --format="<linkname>" -e QmXW5PJso8qkBzavt7ZDXjmXAzJUwKi8d6AZxoSqG6rLJ4'),
      new Promise((resolve, reject) => setTimeout(resolve, 4000))
    ])
      .catch(() => expect.fail(0, 1, 'Should have thrown or timedout'))
  })

  it('prints nothing for non-existent hashes', function () {
    this.timeout(20 * 1000)
    // If the daemon is off, refs should fail
    // If the daemon is on, refs should search until it hits a timeout
    return Promise.race([
      ipfs.fail('refs QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2'),
      new Promise((resolve, reject) => setTimeout(resolve, 4000))
    ])
      .catch(() => expect.fail(0, 1, 'Should have thrown or timedout'))
  })
}))
