/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from './utils/mocha.js'
import loadFixture from 'aegir/utils/fixtures.js'
import { CID } from 'multiformats/cid'
import all from 'it-all'
import drain from 'it-drain'
import testTimeout from './utils/test-timeout.js'
import * as dagPB from '@ipld/dag-pb'
import { UnixFS } from 'ipfs-unixfs'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testRefs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.refs', function () {
    this.timeout(60 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    /** @type {CID} */
    let pbRootCid
    /** @type {CID} */
    let dagRootCid

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    before(async function () {
      pbRootCid = await loadPbContent(ipfs, getMockObjects())
    })

    before(async function () {
      dagRootCid = await loadDagContent(ipfs, getMockObjects())
    })

    after(() => factory.clean())

    for (const [name, options] of Object.entries(getRefsTests())) {
      const { path, params, expected, expectError, expectTimeout } = options
      // eslint-disable-next-line no-loop-func
      it(name, async function () {
        // @ts-ignore this is mocha
        this.timeout(20 * 1000)

        // Call out to IPFS
        const p = (path ? path(pbRootCid) : pbRootCid)

        if (expectTimeout) {
          return expect(all(ipfs.refs(p, params))).to.eventually.be.rejected
            .and.be.an.instanceOf(Error)
            .and.to.have.property('name')
            .to.eql('TimeoutError')
        }

        if (expectError) {
          return expect(all(ipfs.refs(p, params))).to.be.eventually.rejected.and.be.an.instanceOf(Error)
        }

        const refs = await all(ipfs.refs(p, params))
        // Sort the refs not to lock-in the iteration order
        // Check there was no error and the refs match what was expected
        expect(refs.map(r => r.ref).sort()).to.eql(expected.sort())
      })
    }

    it('should respect timeout option when listing refs', () => {
      return testTimeout(() => drain(ipfs.refs('/ipfs/QmPDqvcuA4AkhBLBuh2y49yhUB98rCnxPxa3eVNC1kAbS1/foo/bar/baz.txt', {
        timeout: 1
      })))
    })

    it('should get refs with cbor links', async function () {
      // @ts-ignore this is mocha
      this.timeout(20 * 1000)

      // Call out to IPFS
      const refs = await all(ipfs.refs(`/ipfs/${dagRootCid}`, { recursive: true }))
      // Check the refs match what was expected
      expect(refs.map(r => r.ref).sort()).to.eql([
        'QmPDqvcuA4AkhBLBuh2y49yhUB98rCnxPxa3eVNC1kAbSC',
        'QmVwtsLUHurA6wUirPSdGeEW5tfBEqenXpeRaqr8XN7bNY',
        'QmXGL3ZdYV5rNLCfHe1QsFSQGekRFzgbBu1B3XGZ7DV9fd',
        'QmcSVZRN5E814KkPy4EHnftNAR7htbFvVhRKKqFs4FBwDG',
        'QmcSVZRN5E814KkPy4EHnftNAR7htbFvVhRKKqFs4FBwDG',
        'QmdBcHbK7uDQav8YrHsfKju3EKn48knxjd96KRMFs3gtS9',
        'QmeX96opBHZHLySMFoNiWS5msxjyX6rqtr3Rr1u7uxn7zJ',
        'Qmf8MwTnY7VdcnF8WcoJ3GB24NmNd1HsGzuEWCtUYDP38x',
        'bafyreiagelcmhfn33zuslkdo7fkes3dzcr2nju6meh75zm6vqklfqiojam',
        'bafyreic2f6adq5tqnbrvwiqc3jkz2cf4tz3cz2rp6plpij2qaoufgsxwmi',
        'bafyreidoqtyvflv5v4c3gd3izxvpq4flke55ayurbrnhsxh7z5wwjc6v6e',
        'bafyreifs2ub2lnq6n2quqbi3zb5homs5iqlmm77b3am252cqzxiu7phwpy'
      ])
    })
  })
}

