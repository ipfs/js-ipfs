#! /usr/bin/env node

// This script generates the table of packages you can see in the readme

// Columns to show at the header of the table
const columns = [
  'Package',
  'Version',
  'Deps',
  'CI',
  'Coverage'
]

// Headings are a string
// Arrays are packages. Index 0 is the GitHub repo and index 1 is the npm package
const rows = [
  'Files',
  ['ipfs/js-ipfs-unixfs-engine', 'ipfs-unixfs-engine'],

  'DAG',
  ['ipld/js-ipld', 'ipld'],
  ['ipld/js-ipld-dag-pb', 'ipld-dag-pb'],
  ['ipld/js-ipld-dag-cbor', 'ipld-dag-cbor'],

  'Repo',
  ['ipfs/js-ipfs-repo', 'ipfs-repo'],

  'Exchange',
  ['ipfs/js-ipfs-block-service', 'ipfs-block-service'],
  ['ipfs/js-ipfs-bitswap', 'ipfs-bitswap'],

  'libp2p',
  ['libp2p/js-libp2p', 'libp2p'],
  ['libp2p/js-libp2p-circuit', 'libp2p-circuit'],
  ['libp2p/js-libp2p-floodsub', 'libp2p-floodsub'],
  ['libp2p/js-libp2p-kad-dht', 'libp2p-kad-dht'],
  ['libp2p/js-libp2p-mdns', 'libp2p-mdns'],
  ['libp2p/js-libp2p-mplex', 'libp2p-mplex'],
  ['libp2p/js-libp2p-railing', 'libp2p-railing'],
  ['libp2p/js-libp2p-secio', 'libp2p-secio'],
  ['libp2p/js-libp2p-tcp', 'libp2p-tcp'],
  ['libp2p/js-libp2p-webrtc-star', 'libp2p-webrtc-star'],
  ['libp2p/js-libp2p-websocket-star', 'libp2p-websocket-star'],
  ['libp2p/js-libp2p-websockets', 'libp2p-websockets'],

  'Data Types',
  ['ipfs/js-ipfs-block', 'ipfs-block'],
  ['ipfs/js-ipfs-unixfs', 'ipfs-unixfs'],
  ['libp2p/js-peer-id', 'peer-id'],
  ['libp2p/js-peer-info', 'peer-info'],
  ['multiformats/js-multiaddr', 'multiaddr'],
  ['multiformats/js-multihash', 'multihashes'],

  'Crypto',
  ['libp2p/js-libp2p-crypto', 'libp2p-crypto'],
  ['libp2p/js-libp2p-keychain', 'libp2p-keychain'],
  
  'Generics/Utils',
  ['ipfs/js-ipfs-api', 'ipfs-api'],
  ['ipfs/ipfs-multipart', 'ipfs-multipart'],
  ['ipfs/is-ipfs', 'is-ipfs'],
  ['multiformats/js-multihashing', 'multihashing'],
  ['multiformats/js-mafmt', 'mafmt']
]

const isItemPackage = (item) => {
  return Array.isArray(item)
}

const packageBadges = [
  // Package
  (gh, npm) => `[\`${npm}\`](//github.com/${gh})`,
  // Version
  (gh, npm) => `[![npm](https://img.shields.io/npm/v/${npm}.svg?maxAge=86400&style=flat-square)](//github.com/${gh}/releases)`,
  // Deps
  (gh, npm) => `[![Deps](https://david-dm.org/${gh}.svg?style=flat-square)](https://david-dm.org/${gh})`,
  // CI
  (gh, npm) => {
    // Need to fix the path for jenkins links, as jenkins adds `/job/` between everything
    const jenkinsPath = gh.split('/').join('/job/')
    return `[![jenkins](https://ci.ipfs.team/buildStatus/icon?job=${gh}/master)](https://ci.ipfs.team/job/${jenkinsPath}/job/master/)`
  },
  // Coverage
  (gh, npm) => `[![codecov](https://codecov.io/gh/${gh}/branch/master/graph/badge.svg)](https://codecov.io/gh/${gh})`
]

// Creates the table row for a package
const generatePackageRow = (item) => {
  const row = packageBadges.map((func) => {
    // First string is GitHub path, second is npm package name
    return func(item[0], item[1])
  }).join(' | ')
  const fullRow = `| ${row} |`
  return fullRow
}

// Generates a row for the table, depending if it's a package or a heading
const generateRow = (item) => {
  if (isItemPackage(item)) {
    return generatePackageRow(item)
  } else {
    return `| **${item}** |`
  }
}

const header = `| ${columns.join(' | ')} |`
const hr = `| ${columns.map(() => '---------').join('|')} |`

const toPrint = [
  header,
  hr,
  rows.map((row) => generateRow(row)).join('\n')
]

toPrint.forEach((t) => console.log(t))
