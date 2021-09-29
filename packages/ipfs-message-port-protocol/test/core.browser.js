
/* eslint-env mocha */

import {
  encodeCallback,
  decodeCallback,
  encodeIterable,
  decodeIterable
} from '../src/core.js'
import { ipc } from './util.js'
import { expect } from 'aegir/utils/chai.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

describe('core', function () {
  this.timeout(10 * 1000)
  const move = ipc()

  describe('remote callback', () => {
    it('remote callback copies arguments', async () => {
      let deliver = null
      const callback = progress => {
        deliver(progress)
      }
      const receive = () =>
        new Promise(resolve => {
          deliver = resolve
        })

      const transfer = new Set()
      const remote = decodeCallback(
        await move(encodeCallback(callback, transfer), transfer)
      )

      remote([54])
      expect(await receive()).to.be.equal(54)

      remote([{ hello: 'world' }])

      expect(await receive()).to.be.deep.equal({ hello: 'world' })
    })

    it('remote callback transfers buffers', async () => {
      let deliver = null
      const callback = progress => {
        deliver(progress)
      }
      const receive = () =>
        new Promise(resolve => {
          deliver = resolve
        })

      const transfer = new Set()
      const remote = decodeCallback(
        await move(encodeCallback(callback, transfer), transfer)
      )

      remote([{ hello: uint8ArrayFromString('world') }])
      expect(await receive()).to.be.deep.equal({ hello: uint8ArrayFromString('world') })

      const world = uint8ArrayFromString('world')
      remote([{ hello: world }], [world.buffer])

      expect(await receive()).to.be.deep.equal({ hello: uint8ArrayFromString('world') })
      expect(world.buffer).property('byteLength', 0, 'buffer was cleared')
    })
  })

  describe('remote async iterable', () => {
    it('remote iterable copies yielded data', async () => {
      const iterate = async function * () {
        yield 1
        await null
        yield { hello: uint8ArrayFromString('world') }
        yield { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] }
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [
        1,
        { hello: uint8ArrayFromString('world') },
        { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] }
      ]

      for await (const item of remote) {
        expect(item).to.be.deep.equal(incoming.shift())
      }

      expect(incoming).to.have.property('length', 0, 'all items were received')
    })

    it('break in consumer loop propagates to producer loop', async () => {
      const outgoing = [
        1,
        { hello: uint8ArrayFromString('world') },
        { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] },
        { bye: 'Goodbye' }
      ]

      const iterate = async function * () {
        await null
        while (true) {
          yield outgoing.shift()
        }
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [
        1,
        { hello: uint8ArrayFromString('world') },
        { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] }
      ]

      for await (const item of remote) {
        expect(item).to.be.deep.equal(incoming.shift())
        if (incoming.length === 0) {
          break
        }
      }

      expect(incoming).to.have.property('length', 0, 'all items were received')
      expect(outgoing).to.have.property('length', 1, 'one item remained')
    })

    it('execption in producer propagate to consumer', async () => {
      const iterate = async function * () {
        await null
        yield 1
        yield 2
        throw Error('Producer Boom!')
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [1, 2]

      const consume = async () => {
        for await (const item of remote) {
          expect(item).to.be.deep.equal(incoming.shift())
        }
      }

      const result = await consume().catch(error => error)

      expect(result).to.an.instanceOf(Error)
      expect(result).to.have.property('message', 'Producer Boom!')
      expect(incoming).to.have.property('length', 0, 'all items were recieved')
    })

    it('execption in consumer propagate to producer', async () => {
      const outgoing = [1, 2, 3]

      const iterate = async function * () {
        await null
        while (true) {
          yield outgoing.shift()
        }
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [1, 2]

      const consume = async () => {
        for await (const item of remote) {
          expect(item).to.be.deep.equal(incoming.shift())
          if (incoming.length === 0) {
            throw new Error('Consumer Boom!')
          }
        }
      }

      const result = await consume().catch(error => error)

      expect(result).to.an.instanceOf(Error)
      expect(result).to.have.property('message', 'Consumer Boom!')

      expect(outgoing).to.be.deep.equal([3], 'Producer loop was broken')
    })

    it('iterable transfers yield data', async () => {
      const hi = uint8ArrayFromString('hello world')
      const body = uint8ArrayFromString('how are you')
      const bye = uint8ArrayFromString('Bye')
      const outgoing = [hi, body, bye]
      const iterate = async function * () {
        await null
        yield * outgoing
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              transfer.add(data.buffer)
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [
        uint8ArrayFromString('hello world'),
        uint8ArrayFromString('how are you'),
        uint8ArrayFromString('Bye')
      ]

      for await (const data of remote) {
        expect(data).to.be.deep.equal(incoming.shift())
      }

      expect(outgoing).property('length', 3)
      expect(hi).property('byteLength', 0)
      expect(body).property('byteLength', 0)
      expect(bye).property('byteLength', 0)
    })
  })

  describe('remote sync iterable', () => {
    it('remote iterable copies yielded data', async () => {
      const iterate = function * () {
        yield 1
        yield { hello: uint8ArrayFromString('world') }
        yield { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] }
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [
        1,
        { hello: uint8ArrayFromString('world') },
        { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] }
      ]

      for await (const item of remote) {
        expect(item).to.be.deep.equal(incoming.shift())
      }

      expect(incoming).to.have.property('length', 0, 'all items were received')
    })

    it('break in consumer loop propagates to producer loop', async () => {
      const outgoing = [
        1,
        { hello: uint8ArrayFromString('world') },
        { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] },
        { bye: 'Goodbye' }
      ]

      const iterate = async function * () {
        await null
        while (true) {
          yield outgoing.shift()
        }
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [
        1,
        { hello: uint8ArrayFromString('world') },
        { items: [uint8ArrayFromString('bla'), uint8ArrayFromString('bla')] }
      ]

      for await (const item of remote) {
        expect(item).to.be.deep.equal(incoming.shift())
        if (incoming.length === 0) {
          break
        }
      }

      expect(incoming).to.have.property('length', 0, 'all items were received')
      expect(outgoing).to.have.property('length', 1, 'one item remained')
    })

    it('execption in producer propagate to consumer', async () => {
      const iterate = function * () {
        yield 1
        yield 2
        throw Error('Producer Boom!')
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [1, 2]

      const consume = async () => {
        for await (const item of remote) {
          expect(item).to.be.deep.equal(incoming.shift())
        }
      }

      const result = await consume().catch(error => error)

      expect(result).to.an.instanceOf(Error)
      expect(result).to.have.property('message', 'Producer Boom!')
      expect(incoming).to.have.property('length', 0, 'all items were recieved')
    })

    it('execption in consumer propagate to producer', async () => {
      const outgoing = [1, 2, 3]

      const iterate = function * () {
        while (true) {
          yield outgoing.shift()
        }
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [1, 2]

      const consume = async () => {
        for await (const item of remote) {
          expect(item).to.be.deep.equal(incoming.shift())
          if (incoming.length === 0) {
            throw new Error('Consumer Boom!')
          }
        }
      }

      const result = await consume().catch(error => error)

      expect(result).to.an.instanceOf(Error)
      expect(result).to.have.property('message', 'Consumer Boom!')

      expect(outgoing).to.be.deep.equal([3], 'Producer loop was broken')
    })

    it('iterable transfers yield data', async () => {
      const hi = uint8ArrayFromString('hello world')
      const body = uint8ArrayFromString('how are you')
      const bye = uint8ArrayFromString('Bye')
      const outgoing = [hi, body, bye]
      const iterate = function * () {
        yield * outgoing
      }

      const transfer = new Set()

      const remote = decodeIterable(
        await move(
          encodeIterable(
            iterate(),
            (data, transfer) => {
              transfer.add(data.buffer)
              return data
            },
            transfer
          ),
          transfer
        ),
        a => a
      )

      const incoming = [
        uint8ArrayFromString('hello world'),
        uint8ArrayFromString('how are you'),
        uint8ArrayFromString('Bye')
      ]

      for await (const data of remote) {
        expect(data).to.be.deep.equal(incoming.shift())
      }

      expect(outgoing).property('length', 3)
      expect(hi).property('byteLength', 0)
      expect(body).property('byteLength', 0)
      expect(bye).property('byteLength', 0)
    })
  })
})
