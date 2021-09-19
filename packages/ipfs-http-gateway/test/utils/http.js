
import { HttpGateway } from '../../src/index.js'

export async function http (request, { ipfs } = {}) {
  const api = new HttpGateway(ipfs)
  const server = await api._createGatewayServer('127.0.0.1', 8080, ipfs)

  return server.inject(request)
}