function getMockObjects () {
  return {
    animals: {
      land: {
        'african.txt': loadFixture('test/fixtures/refs-test/animals/land/african.txt', 'interface-ipfs-core'),
        'americas.txt': loadFixture('test/fixtures/refs-test/animals/land/americas.txt', 'interface-ipfs-core'),
        'australian.txt': loadFixture('test/fixtures/refs-test/animals/land/australian.txt', 'interface-ipfs-core')
      },
      sea: {
        'atlantic.txt': loadFixture('test/fixtures/refs-test/animals/sea/atlantic.txt', 'interface-ipfs-core'),
        'indian.txt': loadFixture('test/fixtures/refs-test/animals/sea/indian.txt', 'interface-ipfs-core')
      }
    },
    fruits: {
      'tropical.txt': loadFixture('test/fixtures/refs-test/fruits/tropical.txt', 'interface-ipfs-core')
    },
    'atlantic-animals': loadFixture('test/fixtures/refs-test/atlantic-animals', 'interface-ipfs-core'),
    'mushroom.txt': loadFixture('test/fixtures/refs-test/mushroom.txt', 'interface-ipfs-core')
  }
}

/**
 * @returns {Record<string, { path?: (cid: CID) => string | string[], params: { edges?: boolean, format?: string, recursive?: boolean, unique?: boolean, maxDepth?: number, timeout?: number }, expected: string[], expectError?: boolean, expectTimeout?: boolean }>}
 */
function getRefsTests () {
  return {
    'should print added files': {
      params: {},
      expected: [
        'QmYEJ7qQNZUvBnv4SZ3rEbksagaan3sGvnUq948vSG8Z34',
        'QmUXzZKa3xhTauLektUiK4GiogHskuz1c57CnnoP4TgYJD',
        'QmYLvZrFn8KE2bcJ9UFhthScBVbbcXEgkJnnCBeKWYkpuQ',
        'QmRfqT4uTUgFXhWbfBZm6eZxi2FQ8pqYK5tcWRyTZ7RcgY'
      ]
    },

    'should print files in edges format': {
      params: { edges: true },
      expected: [
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmYEJ7qQNZUvBnv4SZ3rEbksagaan3sGvnUq948vSG8Z34',
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmUXzZKa3xhTauLektUiK4GiogHskuz1c57CnnoP4TgYJD',
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmYLvZrFn8KE2bcJ9UFhthScBVbbcXEgkJnnCBeKWYkpuQ',
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmRfqT4uTUgFXhWbfBZm6eZxi2FQ8pqYK5tcWRyTZ7RcgY'
      ]
    },

    'should print files in custom format': {
      params: { format: '<linkname>: <src> => <dst>' },
      expected: [
        'animals: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmYEJ7qQNZUvBnv4SZ3rEbksagaan3sGvnUq948vSG8Z34',
        'atlantic-animals: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmUXzZKa3xhTauLektUiK4GiogHskuz1c57CnnoP4TgYJD',
        'fruits: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmYLvZrFn8KE2bcJ9UFhthScBVbbcXEgkJnnCBeKWYkpuQ',
        'mushroom.txt: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmRfqT4uTUgFXhWbfBZm6eZxi2FQ8pqYK5tcWRyTZ7RcgY'
      ]
    },

    'should follow a path, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>' },
      expected: [
        'land',
        'sea'
      ]
    },

    'should follow a path, <hash>/<subdir>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals/land`,
      params: { format: '<linkname>' },
      expected: [
        'african.txt',
        'americas.txt',
        'australian.txt'
      ]
    },

    'should follow a path with recursion, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>', recursive: true },
      expected: [
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt'
      ]
    },

    'should recursively follows folders, -r': {
      params: { format: '<linkname>', recursive: true },
      expected: [
        'animals',
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt',
        'atlantic-animals',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
      ]
    },

    'should get refs with recursive and unique option': {
      params: { format: '<dst>', recursive: true, unique: true },
      expected: [
        'QmRfqT4uTUgFXhWbfBZm6eZxi2FQ8pqYK5tcWRyTZ7RcgY',
        'QmUXzZKa3xhTauLektUiK4GiogHskuz1c57CnnoP4TgYJD',
        'QmVX54jfjB8eRxLVxyQSod6b1FyDh7mR4mQie9j97i2Qk3',
        'QmWEuXAjUGyndgr4MKqMBgzMW36XgPgvitt2jsXgtuc7JE',
        'QmYEJ7qQNZUvBnv4SZ3rEbksagaan3sGvnUq948vSG8Z34',
        'QmYLvZrFn8KE2bcJ9UFhthScBVbbcXEgkJnnCBeKWYkpuQ',
        'Qma5z9bmwPcrWLJxX6Vj6BrcybaFg84c2riNbUKrSVf8h1',
        'QmbrFTo4s6H23W6wmoZKQC2vSogGeQ4dYiceSqJddzrKVa',
        'QmdHVR8M4zAdGctnTYq4fyPZjTwwzdcBpGWAfMAhAVfT9n',
        'Qmf6MrqT2oAve9diagLTMCYFPEcSx7fnUdW3xAjhXm32vo',
        'QmfP6D9bRV4FEYDL4EHZtZG58kDwDfnzmyjuyK5d1pvzbM'
      ]
    },

    'should get refs with max depth of 1': {
      params: { format: '<linkname>', recursive: true, maxDepth: 1 },
      expected: [
        'animals',
        'atlantic-animals',
        'fruits',
        'mushroom.txt'
      ]
    },

    'should get refs with max depth of 2': {
      params: { format: '<linkname>', recursive: true, maxDepth: 2 },
      expected: [
        'animals',
        'land',
        'sea',
        'atlantic-animals',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
      ]
    },

    'should get refs with max depth of 3': {
      params: { format: '<linkname>', recursive: true, maxDepth: 3 },
      expected: [
        'animals',
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt',
        'atlantic-animals',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
      ]
    },

    'should get refs with max depth of 0': {
      params: { recursive: true, maxDepth: 0 },
      expected: []
    },

    'should follow a path with max depth 1, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>', recursive: true, maxDepth: 1 },
      expected: [
        'land',
        'sea'
      ]
    },

    'should follow a path with max depth 2, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>', recursive: true, maxDepth: 2 },
      expected: [
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt'
      ]
    },

    'should print refs for multiple paths': {
      path: (cid) => [`/ipfs/${cid}/animals`, `/ipfs/${cid}/fruits`],
      params: { format: '<linkname>', recursive: true },
      expected: [
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt',
        'tropical.txt'
      ]
    },

    'should not be able to specify edges and format': {
      params: { format: '<linkname>', edges: true },
      expected: [],
      expectError: true
    },

    'should print nothing for non-existent hashes': {
      path: () => 'QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2',
      params: { timeout: 2000 },
      expected: ['']
    }
  }
}

