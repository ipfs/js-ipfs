'use strict'

module.exports = {
  // Name of the organization or project this roadmap is generated for
  organization: 'js-ipfs',

  // Include open and closed milestones where due date is after milestonesStartDate
  milestonesStartDate: '2016-10-01T00:00:00Z', // ISO formatted timestamp

  // Include open and closed milestones where due date is before milestonesEndDate
  milestonesEndDate: '2016-12-30T00:00:00Z', // ISO formatted timestamp

  // Github repository to open open a Pull Request with the generated roadmap
  targetRepo: "ipfs/js-ipfs", // 'owner/repo'

  // List of projects that this roadmap covers
  projects: [
    {
      name: "js-ipfs",
      // Repositories that this project consists of.
      repos: [
        "ipfs/js-ipfs",
        "ipfs/js-ipfs-api",
        "ipfs/js-ipfs-block-service",
        "ipfs/js-ipfs-repo",
        "ipfs/js-ipfs-block",
        "ipfs/js-ipfs-merkle-dag",
        "ipfs/js-ipfs-unixfs",
        "ipfs/js-ipfs-unixfs-engine",
        "ipfs/js-ipfs-bitswap",
        "ipfs/js-ipfsd-ctl",
        "dignifiedquire/aegir",
        "ipfs/js-libp2p-ipfs",
        "ipfs/js-libp2p-ipfs-browser",
        "ipld/js-ipld-dag-cbor",
        "ipld/js-ipld-resolver",
        "multiformats/js-multiaddr",
        "multiformats/js-multibase",
        "multiformats/js-multicodec",
        "multiformats/js-multihash",
        "multiformats/js-multihashing",
        "multiformats/js-multihashing-async",
        "multiformats/js-multistream-select",
        "multiformats/multistream-select"
      ],
      // WIP
      links: {
        status: `## Status and Progress\n
[![Project Status](https://badge.waffle.io/ipfs/js-ipfs.svg?label=Backlog&title=Backlog)](http://waffle.io/ipfs/js-ipfs) [![Project Status](https://badge.waffle.io/ipfs/js-ipfs.svg?label=In%20Progress&title=In%20Progress)](http://waffle.io/ipfs/js-ipfs) [![Project Status](https://badge.waffle.io/ipfs/js-ipfs.svg?label=Done&title=Done)](http://waffle.io/ipfs/js-ipfs)\n
See details of current progress on [Orbit's project board](https://waffle.io/haadcode/orbit)\n\n`
      }
    },
  ]
}
