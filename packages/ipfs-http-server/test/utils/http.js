import { HttpApi } from '../../src/index.js'

export async function http (request, { ipfs, cors } = {}) {
  const api = new HttpApi(ipfs)
  const server = await api._createApiServer('127.0.0.1', 8080, ipfs, cors)

  return server.inject(request)
}
