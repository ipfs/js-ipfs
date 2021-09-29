import { createSuite } from '../utils/suite.js'
import { testBitswap } from './bitswap.js'
import { testBw } from './bw.js'
import { testRepo } from './repo.js'

const tests = {
  bitswap: testBitswap,
  bw: testBw,
  repo: testRepo
}

export default createSuite(tests)
