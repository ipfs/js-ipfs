import sinon from 'sinon'

/**
 * @param {import('@libp2p/interface-peer-id').PeerId} peerId
 * @returns {import('sinon').SinonMatcher}
 */
export function matchPeerId (peerId) {
  return sinon.match((value) => {
    return peerId.toString() === value.toString()
  })
}
