// Tests the implementation of the `command` preparator

const describe = require('mocha').describe
const it = require('mocha').it
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const Command = require('../src/commands')

const sampleCliWithChildren = {
  name: 'block',
  children: [
    {
      name: 'put',
      call: () => {},
      http: {},
      cli: {}
    }
  ]
}

const sampleCli = {
  name: 'id',
  description: 'Shows IPFS Node ID info',
  call: (self, options, callback) => {
    return callback(null, 'MyNodeID')
  },
  cli: {
    command: 'id',
    post: (id) => {
      return 'MyNodeID from CLI'
    }
  },
  http: {
    post: (id) => {
      return 'MyNodeID from HTTP'
    }
  }
}

const newCmdWithAdd = (toAdd) => {
  const cmd = new Command()
  cmd.add(toAdd)
  return cmd
}

const newCmdWithHttpInit = (toAdd, callback) => {
  const cmd = newCmdWithAdd(toAdd)
  return cmd.initHTTP(mockHTTPApi(callback))
}

const sampleMockRequest = {
  pre: {
    args: {}
  },
  server: {
    app: {
      ipfs: {
        id: 'mytestnode'
      }
    }
  }
}

const newCmdWithMockReply = (toAdd, commandToReply, mockReply, mockRequest) => {
  if (!mockRequest) {
    mockRequest = sampleMockRequest
  }
  const cmd = newCmdWithAdd(toAdd)
  return cmd.initHTTP(mockHTTPApi((res) => {
    if (res.path === commandToReply) {
      res.config.handler(mockRequest, mockReply)
    }
  }))
}

const mockHTTPApi = (callback) => {
  let routes = []
  const mockApi = {
    route: (actualOutput) => {
      routes.push(actualOutput)
      callback(actualOutput)
    }
  }
  return {
    select: () => {
      return mockApi
    },
    getAllRoutes: () => {
      return routes
    }
  }
}

// HTTP
// Set the payload property for command
// Set the payload property for commands children
// Set the payload property for commands childrens children
//
// Sets the pre property for command
// Sets the pre property for commands children
// Sets the pre property for commands childrens children
//
// Sets the call property for command
// Sets the call property for commands children
// Sets the call property for commands childrens children
//
// Sets the post property for command
// Sets the post property for commands children
// Sets the post property for commands childrens children
//
//
// CLI
// Generates cli command for command
// Generates cli command for commands children
// Generates cli command for commands childrens children
//
// Sets the pre property for command
// Sets the pre property for commands childrenm
// Sets the pre property for commands childrens children
//
// Sets the post property for command
// Sets the post property for commands children
// Sets the post property for commands childrens children
//
// HTTP + CLI
// Sets the http/cli call property for command
// Sets the http/cli call property for commands children
// Sets the http/cli call property for commands childrens children

const createOutputHTTPRoute = (path) => {
  return {
    method: '*',
    path: '/api/v0/' + path,
    config: {
      handler: (request, reply) => {},
      payload: {},
      pre: []
    }
  }
}

const expectMatchRoutes = (expectedRoutes, actualRoutes) => {
  expectedRoutes.forEach((route, index) => {
    expect(route.method).to.eql(actualRoutes[index].method)
    expect(route.path).to.eql(actualRoutes[index].path)
  })
}

