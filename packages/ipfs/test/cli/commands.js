/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')

const commandCount = 110

describe('commands', () => {
  it('list the commands', async () => {
    const out = await cli('commands')
    expect(out.split('\n')).to.have.length(commandCount)
  })

  it('requires a command', async () => {
    await expect(cli('')).to.eventually.be.rejectedWith(/Please specify a command/).and.have.property('code', 'ERR_YARGS')
  })

  it('requires a known command', async () => {
    await expect(cli('derp')).to.eventually.be.rejectedWith(/Unknown argument: derp/).and.have.property('code', 'ERR_YARGS')
  })
})
