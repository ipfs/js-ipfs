/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')
const CID = require('cids')

const defaultOptions = {
  recursive: false,
  timeout: undefined
}

describe('ls', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      ls: sinon.stub()
    }

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', defaultOptions).returns([{
      mode: 0o755,
      mtime: null,
      cid: new CID('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'blocks',
      depth: 0
    }, {
      mode: 0o644,
      mtime: null,
      cid: new CID('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'config',
      size: 3928,
      depth: 0
    }])

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', {
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      mode: 0o755,
      mtime: null,
      cid: new CID('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'blocks',
      depth: 0
    }, {
      mode: 0o644,
      mtime: null,
      cid: new CID('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'config',
      size: 3928,
      depth: 0
    }])

    ipfs.ls.withArgs('/ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', defaultOptions).returns([{
      mode: 0o755,
      mtime: null,
      cid: new CID('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'blocks',
      depth: 0
    }, {
      mode: 0o644,
      mtime: null,
      cid: new CID('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'config',
      size: 3928,
      depth: 0
    }])

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/blocks', defaultOptions).returns([{
      mode: 0o644,
      mtime: null,
      cid: new CID('QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD'),
      type: 'file',
      name: 'CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data',
      size: 10849,
      depth: 0
    }, {
      mode: 0o644,
      mtime: null,
      cid: new CID('QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx'),
      type: 'file',
      name: 'CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data',
      size: 10807,
      depth: 0
    }])

    ipfs.ls.withArgs('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', {
      ...defaultOptions,
      recursive: true
    }).returns([{
      mode: 0o755,
      mtime: null,
      cid: new CID('QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT'),
      type: 'dir',
      name: 'blocks',
      depth: 0
    }, {
      mode: 0o644,
      mtime: null,
      cid: new CID('QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD'),
      type: 'file',
      name: 'CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data',
      size: 10849,
      depth: 1
    }, {
      mode: 0o644,
      mtime: null,
      cid: new CID('QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx'),
      type: 'file',
      name: 'CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data',
      size: 10807,
      depth: 1
    }, {
      mode: 0o644,
      mtime: null,
      cid: new CID('QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN'),
      type: 'file',
      name: 'config',
      size: 3928,
      depth: 0
    }])
  })

  it('prints added files', async () => {
    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('prints added files with /ipfs/ prefix', async () => {
    const out = await cli('ls /ipfs/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('supports a trailing slash', async () => {
    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('supports multiple trailing slashes', async () => {
    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z///', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('supports multiple intermediate slashes', async () => {
    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z///blocks', { ipfs })
    expect(out).to.eql(
      '-rw-r--r-- - QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD 10849 CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data\n' +
      '-rw-r--r-- - QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx 10807 CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data\n'
    )
  })

  it('adds a header, -v', async () => {
    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z -v', { ipfs })
    expect(out).to.eql(
      'Mode       Mtime Hash                                           Size Name\n' +
      'drwxr-xr-x -     QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT -    blocks/\n' +
      '-rw-r--r-- -     QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })

  it('recursively follows folders, -r', async () => {
    const out = await cli('ls -r Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD 10849 CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data\n' +
      '-rw-r--r-- - QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx 10807 CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928  config\n'
    )
  })

  it('should ls and print CIDs encoded in specified base', async () => {
    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z --cid-base=base64', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - mAXASILidvV1YroHLqBvmuXko1Ly1UVenZV1K+MvhsjXhdvZQ - blocks/\n' +
      '-rw-r--r-- - mAXASIBT4ZYkQw0IApLoNHBxSjpezyayKZHJyxmFKpt0I3sK5 3928 config\n'
    )
  })

  it('prints added files with a timeout', async () => {
    const out = await cli('ls Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z --timeout=1s', { ipfs })
    expect(out).to.eql(
      'drwxr-xr-x - QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT - blocks/\n' +
      '-rw-r--r-- - QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN 3928 config\n'
    )
  })
})
