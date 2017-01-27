/* Helper functions */

export function toFileInfo (data) {
  return {
    name: data.file.path,
    hash: data.file.hash,
    size: data.file.size,
    ts: data.ts,
    type: data.mime
  }
}

export function getHumanReadableBytes (size) {
  var i = Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, i)).toFixed(i > 2 ? 2 : 0) * 1 + ' ' + ['Bytes', 'kB', 'MB', 'GB', 'TB'][i]
}

export function getFormattedTime (timestamp) {
  const safeTime = (time) => ('0' + time).slice(-2)
  const date = new Date(timestamp)
  return safeTime(date.getHours()) + ':' + safeTime(date.getMinutes()) + ':' + safeTime(date.getSeconds())
}

export function isMediaFile (type) {
  return type === 'image'
      || type === 'audio'
      || type === 'video'
}
