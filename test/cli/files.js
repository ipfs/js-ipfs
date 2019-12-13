/* eslint-env mocha */
'use strict'

const fs = require('fs')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const path = require('path')
const compareDir = require('dir-compare').compareSync
const rimraf = require('rimraf').sync
const runOnAndOff = require('../utils/on-and-off')

describe('files', () => runOnAndOff((thing) => {
  let ipfs
  const readme = fs.readFileSync(path.join(process.cwd(), '/src/init-files/init-docs/readme'))
    .toString('utf-8')

  before(() => {
    ipfs = thing.ipfs
  })

  it('add with progress', async function () {
    this.timeout(30 * 1000)
    // TODO actually test something related to progress
    const out = await ipfs('add -p src/init-files/init-docs/readme')
    expect(out)
      .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
  })

  it('add multiple', async function () {
    this.timeout(30 * 1000)

    const out = await ipfs('add src/init-files/init-docs/readme test/fixtures/odd-name-[v0]/odd\\ name\\ [v1]/hello --wrap-with-directory')
    expect(out)
      .to.include('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
    expect(out)
      .to.include('added QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o hello\n')
  })

  it('add directory with odd name', async function () {
    this.timeout(30 * 1000)
    const expected = [
      'added QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o odd-name-[v0]/odd name [v1]/hello',
      'added QmYRMUVULBfj7WrdPESnwnyZmtayN6Sdrwh1nKcQ9QgQeZ odd-name-[v0]/odd name [v1]',
      'added QmXJGoo27bg7ExNAtr9vRcivxDwcfHtkxatGno9HrUdR16 odd-name-[v0]'
    ]

    const out = await ipfs('add -r test/fixtures/odd-name-[v0]')
    expect(out).to.eql(expected.join('\n') + '\n')
  })

  it('add from pipe', async () => {
    const proc = ipfs('add')
    proc.stdin.write(Buffer.from('hello\n'))
    proc.stdin.end()

    const out = await proc
    expect(out)
      .to.eql('added QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN\n')
  })

  it('add --quiet', async function () {
    this.timeout(30 * 1000)

    const out = await ipfs('add -q src/init-files/init-docs/readme')
    expect(out)
      .to.eql('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')
  })

  it('add --quieter', async function () {
    this.timeout(30 * 1000)

    const out = await ipfs('add -Q -w test/fixtures/test-data/hello')
    expect(out)
      .to.eql('QmYRMUVULBfj7WrdPESnwnyZmtayN6Sdrwh1nKcQ9QgQeZ\n')
  })

  it('add --silent', async function () {
    this.timeout(30 * 1000)

    const out = await ipfs('add --silent src/init-files/init-docs/readme')
    expect(out)
      .to.eql('')
  })

  it('should add and print CID encoded in specified base', async function () {
    this.timeout(30 * 1000)

    const out = await ipfs('add test/fixtures/test-data/hello --cid-base=base64')
    expect(out).to.eql('added mAXASIEbUSBS5xa8UHDqqt8BdxehE6tX5HxKFiwIeukV2i0wO hello\n')
  })

  it('cat', async function () {
    this.timeout(30 * 1000)

    const out = await ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    expect(out).to.eql(readme)
  })

  it('cat non-existent file', async () => {
    // TODO test a specific error
    const err = await ipfs.fail('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB/dummy')
    expect(err).to.exist()
  })

  it('get', async function () {
    this.timeout(20 * 1000)

    const out = await ipfs('get QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
    expect(out)
      .to.eql('Saving file(s) QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')

    const file = path.join(process.cwd(), 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

    expect(fs.readFileSync(file).toString()).to.eql(readme)

    rimraf(file)
  })

  // TODO depends on others fix!
  it.skip('get recursively', async function () {
    this.timeout(20 * 1000)

    const outDir = path.join(process.cwd(), 'QmTCaAvZ5dquoa2jrgTRa3gn9n4Ymrz8mEdePP8jiaTvf9')
    rimraf(outDir)

    const out = await ipfs('get QmTCaAvZ5dquoa2jrgTRa3gn9n4Ymrz8mEdePP8jiaTvf9')
    expect(out).to.eql(
      'Saving file(s) QmTCaAvZ5dquoa2jrgTRa3gn9n4Ymrz8mEdePP8jiaTvf9\n'
    )

    const expectedDir = path.join(process.cwd(), 'test', 'fixtures', 'test-data', 'recursive-get-dir')
    const compareResult = compareDir(outDir, expectedDir, {
      compareContent: true,
      compareSize: true
    })

    expect(compareResult.differences).to.equal(0)
    rimraf(outDir)
  })
}))
