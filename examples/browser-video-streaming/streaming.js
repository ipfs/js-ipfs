'use strict'

/* global Hls Ipfs HlsjsIpfsLoader */
/* eslint-env browser */

const testhash = 'QmdpAidwAsBGptFB3b6A9Pyi5coEbgjHrL3K2Qrsutmj9K'
const repoPath = 'ipfs-' + Math.random()
const node = new Ipfs({ repo: repoPath })

node.on('ready', () => {
  Hls.DefaultConfig.loader = HlsjsIpfsLoader
  Hls.DefaultConfig.debug = false
  if (Hls.isSupported()) {
    const video = document.getElementById('video')
    const hls = new Hls()
    hls.config.ipfs = node
    hls.config.ipfsHash = testhash
    hls.loadSource('master.m3u8')
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play())
  }
})