describe('Commands', () => {
  describe('HTTP API', () => {
    describe('Method + path', () => {
      it('Generates method + path for command', () => {
        const output = [
          createOutputHTTPRoute('id')
        ]

        const cmd = newCmdWithAdd(sampleCli)
        const mock = mockHTTPApi(() => {})
        cmd.initHTTP(mock)

        expectMatchRoutes(output, mock.getAllRoutes())
      })
      it('Generates method + path for children', () => {
        const output = [
          createOutputHTTPRoute('id'),
          createOutputHTTPRoute('id/id')
        ]

        const firstChild = Object.assign({}, sampleCli)
        const cli = Object.assign({}, sampleCli)
        cli.children = [firstChild]

        const cmd = newCmdWithAdd(cli)
        const mock = mockHTTPApi(() => {})
        cmd.initHTTP(mock)

        expectMatchRoutes(output, mock.getAllRoutes())
      })
      it('Generates method + path for childrens children', () => {
        const output = [
          createOutputHTTPRoute('id'),
          createOutputHTTPRoute('id/id'),
          createOutputHTTPRoute('id/id/id')
        ]

        const secondChild = Object.assign({}, sampleCli)
        const firstChild = Object.assign({}, sampleCli)
        firstChild.children = [secondChild]
        const cli = Object.assign({}, sampleCli)
        cli.children = [firstChild]

        const cmd = newCmdWithAdd(cli)
        const mock = mockHTTPApi(() => {})
        cmd.initHTTP(mock)

        expectMatchRoutes(output, mock.getAllRoutes())
      })
    })
    describe('Args', () => {
      describe('No args', () => {
        it('Root', (done) => {
          const cli = Object.assign({}, sampleCli)
          cli.call = function (self, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          newCmdWithMockReply(cli, '/api/v0/id', (res) => {
            expect(res).to.eql(true)
            done()
          })
        })
        it('Children', (done) => {
          const firstChild = Object.assign({}, sampleCli)
          firstChild.call = function (self, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          const cli = Object.assign({}, sampleCli)
          cli.children = [firstChild]

          newCmdWithMockReply(cli, '/api/v0/id/id', (res) => {
            expect(res).to.eql(true)
            done()
          })
        })
        it('Childrens children', (done) => {
          const secondChild = Object.assign({}, sampleCli)
          secondChild.call = function (self, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          const firstChild = Object.assign({}, sampleCli)
          firstChild.children = [secondChild]
          const cli = Object.assign({}, sampleCli)
          cli.children = [firstChild]

          newCmdWithMockReply(cli, '/api/v0/id/id/id', (res) => {
            expect(res).to.eql(true)
            done()
          })
        })
      })
      describe('One arg', () => {
        it('Root', (done) => {
          const cli = Object.assign({}, sampleCli)
          cli.args = ['firstArg']
          cli.call = function (self, firstArg, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(firstArg).to.eql('ArgFromRequest')
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          newCmdWithMockReply(cli, '/api/v0/id', (res) => {
            expect(res).to.eql(true)
            done()
          }, Object.assign({}, sampleMockRequest, {
            pre: {
              args: {
                firstArg: 'ArgFromRequest'
              }
            }
          }))
        })
        it('Children', (done) => {
          const firstChild = Object.assign({}, sampleCli)
          firstChild.args = ['firstArg']
          firstChild.call = function (self, firstArg, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(firstArg).to.eql('ArgFromRequest')
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          const cli = Object.assign({}, sampleCli)
          cli.children = [firstChild]

          newCmdWithMockReply(cli, '/api/v0/id/id', (res) => {
            expect(res).to.eql(true)
            done()
          }, Object.assign({}, sampleMockRequest, {
            pre: {
              args: {
                firstArg: 'ArgFromRequest'
              }
            }
          }))
        })
        it('Childrens children', (done) => {
          const secondChild = Object.assign({}, sampleCli)
          secondChild.args = ['firstArg']
          secondChild.call = function (self, firstArg, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(firstArg).to.eql('ArgFromRequest')
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          const firstChild = Object.assign({}, sampleCli)
          firstChild.children = [secondChild]
          const cli = Object.assign({}, sampleCli)
          cli.children = [firstChild]


          newCmdWithMockReply(cli, '/api/v0/id/id/id', (res) => {
            expect(res).to.eql(true)
            done()
          }, Object.assign({}, sampleMockRequest, {
            pre: {
              args: {
                firstArg: 'ArgFromRequest'
              }
            }
          }))
        })
      })
      describe('Two args', () => {
        it('Root', (done) => {
          const cli = Object.assign({}, sampleCli)
          cli.args = ['firstArg', 'secondArg']
          cli.call = function (self, firstArg, secondArg, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(firstArg).to.eql('ArgFromRequest')
            expect(secondArg).to.eql('SecondArgFromRequest')
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          newCmdWithMockReply(cli, '/api/v0/id', (res) => {
            expect(res).to.eql(true)
            done()
          }, Object.assign({}, sampleMockRequest, {
            pre: {
              args: {
                firstArg: 'ArgFromRequest',
                secondArg: 'SecondArgFromRequest',
              }
            }
          }))
        })
        it('Children', (done) => {
          const firstChild = Object.assign({}, sampleCli)
          firstChild.args = ['firstArg', 'secondArg']
          firstChild.call = function (self, firstArg, secondArg, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(firstArg).to.eql('ArgFromRequest')
            expect(secondArg).to.eql('SecondArgFromRequest')
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          const cli = Object.assign({}, sampleCli)
          cli.children = [firstChild]

          newCmdWithMockReply(cli, '/api/v0/id/id', (res) => {
            expect(res).to.eql(true)
            done()
          }, Object.assign({}, sampleMockRequest, {
            pre: {
              args: {
                firstArg: 'ArgFromRequest',
                secondArg: 'SecondArgFromRequest'
              }
            }
          }))
        })
        it('Childrens children', (done) => {
          const secondChild = Object.assign({}, sampleCli)
          secondChild.args = ['firstArg', 'secondArg']
          secondChild.call = function (self, firstArg, secondArg, options, callback) {
            expect(self).to.eql({id: 'mytestnode'})
            expect(firstArg).to.eql('ArgFromRequest')
            expect(secondArg).to.eql('SecondArgFromRequest')
            expect(options).to.eql({})
            expect(callback).to.be.an.instanceof(Function)

            callback(null, true)
          }
          const firstChild = Object.assign({}, sampleCli)
          firstChild.children = [secondChild]
          const cli = Object.assign({}, sampleCli)
          cli.children = [firstChild]


          newCmdWithMockReply(cli, '/api/v0/id/id/id', (res) => {
            expect(res).to.eql(true)
            done()
          }, Object.assign({}, sampleMockRequest, {
            pre: {
              args: {
                firstArg: 'ArgFromRequest',
                secondArg: 'SecondArgFromRequest'
              }
            }
          }))
        })
      })
    })
  })
  /*
  describe('With children', () => {
    describe('HTTP API', () => {
      it('Generates the method + path', () => {
        const output = [{
          method: '*',
          path: '/api/v0/block'
        }, {
          method: '*',
          path: '/api/v0/block/put'
        }]

        const cmd = newCmdWithAdd(sampleCliWithChildren)
        const mock = mockHTTPApi(() => {})
        cmd.initHTTP(mock)

        expect(mock.getAllRoutes()).to.eql(output)
      })
      describe('Sets the payload property', () => {
        it('default payload', (done) => {
          newCmdWithHttpInit(sampleCli, (output) => {
            expect(output.payload).to.eql(undefined)
            done()
          })
        })
        it('custom payload', (done) => {
          const payload = {
            parse: false,
            output: 'stream'
          }
          const cliCmd = Object.assign({}, sampleCli)
          cliCmd.payload = payload

          newCmdWithHttpInit(cliCmd, (output) => {
            expect(output.config.payload).to.eql(payload)
            done()
          })
        })
      })
      xdescribe('Sets the post function for formatting', () => {})
      describe('Sets the pre property', () => {
        it('default pre', (done) => {
          newCmdWithHttpInit(sampleCli, (output) => {
            expect(output.pre).to.eql(undefined)
            done()
          })
        })
        it('custom pre', () => {
          const pre = () => {
            return 'testing right function'
          }

          const cliCmd = Object.assign({}, sampleCliWithChildren)
          cliCmd.children.forEach((cmd, index) => {
            if (cmd.name === 'put') {
              cliCmd.children[index].http = Object.assign({}, cmd, {
                pre
              })
            }
          })

          const cmd = newCmdWithAdd(cliCmd)
          const mock = mockHTTPApi(() => {})
          cmd.initHTTP(mock)

          mock.getAllRoutes().forEach((route) => {
            if (route.path === '/api/v0/block/put') {
              expect(route.config.pre[0].method).to.eql(pre)
              expect(route.config.pre[0].assign).to.eql('args')
            }
          })
        })
      })
      xdescribe('handling args', () => {
        xit('default no args', () => {})
        xit('one arg', () => {})
        xit('two args', () => {})
      })
      describe('child.call', () => {
        const call = (self, options, callback) => {
          expect(self.id).to.eql(mockRequest.server.app.ipfs.id)
          expect(options).to.eql({})
          callback(null, 'hello world')
        }

        it('calls .call', (done) => {
          const cliCmd = Object.assign({}, sampleCliWithChildren)
          cliCmd.children.forEach((cmd, index) => {
            if (cmd.name === 'put') {
              cliCmd.children[index].http = Object.assign({}, cmd, {
                call
              })
            }
          })

          newCmdWithMockReply(cliCmd, (httpRes) => {
            expect(httpRes).to.eql('hello world')
            done()
          })
        })
        it('calls .http.call', (done) => {
          const cliCmd = Object.assign({}, sampleCliWithChildren)
          cliCmd.children.put.call = call

          newCmdWithMockReply(cliCmd, (httpRes) => {
            expect(httpRes).to.eql('hello world')
            done()
          })
        })
        xit('streams output', () => {})
        xit('errors if no .call or .http.call', () => {})
      })
    })
    xdescribe('CLI API', () => {})
    xdescribe('Components API', () => {})
  })
  */
})
