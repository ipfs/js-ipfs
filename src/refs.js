/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('./utils/mocha')
const loadFixture = require('aegir/fixtures')
const CID = require('cids')
const all = require('it-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.refs', function () {
    this.timeout(60 * 1000)

    let ipfs, pbRootCb, dagRootCid

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    before(async function () {
      const cid = await loadPbContent(ipfs, getMockObjects())
      pbRootCb = cid
    })

    before(async function () {
      const cid = await loadDagContent(ipfs, getMockObjects())
      dagRootCid = cid
    })

    after(() => common.clean())

    for (const [name, options] of Object.entries(getRefsTests())) {
      const { path, params, expected, expectError, expectTimeout } = options
      // eslint-disable-next-line no-loop-func
      it(name, async function () {
        this.timeout(20 * 1000)

        // Call out to IPFS
        const p = (path ? path(pbRootCb) : pbRootCb)

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

        // Check there was no error and the refs match what was expected
        expect(refs.map(r => r.ref)).to.eql(expected)
      })
    }

    it('should get refs with cbor links', async function () {
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
      params: { format: '<linkname>', recursive: true, unique: true },
      expected: [
        'animals',
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
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
      expectError: true
    },

    'should print nothing for non-existent hashes': {
      path: () => 'QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2',
      params: { timeout: 2000 },
      expectTimeout: true
    }
  }
}

function loadPbContent (ipfs, node) {
  const store = {
    putData: (data) => ipfs.object.put({ Data: data, Links: [] }),
    putLinks: (links) =>
      ipfs.object.put({
        Data: '',
        Links: links.map(({ name, cid }) => ({ Name: name, Hash: cid, Size: 8 }))
      })
  }
  return loadContent(ipfs, store, node)
}

function loadDagContent (ipfs, node) {
  const store = {
    putData: async (data) => {
      const res = await all(ipfs.add(data))
      return res[0].cid
    },
    putLinks: (links) => {
      const obj = {}
      for (const { name, cid } of links) {
        obj[name] = new CID(cid)
      }
      return ipfs.dag.put(obj)
    }
  }
  return loadContent(ipfs, store, node)
}

async function loadContent (ipfs, store, node) {
  if (Buffer.isBuffer(node)) {
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
}
