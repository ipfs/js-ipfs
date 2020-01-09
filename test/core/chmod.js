/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const createMfs = require('../helpers/create-mfs')

describe('chmod', () => {
  let mfs

  before(async () => {
    mfs = await createMfs()
  })

  async function testChmod (initialMode, modification, expectedFinalMode) {
    const path = `/foo-${Date.now()}`

    await mfs.write(path, Buffer.from('Hello world'), {
      create: true,
      mtime: new Date(),
      mode: initialMode
    })
    await mfs.chmod(path, modification, {
      flush: true
    })

    const updatedMode = (await mfs.stat(path)).mode
    expect(updatedMode).to.equal(parseInt(expectedFinalMode, 8))
  }

  it('should update the mode for a file', async () => {
    const path = `/foo-${Date.now()}`

    await mfs.write(path, Buffer.from('Hello world'), {
      create: true,
      mtime: new Date()
    })
    const originalMode = (await mfs.stat(path)).mode
    await mfs.chmod(path, '0777', {
      flush: true
    })

    const updatedMode = (await mfs.stat(path)).mode
    expect(updatedMode).to.not.equal(originalMode)
    expect(updatedMode).to.equal(parseInt('0777', 8))
  })

  it('should update the mode for a directory', async () => {
    const path = `/foo-${Date.now()}`

    await mfs.mkdir(path)
    const originalMode = (await mfs.stat(path)).mode
    await mfs.chmod(path, '0777', {
      flush: true
    })

    const updatedMode = (await mfs.stat(path)).mode
    expect(updatedMode).to.not.equal(originalMode)
    expect(updatedMode).to.equal(parseInt('0777', 8))
  })

  it('should update the mode for a hamt-sharded-directory', async () => {
    const path = `/foo-${Date.now()}`

    await mfs.mkdir(path)
    await mfs.write(`${path}/foo.txt`, Buffer.from('Hello world'), {
      create: true,
      shardSplitThreshold: 0
    })
    const originalMode = (await mfs.stat(path)).mode
    await mfs.chmod(path, '0777', {
      flush: true
    })

    const updatedMode = (await mfs.stat(path)).mode
    expect(updatedMode).to.not.equal(originalMode)
    expect(updatedMode).to.equal(parseInt('0777', 8))
  })

  it('should update modes with basic symbolic notation that adds bits', async () => {
    await testChmod('0000', '+x', '0111')
    await testChmod('0000', '+w', '0222')
    await testChmod('0000', '+r', '0444')
    await testChmod('0000', 'u+x', '0100')
    await testChmod('0000', 'u+w', '0200')
    await testChmod('0000', 'u+r', '0400')
    await testChmod('0000', 'g+x', '0010')
    await testChmod('0000', 'g+w', '0020')
    await testChmod('0000', 'g+r', '0040')
    await testChmod('0000', 'o+x', '0001')
    await testChmod('0000', 'o+w', '0002')
    await testChmod('0000', 'o+r', '0004')
    await testChmod('0000', 'ug+x', '0110')
    await testChmod('0000', 'ug+w', '0220')
    await testChmod('0000', 'ug+r', '0440')
    await testChmod('0000', 'ugo+x', '0111')
    await testChmod('0000', 'ugo+w', '0222')
    await testChmod('0000', 'ugo+r', '0444')
  })

  it('should update modes with basic symbolic notation that removes bits', async () => {
    await testChmod('0111', '-x', '0000')
    await testChmod('0222', '-w', '0000')
    await testChmod('0444', '-r', '0000')
    await testChmod('0100', 'u-x', '0000')
    await testChmod('0200', 'u-w', '0000')
    await testChmod('0400', 'u-r', '0000')
    await testChmod('0010', 'g-x', '0000')
    await testChmod('0020', 'g-w', '0000')
    await testChmod('0040', 'g-r', '0000')
    await testChmod('0001', 'o-x', '0000')
    await testChmod('0002', 'o-w', '0000')
    await testChmod('0004', 'o-r', '0000')
    await testChmod('0110', 'ug-x', '0000')
    await testChmod('0220', 'ug-w', '0000')
    await testChmod('0440', 'ug-r', '0000')
    await testChmod('0111', 'ugo-x', '0000')
    await testChmod('0222', 'ugo-w', '0000')
    await testChmod('0444', 'ugo-r', '0000')
  })

  it('should update modes with basic symbolic notation that overrides bits', async () => {
    await testChmod('0777', '=x', '0111')
    await testChmod('0777', '=w', '0222')
    await testChmod('0777', '=r', '0444')
    await testChmod('0777', 'u=x', '0177')
    await testChmod('0777', 'u=w', '0277')
    await testChmod('0777', 'u=r', '0477')
    await testChmod('0777', 'g=x', '0717')
    await testChmod('0777', 'g=w', '0727')
    await testChmod('0777', 'g=r', '0747')
    await testChmod('0777', 'o=x', '0771')
    await testChmod('0777', 'o=w', '0772')
    await testChmod('0777', 'o=r', '0774')
    await testChmod('0777', 'ug=x', '0117')
    await testChmod('0777', 'ug=w', '0227')
    await testChmod('0777', 'ug=r', '0447')
    await testChmod('0777', 'ugo=x', '0111')
    await testChmod('0777', 'ugo=w', '0222')
    await testChmod('0777', 'ugo=r', '0444')
  })

  it('should update modes with multiple symbolic notation', async () => {
    await testChmod('0000', 'g+x,u+w', '0210')
  })

  it('should update modes with special symbolic notation', async () => {
    await testChmod('0000', 'g+s', '2000')
    await testChmod('0000', 'u+s', '4000')
    await testChmod('0000', '+t', '1000')
    await testChmod('0000', '+s', '6000')
  })
})
