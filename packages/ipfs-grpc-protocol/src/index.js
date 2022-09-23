
export default {
  nested: {
    ipfs: {
      nested: {
        FileType: {
          values: {
            DIRECTORY: 0,
            FILE: 1
          }
        },
        MFS: {
          methods: {
            ls: {
              requestType: 'LsRequest',
              responseType: 'LsResponse',
              responseStream: true
            },
            write: {
              requestType: 'WriteRequest',
              requestStream: true,
              responseType: 'WriteResponse'
            }
          }
        },
        LsRequest: {
          fields: {
            path: {
              type: 'string',
              id: 1
            }
          }
        },
        LsResponse: {
          fields: {
            name: {
              type: 'string',
              id: 1
            },
            type: {
              type: 'FileType',
              id: 2
            },
            size: {
              type: 'uint32',
              id: 3
            },
            cid: {
              type: 'string',
              id: 4
            },
            mode: {
              type: 'uint32',
              id: 5
            },
            mtime: {
              type: 'int32',
              id: 6
            },
            mtimeNsecs: {
              type: 'uint32',
              id: 7
            }
          }
        },
        WriteRequest: {
          fields: {
            path: {
              type: 'string',
              id: 1
            },
            content: {
              type: 'bytes',
              id: 2
            }
          }
        },
        WriteResponse: {
          fields: {}
        },
        PubSub: {
          methods: {
            subscribe: {
              requestType: 'SubscribeRequest',
              responseType: 'SubscribeResponse',
              responseStream: true
            },
            unsubscribe: {
              requestType: 'UnSubscribeRequest',
              responseType: 'UnSubscribeResponse'
            }
          }
        },
        SubscribeRequest: {
          fields: {
            topic: {
              type: 'string',
              id: 1
            }
          }
        },
        SubscribeResponse: {
          fields: {
            handler: {
              type: 'string',
              id: 1
            },
            from: {
              type: 'string',
              id: 2
            },
            sequenceNumber: {
              type: 'bytes',
              id: 3
            },
            data: {
              type: 'bytes',
              id: 4
            },
            topic: {
              type: 'string',
              id: 5
            },
            key: {
              type: 'bytes',
              id: 6
            },
            signature: {
              type: 'bytes',
              id: 7
            },
            type: {
              type: 'string',
              id: 8
            }
          }
        },
        UnSubscribeRequest: {
          fields: {
            topic: {
              type: 'string',
              id: 1
            },
            handlers: {
              rule: 'repeated',
              type: 'string',
              id: 2
            }
          }
        },
        UnSubscribeResponse: {
          fields: {}
        },
        Root: {
          methods: {
            id: {
              requestType: 'IdRequest',
              responseType: 'IdResponse'
            },
            add: {
              requestType: 'AddRequest',
              requestStream: true,
              responseType: 'AddResponse',
              responseStream: true
            }
          }
        },
        AddResponseType: {
          values: {
            PROGRESS: 0,
            RESULT: 1
          }
        },
        IdRequest: {
          fields: {
            peerId: {
              type: 'string',
              id: 1
            }
          }
        },
        IdResponse: {
          fields: {
            id: {
              type: 'string',
              id: 1
            },
            publicKey: {
              type: 'string',
              id: 2
            },
            addresses: {
              rule: 'repeated',
              type: 'string',
              id: 3
            },
            agentVersion: {
              type: 'string',
              id: 4
            },
            protocolVersion: {
              type: 'string',
              id: 5
            },
            protocols: {
              rule: 'repeated',
              type: 'string',
              id: 6
            }
          }
        },
        AddRequest: {
          fields: {
            index: {
              type: 'int32',
              id: 1
            },
            type: {
              type: 'FileType',
              id: 2
            },
            path: {
              type: 'string',
              id: 3
            },
            mode: {
              type: 'uint32',
              id: 4
            },
            mtime: {
              type: 'int32',
              id: 5
            },
            mtimeNsecs: {
              type: 'uint32',
              id: 6
            },
            content: {
              type: 'bytes',
              id: 7
            }
          }
        },
        AddResponse: {
          fields: {
            type: {
              type: 'AddResponseType',
              id: 1
            },
            path: {
              type: 'string',
              id: 2
            },
            bytes: {
              type: 'int32',
              id: 3
            },
            cid: {
              type: 'string',
              id: 4
            },
            mode: {
              type: 'uint32',
              id: 5
            },
            mtime: {
              type: 'int32',
              id: 6
            },
            mtimeNsecs: {
              type: 'uint32',
              id: 7
            },
            size: {
              type: 'uint32',
              id: 8
            }
          }
        }
      }
    }
  }
}
