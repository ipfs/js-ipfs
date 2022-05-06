import protocol from 'ipfs-grpc-protocol'
import protobuf from 'protobufjs/light.js'

const { Service } = protobuf

const CONVERSION_OPTS = {
  keepCase: false,
  longs: String, // long.js is required
  enums: String,
  defaults: false,
  oneofs: true
}

export function loadServices () {
  // @ts-expect-error - recent protobufjs release changed the types
  const root = protobuf.Root.fromJSON(protocol)

  /** @type {Record<string, any>} */
  const output = {}

  Object
    // @ts-expect-error
    .keys(root.nested.ipfs)
    // @ts-expect-error
    .filter(key => root.nested.ipfs[key] instanceof Service)
    // @ts-expect-error
    .map(key => root.nested.ipfs[key])
    .forEach(service => {
      /** @type {Record<string, any>} */
      const serviceDef = {}

      output[service.name] = serviceDef

      Object.keys(service.methods)
        .forEach(methodName => {
          const method = service.methods[methodName].resolve()

          serviceDef[methodName] = {
            path: `/ipfs.${service.name}/${methodName}`,
            requestStream: method.requestStream,
            responseStream: method.responseStream,
            /**
             * @param {*} obj
             */
            requestSerialize: (obj) => {
              const message = method.resolvedRequestType.fromObject(obj)
              return method.resolvedRequestType.encode(message).finish()
            },
            /**
             * @param {Uint8Array} buf
             */
            requestDeserialize: (buf) => {
              const message = method.resolvedRequestType.decode(buf)
              const obj = method.resolvedRequestType.toObject(message, CONVERSION_OPTS)

              Object.defineProperty(obj, 'toObject', {
                enumerable: false,
                configurable: false,
                value: () => obj
              })

              return obj
            },
            /**
             * @param {any} obj
             */
            responseSerialize: (obj) => {
              const message = method.resolvedResponseType.fromObject(obj)
              return method.resolvedResponseType.encode(message).finish()
            },
            /**
             * @param {Uint8Array} buf
             */
            responseDeserialize: (buf) => {
              const message = method.resolvedResponseType.decode(buf)
              const obj = method.resolvedResponseType.toObject(message, CONVERSION_OPTS)

              Object.defineProperty(obj, 'toObject', {
                enumerable: false,
                configurable: false,
                value: () => obj
              })

              return obj
            }
          }
        })
    })

  return output
}
