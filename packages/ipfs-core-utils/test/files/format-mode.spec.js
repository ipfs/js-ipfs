'use strict'

/* eslint-env mocha */

const { expect } = require('aegir/utils/chai')
const formatMode = require('../../src/files/format-mode')

describe('format-mode', function () {
  it('formats mode for directories', function () {
    expect(formatMode(parseInt('0777', 8), true)).to.equal('drwxrwxrwx')
  })

  it('formats mode for files', function () {
    expect(formatMode(parseInt('0777', 8), false)).to.equal('-rwxrwxrwx')
  })

  it('setgid, setuid and stick bit', function () {
    expect(formatMode(parseInt('1777', 8), false)).to.equal('-rwxrwxrwt')
    expect(formatMode(parseInt('2777', 8), false)).to.equal('-rwxrwsrwx')
    expect(formatMode(parseInt('4777', 8), false)).to.equal('-rwsrwxrwx')
    expect(formatMode(parseInt('5777', 8), false)).to.equal('-rwsrwxrwt')
    expect(formatMode(parseInt('6777', 8), false)).to.equal('-rwsrwsrwx')
    expect(formatMode(parseInt('7777', 8), false)).to.equal('-rwsrwsrwt')
  })

  it('formats user', function () {
    expect(formatMode(parseInt('0100', 8), false)).to.equal('---x------')
    expect(formatMode(parseInt('0200', 8), false)).to.equal('--w-------')
    expect(formatMode(parseInt('0300', 8), false)).to.equal('--wx------')
    expect(formatMode(parseInt('0400', 8), false)).to.equal('-r--------')
    expect(formatMode(parseInt('0500', 8), false)).to.equal('-r-x------')
    expect(formatMode(parseInt('0600', 8), false)).to.equal('-rw-------')
    expect(formatMode(parseInt('0700', 8), false)).to.equal('-rwx------')
  })

  it('formats group', function () {
    expect(formatMode(parseInt('0010', 8), false)).to.equal('------x---')
    expect(formatMode(parseInt('0020', 8), false)).to.equal('-----w----')
    expect(formatMode(parseInt('0030', 8), false)).to.equal('-----wx---')
    expect(formatMode(parseInt('0040', 8), false)).to.equal('----r-----')
    expect(formatMode(parseInt('0050', 8), false)).to.equal('----r-x---')
    expect(formatMode(parseInt('0060', 8), false)).to.equal('----rw----')
    expect(formatMode(parseInt('0070', 8), false)).to.equal('----rwx---')
  })

  it('formats other', function () {
    expect(formatMode(parseInt('0001', 8), false)).to.equal('---------x')
    expect(formatMode(parseInt('0002', 8), false)).to.equal('--------w-')
    expect(formatMode(parseInt('0003', 8), false)).to.equal('--------wx')
    expect(formatMode(parseInt('0004', 8), false)).to.equal('-------r--')
    expect(formatMode(parseInt('0005', 8), false)).to.equal('-------r-x')
    expect(formatMode(parseInt('0006', 8), false)).to.equal('-------rw-')
    expect(formatMode(parseInt('0007', 8), false)).to.equal('-------rwx')
  })
})