/**
 * @typedef {object} Store
 * @property {(data: Uint8Array) => Promise<CID>} putData
 * @property {(links: { name: string, cid: string }[]) => Promise<CID>} putLinks
 */

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {any} node
 */
function loadPbContent (ipfs, node) {
  /**
   * @type {Store}
   */
  const store = {
    putData: (data) => {
      return ipfs.block.put(
        dagPB.encode({
          Data: data,
          Links: []
        })
      )
    },
    putLinks: (links) => {
      return ipfs.block.put(dagPB.encode({
        Links: links.map(({ name, cid }) => {
          return {
            Name: name,
            Tsize: 8,
            Hash: CID.parse(cid)
          }
        })
      }))
    }
  }
  return loadContent(ipfs, store, node)
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {any} node
 */
function loadDagContent (ipfs, node) {
  /**
   * @type {Store}
   */
  const store = {
    putData: (data) => {
      const inner = new UnixFS({ type: 'file', data: data })
      const serialized = dagPB.encode({
        Data: inner.marshal(),
        Links: []
      })
      return ipfs.block.put(serialized)
    },
    putLinks: (links) => {
      /** @type {Record<string, CID>} */
      const obj = {}
      for (const { name, cid } of links) {
        obj[name] = CID.parse(cid)
      }
      return ipfs.dag.put(obj)
    }
  }
  return loadContent(ipfs, store, node)
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {Store} store
 * @param {any} node
 * @returns {Promise<CID>}
 */
async function loadContent (ipfs, store, node) {
  if (node instanceof Uint8Array) {
    return store.putData(node)
  }

  if (typeof node === 'object') {
    const entries = Object.entries(node)
    const sorted = entries.sort((a, b) => {
      if (a[0] > b[0]) {
        return 1
      } else if (a[0] < b[0]) {
        return -1
      }
      return 0
    })

    const res = await all((async function * () {
      for (const [name, child] of sorted) {
        const cid = await loadContent(ipfs, store, child)
        yield { name, cid: cid && cid.toString() }
      }
    })())

    return store.putLinks(res)
  }

  throw new Error('Please pass either data or object')
}
