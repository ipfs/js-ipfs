
export function allNdjson (res) {
  return res.result
    .split('\n')
    .map(line => line.trim())
    .filter(line => Boolean(line))
    .map(line => JSON.parse(line))
}
