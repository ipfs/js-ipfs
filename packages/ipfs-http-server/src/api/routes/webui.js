import resources from 'ipfs-http-gateway/resources/index'

const webuiCid = 'bafybeif4zkmu7qdhkpf3pnhwxipylqleof7rl6ojbe7mq3fzogz6m4xk3i' // v2.11.4

export default [
  {
    method: 'GET',
    path: `/ipfs/${webuiCid}/{path*}`, // only the whitelisted webui is allowed on API port
    options: {
      handler: resources.gateway.handler,
      response: {
        ranges: false // disable built-in support, handler does it manually
      },
      ext: {
        onPostHandler: { method: resources.gateway.afterHandler }
      }
    }
  },
  {
    method: 'GET',
    path: '/webui/{slug?}', // optional slug makes it work with and without slash
    /**
     * @param {import('../../types').Request} _request
     * @param {import('@hapi/hapi').ResponseToolkit} h
     */
    handler (_request, h) {
      return h.redirect(`/ipfs/${webuiCid}/`)
    }
  }
]
