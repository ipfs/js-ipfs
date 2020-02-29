/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')

const commandCount = 110

describe('commands', () => {
  it('list the commands', async () => {
    const out = await cli('commands')
    expect(out.split('\n')).to.have.length(commandCount)
  })
})
