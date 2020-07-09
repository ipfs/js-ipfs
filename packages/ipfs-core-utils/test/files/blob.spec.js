'use strict'

/* eslint-env mocha */
const { Blob, readBlob } = require('../../src/files/blob')
const { expect } = require('../utils/chai')
const all = require('it-all')
const TextDecoder = require('ipfs-utils/src/text-decoder')
const TextEncoder = require('ipfs-utils/src/text-encoder')

const assertBlob = async (blob, expected) => {
  expect(blob).to.be.an.instanceOf(Blob)
  expect(String(blob)).to.be.equal('[object Blob]')
  expect(blob.toString()).to.be.equal('[object Blob]')
  expect(blob.size).to.be.equal(expected.size)
  expect(blob.type).to.be.equal(expected.type || '')

  // If this is in browser there is no guarantee that `readBlob` will produce
  // same chunks so we test aggregate.
  const chunks = await all(readBlob(blob))
  if (typeof self === 'object' && self.Blob === Blob) {
    expect(concatUint8Array(chunks)).to.be.deep.equal(concatUint8Array(expected.content), 'readBlob produces same bytes')
  } else {
    expect(chunks).to.be.deep.equal(expected.content, 'readBlob produces same chunks')
  }

  // Not all browsers implement this
  if (blob.text) {
    let text = ''
    const encoder = new TextDecoder()
    for (const chunk of expected.content) {
      text += encoder.decode(chunk)
    }

    expect(await blob.text()).to.be.equal(text, 'blob.text() produces expected text')
  }

  // Not all browsers implement this
  if (blob.arrayBuffer) {
    const bytes = concatUint8Array(expected.content)
    const buffer = await blob.arrayBuffer()

    expect(buffer).to.be.an.instanceOf(ArrayBuffer)
    expect(buffer).to.be.deep.equal(bytes.buffer)
    expect(new Uint8Array(buffer)).to.be.deep.equal(bytes, 'blob.arrayBuffer() produces expected buffer')
  }
}

const concatUint8Array = (chunks) => {
  const bytes = []
  for (const chunk of chunks) {
    bytes.push(...chunk)
  }
  return new Uint8Array(bytes)
}

const toUint8Array = (input) => {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input)
  } else if (input instanceof ArrayBuffer) {
    return new Uint8Array(input)
  } else if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
  } else {
    throw new TypeError(`Invalid input ${input}`)
  }
}

describe('Blob', function () {
  it('new Blob()', async () => {
    const blob = new Blob()

    await assertBlob(blob, {
      type: '',
      size: 0,
      content: []
    })
  })

  it('new Blob("a=1")', async () => {
    const data = 'a=1'
    const blob = new Blob([data])

    await assertBlob(blob, {
      size: 3,
      type: '',
      content: [toUint8Array(data)]
    })
  })

  it('Blob with mixed parts', async () => {
    const parts = [
      'a',
      new Uint8Array([98]),
      new Uint16Array([25699]),
      new Uint8Array([101]).buffer,
      Buffer.from('f'),
      new Blob(['g'])
    ]

    await assertBlob(new Blob(parts), {
      size: 7,
      content: [...parts.slice(0, -1).map(toUint8Array), toUint8Array('g')]
    })
  })

  it('Blob silce', async () => {
    const parts = ['hello ', 'world']
    const blob = new Blob(parts)

    await assertBlob(blob, {
      size: 11,
      content: parts.map(toUint8Array)
    })

    await assertBlob(blob.slice(), {
      size: 11,
      content: parts.map(toUint8Array)
    })

    await assertBlob(blob.slice(2), {
      size: 9,
      content: [toUint8Array('llo '), toUint8Array('world')]
    })

    await assertBlob(blob.slice(5), {
      size: 6,
      content: [toUint8Array(' '), toUint8Array('world')]
    })

    await assertBlob(blob.slice(6), {
      size: 5,
      content: [toUint8Array('world')]
    })

    await assertBlob(blob.slice(5, 100), {
      size: 6,
      content: [toUint8Array(' '), toUint8Array('world')]
    })

    await assertBlob(blob.slice(-5), {
      size: 5,
      content: [toUint8Array('world')]
    })

    await assertBlob(blob.slice(-5, -10), {
      size: 0,
      content: []
    })

    await assertBlob(blob.slice(-5, -2), {
      size: 3,
      content: [toUint8Array('wor')]
    })

    await assertBlob(blob.slice(-5, 11), {
      size: 5,
      content: [toUint8Array('world')]
    })

    await assertBlob(blob.slice(-5, 12), {
      size: 5,
      content: [toUint8Array('world')]
    })

    await assertBlob(blob.slice(-5, 10), {
      size: 4,
      content: [toUint8Array('worl')]
    })
  })

  it('Blob type', async () => {
    const type = 'text/plain'
    const blob = new Blob([], { type })
    await assertBlob(blob, { size: 0, type, content: [] })
  })

  it('Blob slice type', async () => {
    const type = 'text/plain'
    const blob = new Blob().slice(0, 0, type)
    await assertBlob(blob, { size: 0, type, content: [] })
  })

  it('invalid Blob type', async () => {
    const blob = new Blob([], { type: '\u001Ftext/plain' })
    await assertBlob(blob, { size: 0, type: '', content: [] })
  })

  it('invalid Blob slice type', async () => {
    const blob = new Blob().slice(0, 0, '\u001Ftext/plain')
    await assertBlob(blob, { size: 0, type: '', content: [] })
  })

  it('normalized Blob type', async () => {
    const blob = new Blob().slice(0, 0, 'text/Plain')
    await assertBlob(blob, { size: 0, type: 'text/plain', content: [] })
  })

  it('Blob slice(0, 1)', async () => {
    const data = 'abcdefgh'
    const blob = new Blob([data]).slice(0, 1)
    await assertBlob(blob, {
      size: 1,
      content: [toUint8Array('a')]
    })
  })

  it('Blob slice(-1)', async () => {
    const data = 'abcdefgh'
    const blob = new Blob([data]).slice(-1)
    await assertBlob(blob, {
      size: 1,
      content: [toUint8Array('h')]
    })
  })

  it('Blob slice(0, -1)', async () => {
    const data = 'abcdefgh'
    const blob = new Blob([data]).slice(0, -1)
    await assertBlob(blob, {
      size: 7,
      content: [toUint8Array('abcdefg')]
    })
  })

  it('blob.slice(1, 2)', async () => {
    const blob = new Blob(['a', 'b', 'c']).slice(1, 2)
    await assertBlob(blob, {
      size: 1,
      content: [toUint8Array('b')]
    })
  })
})
