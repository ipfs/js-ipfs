const ipfsExec = require('./test/utils/ipfs-exec')
const os = require('os')
const hat = require('hat')
const assert = require('assert')
const async = require('async')

const hashesToTest = [
  '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',
  '/ipfs/QmU5nYL33N8pEQar5eK3iokC7UXv8qmPHNouujkNg6oo3E',
  '/ipfs/QmcrKLfNt3nbMAKYnnfpK1nFxsrB37SgmX7jtF3DrktHVE',
  '/ipfs/Qmd5c3kh7dKWxa13baMEiC8BfDDhq3CGz4aikwy8En5Zwp',
  '/ipfs/QmetbtMzLqDSAYH49a73eDMPD8Ac5zu1carwyzBxm3G8Jh',
  '/ipfs/QmagtXa25TMZsLM93Rccv7rkfc41DxrdF8QKQGCAruVhtG',
  '/ipfs/QmPHumMSAEKjpF4f25SZo7SHgB55oQnFy9P5TdQ98tuTCd',
  '/ipfs/QmURRhBX6yHQKh5MscXSyYrpxcg6LG52SFz75r6ojQi8Sn',
  '/ipfs/QmYAhHzvXak7yY2TwNHLhVinketyjEcmGxKeSwsJNi9vj6',
  '/ipfs/QmTU2ooLL8MFTqozuW6SUP9xM8xyGrMCHAFBzRcu4ewKMS',
  '/ipfs/QmSJ2uXM1pPZs1xLPk5eyyLsSQyVG1LcuC7b46HE5zzh6E',
  '/ipfs/QmSXWfuKLyj9Ei2KwbU7LnuN6k4vqZFNW47gvWv4hraXGN',
  '/ipfs/Qma1HM3woYjYSn6v7HtiDnnahuHuaWsoJeHWbjjLSdRkiQ',
  '/ipfs/QmfYKSNdXa6AcmNVYF3xBxLhZqQXWBfiosx7NDhSdgnRyU',
  '/ipfs/QmczCoF7qmByBVX8CZ9Ann73WqggAgtcEk6yMbhy7eVcFE',
  '/ipfs/QmPPX4HTkh8ps3HRcp9qMBA2HHYTTraxvfij4JMiABGmoV',
  '/ipfs/QmQeJw7a6tWDek35PBs7qYVevEJ53k1zBDJAm24KeUXcMd',
  '/ipfs/QmbJeRVfstqRBLimDKJZRwTXjpPdMLqFvdea3j7nrbnFiD',
  '/ipfs/QmeTHybnMh6dLH2oeF4SuBiVHUedcTr2BWJf6EQc884vUC',
  '/ipfs/QmUd5Q4wUg7rgjPcj57tQiL4RmkTLeJmM19H2Wgb45yp36',
  '/ipfs/QmT7vdkmv41edFWQgdNBUJRspRi1LhdZ1smkrVwGwmvUVo',
  '/ipfs/QmX1EFDyAFHxsafdcFzUAAAd4QZGiv9mhYVAm1zPQ6Pm7G'
]

async function main () {
  const ipfs = ipfsExec(os.tmpdir() + '/ipfs-' + hat())
  await ipfs('init')
  console.log('Init done')
  await ipfs('daemon')
  console.log('Got daemon')

  const calls = hashesToTest.map((hash) => {
    return (cb) => {
      ipfs(`resolve ${hash}`).then((res) => {
        assert.equal(res.trim(), hash)
        console.log(`${hash} was correctly received`)
        cb(null, hash)
      }).catch((err) => {
        cb(err)
      })
    }
  })
  async.parallel(calls, async (err, res) => {
    console.log('now done')
    console.log(err, res)
    if (err) {
      console.log('ERROR ERROR ERROR')
    } else {
      console.log('everything looks fine')
    }
    await ipfs('shutdown')
  })
}

main()
