const expect = require('chai').expect
const hat = require('hat')
const fs = require('fs')
const path = require('path')
const os = require('os')
// const utils = require('./src/cli/utils')
const ipfsExec = require('./test/utils/ipfs-exec')

const getThing = () => {
  const thing = {}
  const repoPath = os.tmpdir() + '/ipfs-' + hat()
  thing.ipfs = ipfsExec(repoPath)
  thing.ipfs.repoPath = repoPath
  return thing
}

(async () => {
  console.log('lol')
  const thing = getThing()
  await thing.ipfs('init')

  const filePath = path.join(os.tmpdir(), hat())
  const content = String(Math.random())
  fs.writeFileSync(filePath, content)
  let hash = ''

  thing.ipfs(`add -Q ${filePath}`)
    .then(out => {
      console.log('got output from add')
      hash = out.trim()
      return thing.ipfs(`pin ls ${hash}`)
    })
    .then(ls => {
      console.log('got output from ls')
      console.log(ls)
      expect(ls).to.include(hash)
    })
})()

// const tests = async () => {
//   let thing
//   // Just start/stop daemon bunch of times
//   thing = getThing()
//   await Promise.resolve().then(() => {
//     return thing.ipfs('init')
//   }).then(() => {
//     return thing.ipfs('daemon')
//   }).then(() => {
//     return thing.ipfs('shutdown')
//   }).then(() => {
//     return thing.ipfs('daemon')
//   }).then(() => {
//     return thing.ipfs('shutdown')
//   }).then(() => {
//     return thing.ipfs('daemon')
//   }).then(() => {
//     return thing.ipfs('shutdown')
//   }).catch((err) => {
//     console.error('sorry, hit a error')
//     console.error(err)
//     // process.exit(1)
//   })
//
//   // Make sure CLI can fail and goes into .catch
//   thing = getThing()
//   await thing.ipfs('init').then(() => {
//     return thing.ipfs('files add src/init-files/init-docs/readme --cid-version=1')
//   }).then((out) => {
//     console.error('Not supposed to be here')
//     // process.exit(1)
//   }).catch(() => {
//     console.log('Everything OK')
//   })
//
//   // Make sure CLI works when offline
//   thing = getThing()
//   await thing.ipfs('init').then(() => {
//     return thing.ipfs('files add src/init-files/init-docs/readme')
//   }).then((out) => {
//     return thing.ipfs('files add src/init-files/init-docs/readme')
//   }).then((out) => {
//     return thing.ipfs('files add src/init-files/init-docs/readme')
//   }).then((out) => {
//     console.log('Everything OK')
//   }).catch(() => {
//     console.error('Not supposed to be here')
//     // process.exit(1)
//   })
//
//   // Just start a daemon, put a block, get it then turn of daemon and repeat once again
//   thing = getThing()
//   await thing.ipfs('init').then(() => {
//     thing.ipfs('daemon').then(() => {
//       return thing.ipfs('block put test/fixtures/test-data/no-newline')
//     }).then((out) => {
//       expect(out).to.eql('QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL\n')
//       return thing.ipfs('block get QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL')
//     }).then((out) => {
//       expect(out).to.eql('there is no newline at end of this file')
//       return thing.ipfs('shutdown')
//     }).then(() => {
//       console.log('Now were donie, lets do it again')
//       return thing.ipfs('daemon')
//     }).then(() => {
//       return thing.ipfs('block put test/fixtures/test-data/no-newline')
//     }).then((out) => {
//       expect(out).to.eql('QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL\n')
//       return thing.ipfs('block get QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL')
//     }).then((out) => {
//       expect(out).to.eql('there is no newline at end of this file')
//       return thing.ipfs('shutdown')
//     }).then(() => {
//       console.log('Now were donie')
//     })
//   }).catch(() => {
//     console.error('Not supposed to be here')
//     // process.exit(1)
//   })
// }
//
// tests()
