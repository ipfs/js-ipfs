/* eslint-env mocha */
'use strict'

const fs = require('fs')
const os = require('os')
const expect = require('chai').expect
const path = require('path')
const hat = require('hat')
const compareDir = require('dir-compare').compareSync
const rimraf = require('rimraf').sync
const CID = require('cids')
const mh = require('multihashes')
const runOnAndOff = require('../utils/on-and-off')
const clean = require('../utils/clean')

// TODO: Test against all algorithms Object.keys(mh.names)
// This subset is known to work with both go-ipfs and js-ipfs as of 2017-09-05
const HASH_ALGS = [
  'sha1',
  'sha2-256',
  'sha2-512',
  'keccak-224',
  'keccak-256',
  'keccak-384',
  'keccak-512'
]

describe('files', () => runOnAndOff((thing) => {
  let ipfs
  const readme = fs.readFileSync(path.join(process.cwd(), '/src/init-files/init-docs/readme'))
    .toString('utf-8')

  const recursiveGetDirResults = [
    'added QmR56UJmAaZLXLdTT1ALrE9vVqV8soUEekm9BMd4FnuYqV recursive-get-dir/version',
    'added QmYE7xo6NxbHEVEHej1yzxijYaNY51BaeKxjXxn6Ssa6Bs recursive-get-dir/init-docs/tour/0.0-intro',
    'added QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te recursive-get-dir/init-docs/tour',
    'added QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ recursive-get-dir/init-docs/security-notes',
    'added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB recursive-get-dir/init-docs/readme',
    'added QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha recursive-get-dir/init-docs/quick-start',
    'added QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 recursive-get-dir/init-docs/help',
    'added QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT recursive-get-dir/init-docs/docs/index',
    'added QmegvLXxpVKiZ4b57Xs1syfBVRd8CbucVHAp7KpLQdGieC recursive-get-dir/init-docs/docs',
    'added QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y recursive-get-dir/init-docs/contact',
    'added QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V recursive-get-dir/init-docs/about',
    'added QmUhUuiTKkkK8J6JZ9zmj8iNHPuNfGYcszgRumzhHBxEEU recursive-get-dir/init-docs',
    'added QmeiTxVN4xAjxUzHzBqCpK3GaT3GeiLQeJRpYDXDfLeEmR recursive-get-dir/datastore/MANIFEST-000014',
    'added QmQpc75sJGUv59dAwHF7vazBGV9o6C7z587Dp9nv7HYAps recursive-get-dir/datastore/LOG.old',
    'added QmbFNLNr9at9eK5LrNyUdyE5cdLb5yaT9DkjXw7BK68kcM recursive-get-dir/datastore/LOG',
    'added QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH recursive-get-dir/datastore/LOCK',
    'added QmVJi93Yj5RW3NuqqxonGz3jAXUYHrdQvWrURxg1TiLEuX recursive-get-dir/datastore/CURRENT',
    'added QmcJ6TXPMPm6puSC9vpxuG57PyfGpr8bvTgkKU9SHHU5Uo recursive-get-dir/datastore/000010.ldb',
    'added QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU recursive-get-dir/datastore/000005.ldb',
    'added QmfExFwdFKspsY2q5WnhQjd1QDKnjpTQ4UkiHqqQxV7h67 recursive-get-dir/datastore/000002.ldb',
    'added QmUqyZtPmsRy1U5Mo8kz2BAMmk1hfJ7yW1KAFTMB2odsFv recursive-get-dir/datastore',
    'added QmPkWYfSLCEBLZu7BZt4kigGDMe3cpogMbeVf97gN2xJDN recursive-get-dir/config',
    'added QmbJgQa4XNBFvGQcLbWBNtvWZetbCUKiyAQNfePoTzwf9L recursive-get-dir/blocks/CIQPD/CIQPDQJBGYDZNMOAGGYNRNMP2VDKWBWGAEDDEJDACM3SGG3VIANDDXI.data',
    'added QmSCUPYy4CfFt9nA61J9v2DMfJygQAJjaUcRmygDbVME2D recursive-get-dir/blocks/CIQPD',
    'added QmTU72W5EAnNUAtnVW1qoFzdDD8FyiBjpF5MUzjBAFnHS6 recursive-get-dir/blocks/CIQOY/CIQOYW2THIZBRGI7IN33ROGCKOFZLXJJ2MPKYZBTV4H3N7GYHXMAO6A.data',
    'added QmQ1mNtPTJ6JG3TNNq73m2orvsfKCKrqMKoXyXwRKWM1ma recursive-get-dir/blocks/CIQOY',
    'added QmaTXag3TaaG6hFUXGxybEuMUk7UHSutZobZgDtjr6aXjf recursive-get-dir/blocks/CIQON/CIQONICFQZH7QVU6IPSIM3AK7AD554D3BWZPAGEAQYQOWMFZQDUUAEI.data',
    'added QmNi9kKnfKJGuofhBRKMdKj5R6BQAYHWRtu3vXJHRy69TE recursive-get-dir/blocks/CIQON',
    'added QmTH5Jc2uhu5LqGEFAgrn2HwoDHLpvQd9b6fyoUGi6aeQu recursive-get-dir/blocks/CIQOM/CIQOMBKARLB7PAITVSNH7VEGIQJRPL6J7FT2XYVKAXT4MQPXXPUYUNY.data',
    'added Qmec4atiyfysPR8HU5gPfjKY1NpQDY2kmSeeadx8wLEBqY recursive-get-dir/blocks/CIQOM',
    'added QmeBypQ2yE4t4Loybhby15DjkeLDXJKCcgMfxTXeFnHa8F recursive-get-dir/blocks/CIQOL/CIQOLBQZSZAODJGGH6RYYVBUXHTS3SM5EORZDU63LYPEFUAFE4SBM4I.data',
    'added Qmd6s8LXAEjW7y9QbGSzeuewrRBYjJHmcazG3Hk7cJ74da recursive-get-dir/blocks/CIQOL',
    'added QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH recursive-get-dir/blocks/CIQOH/CIQOHMGEIKMPYHAUTL57JSEZN64SIJ5OIHSGJG4TJSSJLGI3PBJLQVI.data',
    'added QmTnaav9VTSVyLu8PvRzh4gJ8heF9rpdWzeDb7rMx5DkxV recursive-get-dir/blocks/CIQOH',
    'added Qmc1nasezDdPyZiXB5VB6Aygzswcr6QkauzzXMeUGouHTN recursive-get-dir/blocks/CIQMB/CIQMB7DLJFKD267QJ2B5FJNHZPTSVA7IB6OHXSQ2XSVEEKMKK6RT75I.data',
    'added QmeqJBkwmzsVR79HBKLW7AYhfAMxMaJs5dGHSgey5ezy7N recursive-get-dir/blocks/CIQMB',
    'added QmaSjzSSRanYzRGPXQY6m5SWfSkkfcnzNkurJEQc4chPJx recursive-get-dir/blocks/CIQLB/CIQLBS5HG4PRCRQ7O4EBXFD5QN6MTI5YBYMCVQJDXPKCOVR6RMLHZFQ.data',
    'added QmQ8ag7ysVyCMzJGFjxrUStwWtniQ69c7G9aezbmsKeNYD recursive-get-dir/blocks/CIQLB/CIQLBK52T5EHVHZY5URTG5JS3JCUJDQM2DRB5RVF33DCUUOFJNGVDUI.data',
    'added Qmbqod68qdYiEs7kkTGu7G59adekUbAFAAg7WEyM6iPP5z recursive-get-dir/blocks/CIQLB',
    'added Qmd4FKC6GcKnhJHnEJJwqg9A1eDd7JXKkG5v3iv9XSHtwq recursive-get-dir/blocks/CIQKK/CIQKKLBWAIBQZOIS5X7E32LQAL6236OUKZTMHPQSFIXPWXNZHQOV7JQ.data',
    'added QmUBsjP45UUHzKymAUqwEFJsuCvfC1AcaLvBgMsoGMipoG recursive-get-dir/blocks/CIQKK',
    'added QmWR1EuH5cui4EW5W16ADxzmYEFPjHDs1LcPe3uQL3CmiS recursive-get-dir/blocks/CIQJG/CIQJGO2B2N75IUEM372FSMG76VV256I4PXBULZZ5ASNLK4FL4EG7XOI.data',
    'added QmWrs7zVFkbpsTEbEpe3MyAB8ssUNp8jamE7i4PZ736zWy recursive-get-dir/blocks/CIQJG',
    'added QmWNXfkCTxSAuFBdNQ8gGmyxnZ28XrzRbjjmvCViLoNU5W recursive-get-dir/blocks/CIQJF/CIQJFGRQHQ45VCQLM7AJNF2GF5UHUAGGHC6LLAH6VYDEKLQMD4QLILY.data',
    'added QmWjsRHRK7ENAhMvgwfkze9bkySxjAsNMGXrMGMsFcrDWU recursive-get-dir/blocks/CIQJF',
    'added QmTt3mbtfVGEfqqjec9WZcWaC4SkesErDPAhhr8NRfsWFp recursive-get-dir/blocks/CIQJB/CIQJBQD2O6K4CGJVCCTJNUP57QHR4SKHZ74OIITBBGLOMCO3ZOLWLGA.data',
    'added QmQebEvyaFbez884asHoTrNsbck1JdMLcM8EhUFYCraGHZ recursive-get-dir/blocks/CIQJB',
    'added Qmb7AKKnZwLLFtseMZiHkq4fKNhP5rSggcvN2oGXUBZv8B recursive-get-dir/blocks/CIQJ2/CIQJ23BL4UHXA2KTI6NLTXZM4PW4VEFWQBJ4ACZQAS37BLGL4HUO5XY.data',
    'added QmT1zKYzUpt2kF8AEV2igH9hXwzGu4q8pc4uJ9BLWqjMhT recursive-get-dir/blocks/CIQJ2',
    'added QmazVLpyExfPkwASngrz3MDZD1pdaBUxj7VqAkjAFAWaa9 recursive-get-dir/blocks/CIQIX/CIQIXBZMUTXFC5QIGMLJNXLLHZOPGSL2PBC65D4UIVWM6TI5F5TAFNI.data',
    'added QmNM7hxdJfaApCJe1ubCrhAQSA6AWQXUvKZrHcf5RxsNvn recursive-get-dir/blocks/CIQIX',
    'added QmRfQcw4qrW91Vqj3evXiH11MuvRVJb7S7vKSgau7aBzRa recursive-get-dir/blocks/CIQHP/CIQHPUVCWD6JA6AFUVD6VA64TGWP67KYA3AIMBUMVWGZ5AQN2L2HSWQ.data',
    'added QmRsyLntZoGPWURqtemAmgRdtmuCjbbdZ5xzkCAEUhh4iU recursive-get-dir/blocks/CIQHP',
    'added QmU7mw6KaaAJA6tHi9FdiHu2HtA6rjb6e1aYuWscwTJ9yV recursive-get-dir/blocks/CIQHB/CIQHBGZNZRPWVEFNMTLP4OS5EAVHFMCX2HD7FZUC2B3WUU3D4LGKS5A.data',
    'added Qma1ytRhbzt3tGcJopMvd7g3ZE38mRKTTuJuRaHmguq8mN recursive-get-dir/blocks/CIQHB',
    'added QmVLdEzvgvM5k7NUWWSgURAZuJmiQBnbuZga3EpRip8xTu recursive-get-dir/blocks/CIQHA/CIQHAKDLTL5GMIFGN5YVY4BA22FPHUIODJEXS4LCTQDWA275XAJDAPI.data',
    'added QmddXWuKjfCbF6HXR9jStKDoLEAZ7xc8SZgDanQLMiGjpn recursive-get-dir/blocks/CIQHA',
    'added QmZe7irS2FotZtsUx9wpy5QPKJF6YEaAEZLHLUwQy6XgY8 recursive-get-dir/blocks/CIQH7/CIQH7OEYWXL34RWYL7VXLWEU4FWPVGT24VJT7DUZPTNLF25N25IGGQA.data',
    'added Qmb5NqTFar7MnxyRwwQtfb81nyS6g5NRG1bdo6AefmvhXU recursive-get-dir/blocks/CIQH7',
    'added QmWGima5TqLfUTzUsCF6h3oXGvwu3QQ1zjZYLDMaGeFRbB recursive-get-dir/blocks/CIQGP/CIQGPALRQ24P6NS4OWHTQ7R247ZI7KJWP3QWPQYS43LFULQC5ANLQFI.data',
    'added QmZMHzPS1qema8HvLk4jRuSLrUjRHZ8Siu6Wc4njAmx8MG recursive-get-dir/blocks/CIQGP',
    'added QmabxyrxY1uUzHcd7mTBCfibFwemGC89vuJFUw4UkebmSn recursive-get-dir/blocks/CIQGF/CIQGFTQ7FSI2COUXWWLOQ45VUM2GUZCGAXLWCTOKKPGTUWPXHBNIVOY.data',
    'added QmYLZ3uqYLkViS7Bh3vxcT5yrPscyWMV11iqFVJnqA7JVT recursive-get-dir/blocks/CIQGF',
    'added QmSMYdQtDTqykd7oLKZq3vJtS7KoWZwjL7GA9zj6UsCngE recursive-get-dir/blocks/CIQFT/CIQFTFEEHEDF6KLBT32BFAGLXEZL4UWFNWM4LFTLMXQBCERZ6CMLX3Y.data',
    'added QmWjMLA3ppmngQaHs8YEQ3Bru4tKoDeJh2cKv7U7dtLUuf recursive-get-dir/blocks/CIQFT',
    'added QmVdfEEiQmem5GanTjja7HKHNFpfa2LB8196fD9m9b656Q recursive-get-dir/blocks/CIQFF/CIQFFRR4O52TS2Z7QLDDTF32OIR4FWLKT5YLL7MLDVIT7DC3NHOK5VA.data',
    'added QmUcLzGWDuBPA6iVF65n676KiCbQNXV4owecfSR4QFVy3U recursive-get-dir/blocks/CIQFF',
    'added QmNtkNt8oZASY7AYVpswA3RQ43hASjP1NGj8GB1L6vgHUx recursive-get-dir/blocks/CIQFE/CIQFEAGMNNXXTYKYQSANT6IBNTFN7WR5RPD5F6GN6MBKUUO25DNOTWQ.data',
    'added QmXrrAYhbThjuHRPA23HujCLFbTrnwd3jmvNbZBAnKEddk recursive-get-dir/blocks/CIQFE',
    'added QmcozcFvmaTqVPaFXgZUHPsroSG8YP6tHEYyFaFhnonwSG recursive-get-dir/blocks/CIQEU/CIQEUWUVLBXVFYSYCHHSCRTXCYHGIOBXKWUMKFR3UPAFHQ5WK5362FQ.data',
    'added QmVU52FEpQQF3ViFGUKLhLeJaRKpCZfqN4AWLuzAXyrzyU recursive-get-dir/blocks/CIQEU',
    'added QmPiJAUg2J3dWWnQvtKXbkr8g1qCxX4RCPkU3wFmxd6x8H recursive-get-dir/blocks/CIQER/CIQERMRAAFXUAUOX3V2DCW7R77FRIVHQ3V5OIPPS3XQBX34KRPNOIRQ.data',
    'added QmboWqKvhjxdBw1AfxQ56sqhqrrtG7ibaGhHb19TPnjr69 recursive-get-dir/blocks/CIQER',
    'added QmPbgB6GzeUEnvXqQgYLTJnrdcm95kGRWH36euTr2eAB2w recursive-get-dir/blocks/CIQEN/CIQENVCICS44LLYUDQ5KVN6ALXC6QRHK2X4R6EUFRMBB5OSFO2FUYDQ.data',
    'added QmZCxJdNTR1MHRNGGWgZRZdW66FTpyTLdT8odbUz1CP7J9 recursive-get-dir/blocks/CIQEN',
    'added QmQCYnQWAHqSy1ts7VmHbp18BFEmbVvfX7FASVQF21uo5g recursive-get-dir/blocks/CIQDV/CIQDVKITASFS55MC2TXCX5XMZLMGTYVODWPEDIW7JYEG7YXBIA7IUWY.data',
    'added QmQaTiy1CufRfP3zTCW8fAtNWjvdeWuMkvTi4q6dykNDif recursive-get-dir/blocks/CIQDV',
    'added QmSynZ3cTjBzpMTSPCP5Q6RJSa9WEAA8p178cZRLnKdahz recursive-get-dir/blocks/CIQDM/CIQDMKFEUGKSLXMEXO774EZOYCYNHPRVFD53ZSAU7237F67XDSQGCYQ.data',
    'added QmNS3zMGDTPRTuR8nbPz4ddQpGN4gtuVyZ5G3mn3ajg4Rb recursive-get-dir/blocks/CIQDM',
    'added QmTpxXKswGwhTYLn1qL4EG9aLGFXS2LSnreceV2FJeArVh recursive-get-dir/blocks/CIQDD/CIQDDZ5EDQK5AP7LRTLZHQZUR2R3GECRFV3WPKNL7PL2SKFIL2LXC4Y.data',
    'added Qmbm7ToWsTta4Y1RipmRudCenKF7qAHRVTCtTPuoVqfY8H recursive-get-dir/blocks/CIQDD/CIQDDVW2EZIJF4NQH7WJNESD7XHQSXA5EGJVNTPVHD7444C2KLKXHDI.data',
    'added QmSCq2peGvGDXZKuX565UczxRpgzsiPPF3PgcJq9zDbByL recursive-get-dir/blocks/CIQDD',
    'added QmdgaiKe1HFfhrZvLwTFCrXmgTojhSWuBvyFXUVc8KzJVc recursive-get-dir/blocks/CIQBE/CIQBED3K6YA5I3QQWLJOCHWXDRK5EXZQILBCKAPEDUJENZ5B5HJ5R3A.data',
    'added QmYwUkwNwJN2cevwXKL48DRpbbjbdLWyyLANG3BKTtsTZ8 recursive-get-dir/blocks/CIQBE',
    'added QmamKEPmEH9RUsqRQsfNf5evZQDQPYL9KXg1ADeT7mkHkT recursive-get-dir/blocks',
    'added Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z recursive-get-dir'
  ]

  before(() => {
    ipfs = thing.ipfs
  })

  it('add with progress', function () {
    this.timeout(30 * 1000)

    return ipfs('add -p src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
      })
  })

  it('add', function () {
    this.timeout(30 * 1000)

    return ipfs('add src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
      })
  })

  it('add multiple', function () {
    this.timeout(30 * 1000)

    return ipfs('add', 'src/init-files/init-docs/readme', 'test/fixtures/odd-name-[v0]/odd name [v1]/hello', '--wrap-with-directory')
      .then((out) => {
        expect(out)
          .to.include('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
        expect(out)
          .to.include('added QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o hello\n')
      })
  })

  it('add alias', function () {
    this.timeout(30 * 1000)

    return ipfs('add src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
      })
  })

  it('add recursively test', function () {
    this.timeout(60 * 1000)

    return ipfs('add -r test/fixtures/test-data/recursive-get-dir')
      .then((out) => {
        expect(out).to.eql(recursiveGetDirResults.join('\n') + '\n')
      })
  })

  it('add directory with trailing slash test', function () {
    this.timeout(30 * 1000)

    return ipfs('add -r test/fixtures/test-data/recursive-get-dir/')
      .then((out) => {
        expect(out).to.eql(recursiveGetDirResults.join('\n') + '\n')
      })
  })

  it('add directory with odd name', function () {
    this.timeout(30 * 1000)
    const expected = [
      'added QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o odd-name-[v0]/odd name [v1]/hello',
      'added QmYRMUVULBfj7WrdPESnwnyZmtayN6Sdrwh1nKcQ9QgQeZ odd-name-[v0]/odd name [v1]',
      'added QmXJGoo27bg7ExNAtr9vRcivxDwcfHtkxatGno9HrUdR16 odd-name-[v0]'
    ]

    return ipfs('add -r test/fixtures/odd-name-[v0]')
      .then((out) => {
        expect(out).to.eql(expected.join('\n') + '\n')
      })
  })

  it('add and wrap with a directory', function () {
    this.timeout(30 * 1000)

    return ipfs('add -w src/init-files/init-docs/readme').then((out) => {
      expect(out).to.be.eql([
        'added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme',
        'added QmapdaVPjHXdcswef82FnGQUauMNpk9xYFkLDZKgAxhMwq'
      ].join('\n') + '\n')
    })
  })

  it('add with cid-version=0', function () {
    this.timeout(30 * 1000)

    return ipfs('add src/init-files/init-docs/readme --cid-version=0').then((out) => {
      expect(out)
        .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
    })
  })

  it('add with cid-version=1 < default max chunk size', function () {
    this.timeout(30 * 1000)

    return ipfs('add test/fixtures/less-than-default-max-chunk-size --cid-version=1')
      .then((out) => {
        expect(out)
          .to.eql('added zb2rhh5LdXumxQfNZCqV8pmcC56LX71ERgf2qCNQsmZnwYYx9 less-than-default-max-chunk-size\n')
      })
  })

  it('add with cid-version=1 > default max chunk size', function () {
    this.timeout(30 * 1000)

    return ipfs('add test/fixtures/greater-than-default-max-chunk-size --cid-version=1')
      .then((out) => {
        expect(out)
          .to.eql('added zdj7WbyyZoWVifUHUe58SNS184PpN8qAuCP6HpAY91iA8CveT greater-than-default-max-chunk-size\n')
      })
  })

  it('add with cid-version=1 and raw-leaves=false < default max chunk size', function () {
    this.timeout(30 * 1000)

    return ipfs(`add test/fixtures/less-than-default-max-chunk-size --cid-version=1 --raw-leaves=false`)
      .then((out) => {
        expect(out)
          .to.eql('added zdj7WWPWpmpFkrWJBhUEZ4QkGumsFsEdkaaEGs7U4dzJraogp less-than-default-max-chunk-size\n')
      })
  })

  it('add with cid-version=1 and raw-leaves=false > default max chunk size', function () {
    this.timeout(30 * 1000)

    return ipfs(`add test/fixtures/greater-than-default-max-chunk-size --cid-version=1 --raw-leaves=false`)
      .then((out) => {
        expect(out)
          .to.eql('added zdj7WmYojH6vMkDQFNDNwUy2ZawrggqAhS6jjRJwb1C4KXZni greater-than-default-max-chunk-size\n')
      })
  })

  it('add with cid-version=1 and raw-leaves=true < default max chunk size', function () {
    this.timeout(30 * 1000)

    return ipfs('add test/fixtures/less-than-default-max-chunk-size --cid-version=1 --raw-leaves=true')
      .then((out) => {
        expect(out)
          .to.eql('added zb2rhh5LdXumxQfNZCqV8pmcC56LX71ERgf2qCNQsmZnwYYx9 less-than-default-max-chunk-size\n')
      })
  })

  it('add with cid-version=1 and raw-leaves=true > default max chunk size', function () {
    this.timeout(30 * 1000)

    return ipfs('add test/fixtures/greater-than-default-max-chunk-size --cid-version=1 --raw-leaves=true')
      .then((out) => {
        expect(out)
          .to.eql('added zdj7WbyyZoWVifUHUe58SNS184PpN8qAuCP6HpAY91iA8CveT greater-than-default-max-chunk-size\n')
      })
  })

  it('add from pipe', () => {
    const proc = ipfs('add')
    proc.stdin.write(Buffer.from('hello\n'))
    proc.stdin.end()
    return proc
      .then(out => {
        expect(out)
          .to.eql('added QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN\n')
      })
  })

  it('add --quiet', function () {
    this.timeout(30 * 1000)

    return ipfs('add -q src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')
      })
  })

  it('add --quieter', function () {
    this.timeout(30 * 1000)

    return ipfs('add -Q -w test/fixtures/test-data/hello')
      .then((out) => {
        expect(out)
          .to.eql('QmYRMUVULBfj7WrdPESnwnyZmtayN6Sdrwh1nKcQ9QgQeZ\n')
      })
  })

  it('add --silent', function () {
    this.timeout(30 * 1000)

    return ipfs('add --silent src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('')
      })
  })

  it('add --only-hash outputs correct hash', function () {
    return ipfs('add --only-hash src/init-files/init-docs/readme')
      .then(out =>
        expect(out)
          .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme\n')
      )
  })

  it('add --only-hash does not add a file to the datastore', function () {
    this.timeout(30 * 1000)
    this.slow(10 * 1000)
    const content = String(Math.random())
    const filepath = path.join(os.tmpdir(), `${content}.txt`)
    fs.writeFileSync(filepath, content)

    return ipfs(`add --only-hash ${filepath}`)
      .then(out => {
        const hash = out.split(' ')[1]

        // 'jsipfs object get <hash>' should timeout with the daemon on
        // and should fail fast with the daemon off
        return Promise.race([
          ipfs.fail(`object get ${hash}`),
          new Promise((resolve, reject) => setTimeout(resolve, 4000))
        ])
          .then(() => clean(filepath))
      })
  })

  it('add pins by default', function () {
    this.timeout(10 * 1000)
    const filePath = path.join(os.tmpdir(), hat())
    const content = String(Math.random())
    fs.writeFileSync(filePath, content)

    return ipfs(`add -Q ${filePath}`)
      .then(out => {
        const hash = out.trim()
        return ipfs(`pin ls ${hash}`)
          .then(ls => expect(ls).to.include(hash))
      })
      .then(() => clean(filePath))
  })

  it('add does not pin with --pin=false', function () {
    this.timeout(20 * 1000)
    const filePath = path.join(os.tmpdir(), hat())
    const content = String(Math.random())
    fs.writeFileSync(filePath, content)

    return ipfs(`add -Q --pin=false ${filePath}`)
      .then(out => ipfs.fail(`pin ls ${out.trim()}`))
      .then(() => clean(filePath))
  })

  HASH_ALGS.forEach((name) => {
    it(`add with hash=${name} and raw-leaves=false`, function () {
      this.timeout(30 * 1000)

      return ipfs(`add src/init-files/init-docs/readme --hash=${name} --raw-leaves=false`)
        .then((out) => {
          const hash = out.split(' ')[1]
          const cid = new CID(hash)
          expect(mh.decode(cid.multihash).name).to.equal(name)
        })
    })
  })

  it('should add and print CID encoded in specified base', function () {
    this.timeout(30 * 1000)

    return ipfs('add test/fixtures/test-data/hello --cid-base=base64')
      .then((out) => {
        expect(out).to.eql('added mAXASIEbUSBS5xa8UHDqqt8BdxehE6tX5HxKFiwIeukV2i0wO hello\n')
      })
  })

  it('cat', function () {
    this.timeout(30 * 1000)

    return ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out).to.eql(readme)
      })
  })

  it('cat alias', function () {
    this.timeout(20 * 1000)

    return ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out).to.eql(readme)
      })
  })

  it('cat part of a file using `count`', function () {
    this.timeout(30 * 1000)

    return ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB --offset 21 --count 5')
      .then((out) => {
        expect(out).to.eql(readme.substring(21, 26))
      })
  })

  it('cat part of a file using `length`', function () {
    this.timeout(30 * 1000)

    return ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB --offset 21 --length 5')
      .then((out) => {
        expect(out).to.eql(readme.substring(21, 26))
      })
  })

  it('cat non-existent file', () => {
    return ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB/dummy')
      .then(() => expect.fail(0, 1, 'Should have thrown an error'))
      .catch((err) => {
        expect(err).to.exist()
      })
  })

  it('get', function () {
    this.timeout(20 * 1000)

    return ipfs('get QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out)
          .to.eql('Saving file(s) QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')

        const file = path.join(process.cwd(), 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        expect(fs.readFileSync(file).toString()).to.eql(readme)

        rimraf(file)
      })
  })

  it('get alias', function () {
    this.timeout(20 * 1000)

    return ipfs('get QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out)
          .to.eql('Saving file(s) QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')

        const file = path.join(process.cwd(), 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        expect(fs.readFileSync(file).toString()).to.eql(readme)

        rimraf(file)
      })
  })

  it('get recursively', function () {
    this.timeout(20 * 1000)

    const outDir = path.join(process.cwd(), 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
    rimraf(outDir)

    return ipfs('get Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
      .then((out) => {
        expect(out).to.eql(
          'Saving file(s) Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z\n'
        )

        const outDir = path.join(process.cwd(), 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
        const expectedDir = path.join(process.cwd(), 'test', 'fixtures', 'test-data', 'recursive-get-dir')

        const compareResult = compareDir(outDir, expectedDir, {
          compareContent: true,
          compareSize: true
        })

        expect(compareResult.differences).to.equal(0)
        rimraf(outDir)
      })
  })
}))
