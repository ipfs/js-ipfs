/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'

const commandCount = 117

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
