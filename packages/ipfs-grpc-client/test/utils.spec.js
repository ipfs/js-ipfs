/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import all from 'it-all'
import sinon from 'sinon'
import { bidiToDuplex } from '../src/utils/bidi-to-duplex.js'
import { toHeaders } from '../src/utils/to-headers.js'

describe('utils', () => {
  describe('bidi-to-duplex', () => {
    it('should transform a bidirectional client into an async iterable', async () => {
      const service = 'service'
      const options = {
        metadata: {
          foo: 'bar'
        }
      }

      const client = {
        onMessage: sinon.stub(),
        onEnd: sinon.stub(),
        start: sinon.stub()
      }

      const grpc = {
        client: sinon.stub().withArgs(service, options).returns(client)
      }

      const {
        source
      } = bidiToDuplex(grpc, service, options)

      expect(client.start.calledWith(toHeaders(options.metadata))).to.be.true()

      client.onMessage.getCall(0).args[0]('hello')
      client.onMessage.getCall(0).args[0]('world')
      client.onEnd.getCall(0).args[0]()

      await expect(all(source)).to.eventually.deep.equal(['hello', 'world'])
    })

    it('should propagate client errors', async () => {
      const service = 'service'
      const options = {
        metadata: {
          foo: 'bar'
        }
      }

      const client = {
        onMessage: sinon.stub(),
        onEnd: sinon.stub(),
        start: sinon.stub()
      }

      const grpc = {
        client: sinon.stub().withArgs(service, options).returns(client)
      }

      const {
        source
      } = bidiToDuplex(grpc, service, options)

      expect(client.start.calledWith(toHeaders(options.metadata))).to.be.true()

      client.onEnd.getCall(0).args[0](1, 'Erp!', { get: () => [] })

      await expect(all(source)).to.eventually.be.rejectedWith(/Erp!/)
    })
  })

  describe('to-headers', () => {
    it('should rename property fields', () => {
      const input = {
        propSimple: 'foo'
      }

      const output = toHeaders(input)

      expect(output.propSimple).to.be.undefined()
      expect(output['prop-simple']).to.deep.equal(input.propSimple)
    })

    it('should remove function fields', () => {
      const input = {
        funcProp: () => {}
      }

      const output = toHeaders(input)

      expect(output.funcProp).to.be.undefined()
      expect(output.funcProp).to.be.undefined()
    })
  })
})
