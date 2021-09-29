import Joi from '../../utils/joi.js'
import { ipfsHttpClient } from '../../version.js'

export const versionResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        timeout: Joi.timeout()
      })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        timeout
      }
    } = request

    const version = await ipfs.version({
      signal,
      timeout
    })

    return h.response({
      Version: version.version,
      Commit: version.commit,
      Repo: version.repo,
      'ipfs-core': version['ipfs-core'],
      'interface-ipfs-core': version['interface-ipfs-core'],
      'ipfs-http-client': ipfsHttpClient
    })
  }
}
