/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoPath = require('./index').repoPath
const fs = require('fs')
const path = require('path')
const describeOnlineAndOffline = require('../utils/on-and-off')
const ipfs = require('../utils/ipfs-exec')(repoPath)

describe('files', () => {
  describeOnlineAndOffline(repoPath, () => {
    it('cat', () => {
      return ipfs('files cat QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o').then((out) => {
        expect(out).to.be.eql('hello world')
      })
    })

    it('cat alias', () => {
      return ipfs('cat QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o').then((out) => {
        expect(out).to.be.eql('hello world')
      })
    })

    it('get', () => {
      return ipfs('files get QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o').then((out) => {
        expect(out).to.be.eql(
          'Saving file(s) to QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
        )

        const file = path.join(process.cwd(), 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
        expect(
          fs.readFileSync(file).toString()
        ).to.be.eql(
          'hello world\n'
        )

        fs.unlinkSync(file)
      })
    })

    it('get alias', () => {
      return ipfs('get QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o').then((out) => {
        expect(out).to.be.eql(
          'Saving file(s) to QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
        )

        const file = path.join(process.cwd(), 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
        expect(
          fs.readFileSync(file).toString()
        ).to.be.eql(
          'hello world\n'
        )

        fs.unlinkSync(file)
      })
    })

    it('add', () => {
      return ipfs('files add src/init-files/init-docs/readme').then((out) => {
        expect(out).to.be.eql(
          'added QmWttNAA5JNh8CPLHucifgpqJqe82kmKG4hiw2uq7iuLXB readme'
        )
      })
    })

    it('add alias', () => {
      return ipfs('add src/init-files/init-docs/readme').then((out) => {
        expect(out).to.be.eql(
          'added QmWttNAA5JNh8CPLHucifgpqJqe82kmKG4hiw2uq7iuLXB readme'
        )
      })
    })

    it('add recursively', () => {
      return ipfs('files add -r src/init-files/init-docs').then((out) => {
        expect(out).to.be.eql([
          'added QmaGE6DRwomWZxau96Hx6cdjYYYfVsp89o8gHaQbHiWWuc init-docs/tour/0.0-intro',
          'added QmWDvFCCGNeLAz2ASvhYvjwY1fqv1kgZYu3PoyPvNBUggF init-docs/tour',
          'added QmNtK7DiXysCe5RvAe4VqxrbphHMVAzrSFsKHGUrJQvVvZ init-docs/security-notes',
          'added QmWttNAA5JNh8CPLHucifgpqJqe82kmKG4hiw2uq7iuLXB init-docs/readme',
          'added QmfQ6dVwcmNcXscwHSdHAn5Rhz9THHxc8r1EAH1W4QqyX9 init-docs/quick-start',
          'added QmU1sw7VjE4dqESBHcowgPd2W4e7Pf4KvXptaDCZCCBYZs init-docs/help',
          'added QmfSgwmt9u6L6vgio3DY8ZgeJjeSKEJTuysi3vkRyS9gTY init-docs/docs/index',
          'added QmXPKvjP6hbd9zwHthuVqiqXoLCdQkaqi6svb8Fd7G7QsE init-docs/docs',
          'added QmNifNEbdZzs1D8XSBaNVNnVNhwzjDm6tSR72km9HF5Jti init-docs/contact',
          'added QmUKsDvy7spk3UwF3fkxfm6fqw9zb6nrEkiVypd6Es3M6b init-docs/about',
          'added QmZ6Pwevfnbx6L15wX2ftHGTi7Ed2Jnh6H4GyHbwLsUK6o init-docs'
        ].join('\n'))
      })
    })
  })
})
