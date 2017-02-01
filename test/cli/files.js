/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const compareDir = require('dir-compare').compareSync
const rimraf = require('rimraf').sync
const runOnAndOff = require('../utils/on-and-off')

describe('files', () => runOnAndOff((thing) => {
  let ipfs
  const readme = fs.readFileSync(path.join(process.cwd(), '/src/init-files/init-docs/readme'))
                   .toString('utf-8').slice(0, -1)

  before(() => {
    ipfs = thing.ipfs
  })

  it('add', () => {
    return ipfs('files add src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme')
      })
  })

  it('add alias', () => {
    return ipfs('add src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme')
      })
  })

  it('add recursively test', () => {
    return ipfs('files add -r test/test-data/recursive-get-dir')
      .then((out) => {
        expect(out).to.eql([
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
          'added QmfJMCvenrj4SKKRc48DYPxwVdS44qCUCqqtbqhJuSTWXP recursive-get-dir/datastore/LOCK',
          'added QmVJi93Yj5RW3NuqqxonGz3jAXUYHrdQvWrURxg1TiLEuX recursive-get-dir/datastore/CURRENT',
          'added QmcJ6TXPMPm6puSC9vpxuG57PyfGpr8bvTgkKU9SHHU5Uo recursive-get-dir/datastore/000010.ldb',
          'added QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU recursive-get-dir/datastore/000005.ldb',
          'added QmfExFwdFKspsY2q5WnhQjd1QDKnjpTQ4UkiHqqQxV7h67 recursive-get-dir/datastore/000002.ldb',
          'added Qma13ZrhKG52MWnwtZ6fMD8jGj8d4Q9sJgn5xtKgeZw5uz recursive-get-dir/datastore',
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
          'added QmfJMCvenrj4SKKRc48DYPxwVdS44qCUCqqtbqhJuSTWXP recursive-get-dir/blocks/CIQOH/CIQOHMGEIKMPYHAUTL57JSEZN64SIJ5OIHSGJG4TJSSJLGI3PBJLQVI.data',
          'added QmdiJnDhn4Bb1odByw1BA5qpXssjxgttVz42tpEfo7HNUe recursive-get-dir/blocks/CIQOH',
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
          'added QmQQHYDwAQms78fPcvx1uFFsfho23YJNoewfLbi9AtdyJ9 recursive-get-dir/blocks',
          'added QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2 recursive-get-dir'
        ].join('\n'))
      })
  })

  it('cat', () => {
    return ipfs('files cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out).to.eql(readme)
      })
  })

  it('cat alias', () => {
    return ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out).to.eql(readme)
      })
  })

  it('get', () => {
    return ipfs('files get QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out)
          .to.eql('Saving file(s) to QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        const file = path.join(process.cwd(), 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        expect(fs.readFileSync(file).toString().slice(0, -1)).to.eql(readme)

        rimraf(file)
      })
  })

  it('get alias', () => {
    return ipfs('get QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out)
          .to.eql('Saving file(s) to QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        const file = path.join(process.cwd(), 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        expect(fs.readFileSync(file).toString().slice(0, -1)).to.eql(readme)

        rimraf(file)
      })
  })

  it('get recursively', () => {
    const outDir = path.join(process.cwd(), 'QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2')
    rimraf(outDir)

    return ipfs('files get QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2')
      .then((out) => {
        expect(out).to.eql(
          'Saving file(s) to QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2'
        )

        const outDir = path.join(process.cwd(), 'QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2')
        const expectedDir = path.join(process.cwd(), 'test', 'test-data', 'recursive-get-dir')

        const compareResult = compareDir(outDir, expectedDir, {
          compareContent: true,
          compareSize: true
        })

        expect(compareResult.differences).to.equal(0)
        rimraf(outDir)
      })
  })
}))
