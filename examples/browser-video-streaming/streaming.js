'use strict'

/* global Hls Ipfs HlsjsIpfsLoader */
/* eslint-env browser */
document.addEventListener('DOMContentLoaded', async () => {
  const testHash = 'QmdpAidwAsBGptFB3b6A9Pyi5coEbgjHrL3K2Qrsutmj9K'
  const repoPath = 'ipfs-' + Math.random()
  const node = await Ipfs.create({ repo: repoPath })

  Hls.DefaultConfig.loader = HlsjsIpfsLoader
  Hls.DefaultConfig.debug = false
  if (Hls.isSupported()) {
    const video = document.getElementById('video')
    const hls = new Hls()
    hls.config.ipfs = node
    hls.config.ipfsHash = testHash
    hls.loadSource('master.m3u8')
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play())
  }
})

// TODO: remove everything below here once https://github.com/ipfs/js-ipfs/pull/2683
// and https://github.com/moshisushi/hlsjs-ipfs-loader/pull/16 are released

class HlsjsIpfsLoader {
  constructor(config) {
    this.ipfs = config.ipfs
    this.hash = config.ipfsHash
    if (config.debug === false) {
      this.debug = function() {}
    } else if (config.debug === true) {
      this.debug = console.log
    } else {
      this.debug = config.debug
    }
    if(config.m3u8provider) {
      this.m3u8provider = config.m3u8provider;
    } else {
      this.m3u8provider = null;
    }
    if(config.tsListProvider) {
      this.tsListProvider = config.tsListProvider;
    } else {
      this.tsListProvider = null;
    }
  }

  destroy() {
  }

  abort() {
  }

  load(context, config, callbacks) {
    this.context = context
    this.config = config
    this.callbacks = callbacks
    this.stats = { trequest: performance.now(), retry: 0 }
    this.retryDelay = config.retryDelay
    this.loadInternal()
  }
  /**
   * Call this by getting the HLSIPFSLoader instance from hls.js hls.coreComponents[0].loaders.manifest.setM3U8Provider()
   * @param {function} provider
   */
  setM3U8Provider(provider) {
    this.m3u8provider = provider;
  }
  /**
   *
   * @param {function} provider
   */
  setTsListProvider(provider) {
    this.tsListProvider = provider;
  }

  loadInternal() {
    const { stats, context, callbacks } = this

    stats.tfirst = Math.max(performance.now(), stats.trequest)
    stats.loaded = 0

    const urlParts = context.url.split("/")
    const filename = urlParts[urlParts.length - 1]

    if(filename.split(".")[1] === "m3u8" && this.m3u8provider !== null) {
      const res = this.m3u8provider();
      let data;
      if(Buffer.isBuffer(res)) {
        data = buf2str(res)
      } else {
        data = res;
      }
      const response = { url: context.url, data: data }
      callbacks.onSuccess(response, stats, context)
      return;
    }
    if(filename.split(".")[1] === "m3u8" && this.tsListProvider !== null) {
      var tslist = this.tsListProvider();
      var hash = tslist[filename];
      if(hash) {
        this.cat(hash).then(res => {
          let data;
          if(Buffer.isBuffer(res)) {
            data = buf2str(res)
          } else {
            data = res;
          }
          stats.loaded = stats.total = data.length
          stats.tload = Math.max(stats.tfirst, performance.now())
          const response = { url: context.url, data: data }
          callbacks.onSuccess(response, stats, context)
        });
      }
      return;
    }
    getFile(this.ipfs, this.hash, filename, this.debug).then(res => {
      const data = (context.responseType === 'arraybuffer') ? res : buf2str(res)
      stats.loaded = stats.total = data.length
      stats.tload = Math.max(stats.tfirst, performance.now())
      const response = { url: context.url, data: data }
      callbacks.onSuccess(response, stats, context)
    }, console.error)
  }
}

async function getFile(ipfs, rootHash, filename, debug) {
  debug(`Fetching hash for '${rootHash}/${filename}'`)
  if(filename === null) {
    return cat(rootHash, ipfs, debug)
  }

  for await (const link of ipfs.ls(rootHash)) {
    if (link.name !== filename) {
      continue
    }

    debug(`Requesting '${link.path}'`)

    return cat(link.cid, ipfs, debug)
  }

  throw new Error(`File not found: ${rootHash}/${filename}`)
}

function buf2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

async function cat (cid, ipfs, debug) {
  let value = new Uint8Array(0)

  for await (const buf of ipfs.cat(cid)) {
    const newBuf = new Uint8Array(value.length + buf.length)
    newBuf.set(value)
    newBuf.set(buf, value.length)
    value = newBuf
  }

  debug(`Received data for file '${cid}' size: ${value.length}`)
  return value
}
