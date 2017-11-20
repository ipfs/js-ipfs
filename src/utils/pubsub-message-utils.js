'use strict'

const bs58 = require('bs58')

module.exports = {
  deserialize (data, enc) {
    enc = enc ? enc.toLowerCase() : 'json'

    if (enc === 'json') {
      return deserializeFromJson(data)
    } else if (enc === 'base64') {
      return deserializeFromBase64(data)
    }

    throw new Error(`Unsupported encoding: '${enc}'`)
  }
}

function deserializeFromJson (data) {
  const json = JSON.parse(data)
  return deserializeFromBase64(json)
}

function deserializeFromBase64 (obj) {
  if (!isPubsubMessage(obj)) {
    throw new Error(`Not a pubsub message`)
  }

  return {
    from: bs58.encode(Buffer.from(obj.from, 'base64')).toString(),
    seqno: Buffer.from(obj.seqno, 'base64'),
    data: Buffer.from(obj.data, 'base64'),
    topicIDs: obj.topicIDs || obj.topicCIDs
  }
}

function isPubsubMessage (obj) {
  return obj && obj.from && obj.seqno && obj.data && (obj.topicIDs || obj.topicCIDs)
}
