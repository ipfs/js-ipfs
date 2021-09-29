
/* eslint-env mocha */

import { Server } from '../src/server.js'
import { IPFSService } from '../src/index.js'
import { expect } from 'aegir/utils/chai.js'

describe('dag', function () {
  this.timeout(10 * 1000)

  describe('Server', () => {
    it('IPFSService', () => {
      expect(IPFSService).to.be.a('function')
      const service = new IPFSService()
      expect(service).to.have.property('dag')
      expect(service)
        .to.have.nested.property('dag.put')
        .be.a('function')
      expect(service)
        .to.have.nested.property('dag.get')
        .be.a('function')
    })
    it('Server', () => {
      expect(Server).to.be.a('function')
      const service = new IPFSService()
      const server = new Server(service)

      expect(server)
        .to.have.property('connect')
        .be.a('function')

      expect(server)
        .to.have.property('disconnect')
        .be.a('function')

      expect(server)
        .to.have.property('execute')
        .to.be.a('function')
    })
  })
})
