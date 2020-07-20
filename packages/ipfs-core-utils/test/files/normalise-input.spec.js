'use strict'

/* eslint-env mocha */
const { expect } = require('../utils/chai')
const normalise = require('../../src/files/normalise-input')
const { Blob, File } = require('../../src/files/blob')
const TextEncoder = require('ipfs-utils/src/text-encoder')
const { supportsFileReader } = require('ipfs-utils/src/supports')
const { Buffer } = require('buffer')
const all = require('it-all')
const globalThis = require('ipfs-utils/src/globalthis')

const STRING = () => 'hello world'
const BUFFER = () => Buffer.from(STRING())
const ARRAY = () => Array.from(BUFFER())
const TYPEDARRAY = () => Uint8Array.from(ARRAY())
let BLOB
let WINDOW_READABLE_STREAM

if (supportsFileReader) {
  BLOB = () => new globalThis.Blob([
    STRING()
  ])

  WINDOW_READABLE_STREAM = () => new globalThis.ReadableStream({
    start (controller) {
      controller.enqueue(BUFFER())
      controller.close()
    }
  })
}

async function verifyNormalisation (input) {
  expect(input.length).to.equal(1)
  expect(input[0].content[Symbol.asyncIterator] || input[0].content[Symbol.iterator]).to.be.ok('Content should have been an iterable or an async iterable')
  expect(await all(input[0].content)).to.deep.equal([BUFFER()])
  expect(input[0].path).to.equal('')
}

async function testContent (input) {
  const result = await all(normalise(input))

  await verifyNormalisation(result)
}

function * iterableOf (...things) {
  yield * things
}

// eslint-disable-next-line require-await
async function * asyncIterableOf (...things) {
  yield * things
}

const encodeText = (text) => new TextEncoder().encode(text)

const readInput = async (input) => {
  const output = []
  for (const file of await all(normalise(input))) {
    const content = file.content && concatUint8Array(await all(file.content))
    output.push({ file, content })
  }
  return output
}

const concatUint8Array = (chunks) => {
  const bytes = []
  for (const chunk of chunks) {
    bytes.push(...chunk)
  }
  return new Uint8Array(bytes)
}

describe('normalise-input', function () {
  /**
   * @param {string} name
   * @param {*} input
   * @param {ExpectOutput[]} expected
   * @returns {void}
   *
   * @typedef {Object} ExpectOutput
   * @property {Function} instanceOf
   * @property {string} [path="/"]
   * @property {*} [mtime]
   * @property {*} [mode]
   * @property {Uint8Array[]} [content]
   */
  function testInput (name, input, expected) {
    it(name, async () => {
      const output = await readInput(input)
      expect(output.length).to.equal(expected.length, `normilaize to ${expected.length} files`)
      let index = 0
      for (const { file, content } of output) {
        const inn = expected[index]
        expect(file).to.be.an.instanceOf(inn.instanceOf)
        expect(file.type).to.be.equal(inn.type || '', 'has expected type')
        expect(file.path).to.be.equal(inn.path || '', 'has expected path')
        expect(file.mtime).to.be.deep.equal(inn.mtime, 'has expected mtime')
        expect(file.mode).to.be.deep.equal(inn.mode, 'has expected mode')

        expect(content).to.deep.equal(inn.content, 'has expected content')

        index += 1
      }
    })
  }

  function testInvalid (name, input, reason = /Unexpected/) {
    it(`${name} is invalid input`, () => {
      const result = readInput(input)
      expect(result).eventually.to.be.rejectedWith(reason)
    })
  }

  function testInputType (content, name, isBytes) {
    it(name, async function () {
      await testContent(content())
    })

    if (isBytes) {
      it(`Iterable<${name}>`, async function () {
        await testContent(iterableOf(content()))
      })

      it(`AsyncIterable<${name}>`, async function () {
        await testContent(asyncIterableOf(content()))
      })
    }

    it(`{ path: '', content: ${name} }`, async function () {
      await testContent({ path: '', content: content() })
    })

    if (isBytes) {
      it(`{ path: '', content: Iterable<${name}> }`, async function () {
        await testContent({ path: '', content: iterableOf(content()) })
      })

      it(`{ path: '', content: AsyncIterable<${name}> }`, async function () {
        await testContent({ path: '', content: asyncIterableOf(content()) })
      })
    }

    it(`Iterable<{ path: '', content: ${name} }`, async function () {
      await testContent(iterableOf({ path: '', content: content() }))
    })

    it(`AsyncIterable<{ path: '', content: ${name} }`, async function () {
      await testContent(asyncIterableOf({ path: '', content: content() }))
    })

    if (isBytes) {
      it(`Iterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`Iterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: asyncIterableOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: asyncIterableOf(content()) }))
      })
    }
  }

  describe('String', () => {
    testInputType(STRING, 'String', false)
  })

  describe('Buffer', () => {
    testInputType(BUFFER, 'Buffer', true)
  })

  describe('Blob', () => {
    if (!supportsFileReader) {
      return
    }

    testInputType(BLOB, 'Blob', false)
  })

  describe('window.ReadableStream', () => {
    if (!supportsFileReader) {
      return
    }

    testInputType(WINDOW_READABLE_STREAM, 'window.ReadableStream', false)
  })

  describe('Iterable<Number>', () => {
    testInputType(ARRAY, 'Iterable<Number>', false)
  })

  describe('TypedArray', () => {
    testInputType(TYPEDARRAY, 'TypedArray', true)
  })

  describe('keeps blobs when possible', () => {
    const lastModified = 1594672000418
    const mtime = new Date(lastModified)

    describe('string [single file]', () => {
      testInput('string -> [File]', 'hello', [
        {
          path: '',
          instanceOf: File,
          content: encodeText('hello')
        }
      ])

      testInput('string -> [File]', 'hello', [
        {
          path: '',
          instanceOf: File,
          content: encodeText('hello')
        }
      ])
    })

    describe('Bytes [single file]', () => {
      testInput('Buffer -> [File]', Buffer.from('from buffer'), [
        {
          path: '',
          instanceOf: File,
          content: encodeText('from buffer')
        }
      ])

      testInput('Uint8Array -> [File]', new Uint8Array([1, 2, 3, 4]), [
        {
          path: '',
          instanceOf: File,
          content: new Uint8Array([1, 2, 3, 4])
        }
      ])

      testInput('Uint32Array -> [File]', new Uint32Array([1, 2, 3]), [
        {
          path: '',
          instanceOf: File,
          content: new Uint8Array([1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0])
        }
      ])

      testInput('ArrayBuffer -> [File]', encodeText('ArrayBuffer').buffer, [
        {
          path: '',
          instanceOf: File,
          content: encodeText('ArrayBuffer')
        }
      ])
    })

    describe('Bloby [single file]', () => {
      testInput('Blob -> [File]', new Blob(['blob']), [
        {
          path: '',
          instanceOf: File,
          content: encodeText('blob')
        }
      ])

      testInput(
        'Blob(content, { type: "text/plain" }) -> [File]',
        new Blob(['blob'], { type: 'text/plain' }),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('blob'),
            type: 'text/plain'
          }
        ]
      )

      testInput(
        'File -> [File]',
        new File(['DOM file'], 'bla', { lastModified }),
        [
          {
            path: 'bla',
            instanceOf: File,
            content: encodeText('DOM file'),
            mtime
          }
        ]
      )

      testInput(
        'File(content, name, { type: "text/plain" }) -> [File]',
        new File(['DOM file'], 'file2', {
          type: 'text/plain',
          lastModified
        }),
        [
          {
            path: 'file2',
            instanceOf: File,
            content: encodeText('DOM file'),
            type: 'text/plain',
            mtime
          }
        ]
      )
    })

    describe('FileObject [single file]', () => {
      describe('no content is treated as an empty directory', () => {
        testInput('{path:"foo/bar"} -> [Directory]', { path: 'foo/bar' }, [
          {
            path: 'foo/bar',
            instanceOf: normalise.Directory,
            content: undefined
          }
        ])

        testInput(
          '{path:"foo/bar", mtime, mode} -> [Directory]',
          {
            path: 'foo/bar',
            mtime,
            mode: 420
          },
          [
            {
              path: 'foo/bar',
              instanceOf: normalise.Directory,
              mtime,
              mode: 420,
              content: undefined
            }
          ]
        )
      })

      describe('invalid FileObject', () => {
        testInvalid('{}', {})
        testInvalid(
          '{content:null}',
          {
            content: null
          },
          /Unexpected input/
        )
        testInvalid('{ name: "file" }', { name: 'file' })
        testInvalid('{ mtime, mode }', { mtime, mode: 420 })
      })

      describe('Bytes content', () => {
        testInput(
          '{content:Buffer} -> [File]',
          {
            content: Buffer.from('node buffer')
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('node buffer')
            }
          ]
        )

        testInput(
          '{content:Buffer, path} -> [File]',
          {
            content: Buffer.from('node buffer'),
            path: 'node/buffer'
          },
          [
            {
              path: 'node/buffer',
              instanceOf: File,
              content: encodeText('node buffer')
            }
          ]
        )

        testInput(
          '{content:Buffer, path, mode} -> [File]',
          {
            content: Buffer.from('node buffer'),
            path: 'node/buffer',
            mode: 420
          },
          [
            {
              path: 'node/buffer',
              instanceOf: File,
              mode: 420,
              content: encodeText('node buffer')
            }
          ]
        )

        testInput(
          '{content:Buffer, path, mode, mtime} -> [File]',
          {
            content: Buffer.from('node buffer'),
            path: 'node/buffer',
            mode: 420,
            mtime
          },
          [
            {
              path: 'node/buffer',
              instanceOf: File,
              mode: 420,
              mtime,
              content: encodeText('node buffer')
            }
          ]
        )

        testInput(
          '{content:ArrayBuffer} -> [File]',
          {
            content: encodeText('ArrayBuffer').buffer
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('ArrayBuffer')
            }
          ]
        )

        testInput(
          '{content:Uint8Array, path} -> [File]',
          {
            content: encodeText('Uint8Array').buffer,
            path: 'web/Uint8Array'
          },
          [
            {
              path: 'web/Uint8Array',
              instanceOf: File,
              content: encodeText('Uint8Array')
            }
          ]
        )
      })

      describe('Bloby content', () => {
        testInput(
          '{content:Blob, path} -> [File]',
          {
            content: new Blob(['blob']),
            path: 'web/blob'
          },
          [
            {
              path: 'web/blob',
              instanceOf: File,
              content: encodeText('blob')
            }
          ]
        )

        testInput(
          '{content:Blob, path} -> [File]',
          {
            content: new Blob(['blob'], { type: 'text/plain' }),
            path: 'web/blob'
          },
          [
            {
              path: 'web/blob',
              instanceOf: File,
              type: '',
              content: encodeText('blob')
            }
          ]
        )

        testInput(
          '{content:File} -> [File]',
          {
            content: new File(['file'], 'foo')
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('file')
            }
          ]
        )
      })

      describe('string content', () => {
        testInput(
          '{content:"text"} -> [File]',
          {
            content: 'text'
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('text')
            }
          ]
        )

        testInput(
          '{content:"text", path } -> [File]',
          {
            content: 'text',
            path: 'text-file',
            type: 'text/plain'
          },
          [
            {
              path: 'text-file',
              type: 'text/plain',
              instanceOf: File,
              content: encodeText('text')
            }
          ]
        )
      })

      describe('Iterable content', () => {
        testInput(
          '{content:[] -> [File]',
          {
            content: []
          },
          [
            {
              path: '',
              instanceOf: File,
              content: new Uint8Array([])
            }
          ]
        )

        testInvalid(
          '{content:["hello"]}',
          {
            content: ['hello']
          },
          /Unexpected FileObject content/
        )

        testInvalid('{content:[Uint8Array, string]}', {
          content: [encodeText('hello '), 'text']
        })

        testInput(
          '{content:[104, 101, 108, 108, 111 ] -> [File]',
          {
            content: [104, 101, 108, 108, 111]
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('hello')
            }
          ]
        )

        testInput(
          '{content:Uint8Array[]} -> [File]',
          {
            content: [encodeText('hello '), encodeText('world')]
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('hello world')
            }
          ]
        )

        testInvalid('{content:[Uint8Array, Blob]}', {
          content: [encodeText('hello '), new Blob(['test'])]
        })

        testInvalid('{content:[Uint8Array, File]}', {
          content: [encodeText('hello '), new File(['File'], 'file')]
        })

        testInvalid('{content:[Uint8Array, number]}', {
          content: [encodeText('hello '), 3]
        })

        testInput(
          '{content:Iterable<number>} -> [File]',
          {
            content: iterableOf(104, 101, 108, 108, 111)
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('hello')
            }
          ]
        )

        testInput(
          '{content: [0, "test"]} -> [File]',
          {
            content: [0, 'test']
          },
          [
            {
              path: '',
              instanceOf: File,
              content: new Uint8Array([0, 'test'])
            }
          ]
        )

        testInput(
          '{content:Iterable<Uint8Array>} -> [File]',
          {
            content: iterableOf(encodeText('hello '), encodeText('world!'))
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('hello world!')
            }
          ]
        )

        testInput(
          '{content:Iterable<ArrayBuffer|ArrayBufferView>} -> [File]',
          {
            content: iterableOf(
              encodeText('hello ').buffer,
              encodeText('world!')
            )
          },
          [
            {
              path: '',
              instanceOf: File,
              content: encodeText('hello world!')
            }
          ]
        )

        testInvalid('{content: Iterable<Blob>}', {
          content: iterableOf(new Blob(['hello']))
        })

        testInvalid('{content: Iterable<File>}', {
          content: iterableOf(new File(['hello'], ''))
        })
      })

      describe('AsyncIterable content', () => {
        testInvalid('{content: AsyncIterable<number>}', {
          content: asyncIterableOf(104, 101, 108, 108, 111)
        })

        testInvalid('{content: AsyncIterable<string>}', {
          content: asyncIterableOf('hello')
        })

        testInvalid('{content: AsyncIterable<Uint8Array|string>}', {
          content: asyncIterableOf(encodeText('hello'), 'test')
        })

        testInvalid('{content: AsyncIterable<Uint8Array|number>}', {
          content: asyncIterableOf(encodeText('hello'), 1)
        })

        testInvalid('{content: AsyncIterable<Uint8Array|Blob>}', {
          content: asyncIterableOf(encodeText('hello'), new Blob())
        })

        testInvalid('{content: AsyncIterable<Uint8Array|File>}', {
          content: asyncIterableOf(encodeText('hello'), new File([], ''))
        })

        testInvalid('{content: AsyncIterable<Uint8Array|Array<number>>}', {
          content: asyncIterableOf(encodeText('hello'), [1, 2])
        })

        testInput(
          '{content: AsyncIterable<Uint8Array>} -> [File]Stream',
          {
            content: asyncIterableOf(encodeText('hello'), encodeText(' world'))
          },
          [
            {
              path: '',
              instanceOf: normalise.FileStream,
              content: encodeText('hello world')
            }
          ]
        )

        testInput(
          '{content: AsyncIterable<ArrayBuffer|ArrayBufferView>} -> [File]Stream',
          {
            content: asyncIterableOf(
              encodeText('hello').buffer,
              encodeText(' world')
            )
          },
          [
            {
              path: '',
              instanceOf: normalise.FileStream,
              content: encodeText('hello world')
            }
          ]
        )
      })
    })

    describe('Iterable<number> [single file]', () => {
      testInput(
        '[] -> [File]',
        [],
        [
          {
            path: '',
            instanceOf: File,
            content: new Uint8Array([])
          }
        ]
      )

      testInput(
        'number[] -> [File]',
        {
          content: [104, 101, 108, 108, 111]
        },
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        'Iterable<number> -> [File]',
        {
          content: iterableOf(104, 101, 108, 108, 111)
        },
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[0, "test"] -> [File]',
        [0, 'test'],
        [
          {
            path: '',
            instanceOf: File,
            content: new Uint8Array([0, 'test'])
          }
        ]
      )

      testInput('Iterable<0|*> -> [File]', iterableOf(0, 'test'), [
        {
          path: '',
          instanceOf: File,
          content: new Uint8Array([0, 'test'])
        }
      ])
    })

    describe('Iterable<Bytes> [single file]', () => {
      testInput(
        '[Bytes] -> [File]',
        [encodeText('hello')],
        [{ path: '', instanceOf: File, content: encodeText('hello') }]
      )

      testInput(
        '[Bytes, Bytes] -> [File]',
        [encodeText('hello '), encodeText('text')],
        [{ path: '', instanceOf: File, content: encodeText('hello text') }]
      )

      testInvalid('[Bytes, string]', [encodeText('hello'), 'world'])

      testInvalid('[Uint8Array, Blob]', [
        encodeText('hello '),
        new Blob(['test'])
      ])

      testInvalid('[Uint8Array, File]', [
        encodeText('hello '),
        new File(['File'], 'file')
      ])

      testInvalid('[Uint8Array, number]', [encodeText('hello '), 3])

      testInput(
        'Iterable<ArrayBuffer|ArrayBufferView> -> [File]',
        iterableOf(encodeText('hello ').buffer, encodeText('world!')),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello world!')
          }
        ]
      )
    })

    describe('Iterable<string> [multiple files]', () => {
      testInput(
        '["hello"] -> [File]',
        ['hello'],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '["hello", "world"] -> [File, File]',
        ['hello', 'world'],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInvalid(
        '[string, null]',
        ['hello', null]
      )

      testInvalid(
        '[string, number[]]',
        ['hello', [1, 2, 3]]
      )
    })

    describe('Iterable<Bloby> [multiple files]', () => {
      testInput(
        '[Blob] -> [File]',
        iterableOf(new Blob(['hello'])),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[File] -> [File]',
        iterableOf(new File(['hello'], 'foo', { lastModified })),
        [
          {
            path: 'foo',
            instanceOf: File,
            mtime,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[Blob, File] -> [File, File]',
        iterableOf(new Blob(['hello']), new File(['world'], 'w', { lastModified })),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: 'w',
            mtime,
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInvalid(
        '[Blob, null]',
        iterableOf(new Blob(['hello']), null)
      )

      testInvalid(
        '[string, number[]]',
        iterableOf(new Blob(['hello']), [1, 2, 3])
      )
    })

    describe('Iterable<FileObject> [multiple files]', () => {
      testInput(
        '[{ content: string }] -> [File]',
        iterableOf({ content: 'hello' }),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[{path:string}, {content:string}] -> [Directory, File]',
        iterableOf({ path: 'dir' }, { content: 'hello' }),
        [
          {
            path: 'dir',
            instanceOf: normalise.Directory
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[{path, content:Blob, mtime}, {path, mtime}] -> [File, Directory]',
        iterableOf(
          {
            content: new Blob(['file']),
            type: 'text/plain',
            path: 'file',
            mtime
          },
          {
            path: 'dir',
            mtime
          }
        ),
        [
          {
            path: 'file',
            instanceOf: File,
            mtime,
            type: 'text/plain',
            content: encodeText('file')
          },
          {
            path: 'dir',
            instanceOf: normalise.Directory,
            mtime
          }
        ]
      )

      testInvalid(
        '[{content:string}, {content:null}]',
        iterableOf({ content: 'hello' }, { content: null })
      )

      testInvalid(
        '[{content:string}, number[]]',
        iterableOf({ content: 'hello' }, [1, 2, 3])
      )

      testInvalid('[{content: Iterable<File>}]',
        iterableOf({
          content: iterableOf(new File(['hello'], ''))
        })
      )
    })

    describe('Iterable<Bloby|string|FileObject> [multiple files]', () => {
      testInput(
        '["hello", "world"] -> [File, File]',
        ['hello', 'world'],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, Bytes] -> [File, File]',
        ['hello', encodeText('world')],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, Blob] -> [File, File]',
        ['hello', new Blob(['world'])],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, File] -> [File, File]',
        ['hello', new File(['world'], 'w', { lastModified })],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: 'w',
            instanceOf: File,
            mtime,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, {path:"foo"}] -> [File, Directory]',
        ['hello', { path: 'foo' }],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: 'foo',
            instanceOf: normalise.Directory
          }
        ]
      )

      testInput(
        '[string, {content:"bar"}] -> [File, File]',
        ['hello', { content: 'bar' }],
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bar')
          }
        ]
      )

      testInput(
        '[string, Bytes] -> [File, File]',
        iterableOf('hello', encodeText('bar')),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bar')
          }
        ]
      )

      testInput(
        '[string, FileObject, Bytes] -> [File, FileStream, File]',
        iterableOf(
          'hello',
          { content: asyncIterableOf() },
          encodeText('bar')
        ),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: new Uint8Array([])
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bar')
          }
        ]
      )

      testInput(
        '[FileObject, File] -> [FileStream, File]',
        iterableOf(
          { content: asyncIterableOf(encodeText('world'), encodeText('!')) },
          new File(['file'], 'file', { lastModified })
        ),
        [
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('world!')
          },
          {
            path: 'file',
            instanceOf: File,
            mtime,
            content: encodeText('file')
          }
        ]
      )

      testInput(
        '[FileObject, FileObject] -> [FileStream, FileStream]',
        iterableOf(
          { content: asyncIterableOf(encodeText('hello'), encodeText(' ')) },
          { content: asyncIterableOf(encodeText('world'), encodeText('!')) }
        ),
        [
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('hello ')
          },
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('world!')
          }
        ]
      )

      testInput(
        '[FileObject, FileObject, FileObject, string] -> [File, Directory, FileStream, File]',
        iterableOf(
          { content: iterableOf(encodeText('hello'), encodeText(' ')), path: 'bla' },
          { path: 'foo' },
          { content: asyncIterableOf(encodeText('world'), encodeText('!')) },
          'bzz'
        ),
        [
          {
            path: 'bla',
            instanceOf: File,
            content: encodeText('hello ')
          },
          {
            path: 'foo',
            instanceOf: normalise.Directory
          },
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('world!')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bzz')
          }
        ]
      )
    })

    describe('AsyncIterable<Bytes> [single file]', () => {
      testInput(
        '[Bytes] -> [File]',
        asyncIterableOf(encodeText('hello')),
        [
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[Bytes, Bytes] -> [File]',
        asyncIterableOf(encodeText('hello '), encodeText('text')),
        [
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('hello text')
          }
        ]
      )

      testInvalid('[Bytes, string]', asyncIterableOf(encodeText('hello'), 'world'))

      testInvalid('[Uint8Array, Blob]', asyncIterableOf(
        encodeText('hello '),
        new Blob(['test'])
      ))

      testInvalid('[Uint8Array, File]', asyncIterableOf(
        encodeText('hello '),
        new File(['File'], 'file')
      ))

      testInvalid('[Uint8Array, number]', asyncIterableOf(encodeText('hello '), 3))

      testInput(
        'AsyncIterable<ArrayBuffer|ArrayBufferView> -> [File]',
        asyncIterableOf(encodeText('hello ').buffer, encodeText('world!')),
        [
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('hello world!')
          }
        ]
      )
    })

    describe('AsyncIterable<Bloby> [multiple files]', () => {
      testInput(
        '[Blob] -> [File]',
        asyncIterableOf(new Blob(['hello'])),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[File] -> [File]',
        asyncIterableOf(new File(['hello'], 'foo', { lastModified })),
        [
          {
            path: 'foo',
            instanceOf: File,
            mtime,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[Blob, File] -> [File, File]',
        asyncIterableOf(
          new Blob(['hello']),
          new File(['world'], 'w', { lastModified })
        ),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: 'w',
            mtime,
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInvalid(
        '[Blob, null]',
        asyncIterableOf(new Blob(['hello']), null)
      )

      testInvalid(
        '[string, number[]]',
        asyncIterableOf(new Blob(['hello']), [1, 2, 3])
      )
    })

    describe('AsyncIterable<string> [multiple files]', () => {
      testInput(
        '["hello"] -> [File]',
        asyncIterableOf('hello'),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '["hello", "world"] -> [File, File]',
        asyncIterableOf('hello', 'world'),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInvalid(
        '[string, null]',
        asyncIterableOf('hello', null)
      )

      testInvalid(
        '[string, number[]]',
        asyncIterableOf('hello', [1, 2, 3])
      )
    })

    describe('AsyncIterable<FileObject> [multiple files]', () => {
      testInput(
        '[{ content: string }] -> [File]',
        asyncIterableOf({ content: 'hello' }),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[{path:string}, {content:string}] -> [Directory, File]',
        asyncIterableOf({ path: 'dir' }, { content: 'hello' }),
        [
          {
            path: 'dir',
            instanceOf: normalise.Directory
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          }
        ]
      )

      testInput(
        '[{path, content:Blob, mtime}, {path, mtime}] -> [File, Directory]',
        asyncIterableOf(
          {
            content: new Blob(['file']),
            type: 'text/plain',
            path: 'file',
            mtime
          },
          {
            path: 'dir',
            mtime
          }
        ),
        [
          {
            path: 'file',
            instanceOf: File,
            mtime,
            type: 'text/plain',
            content: encodeText('file')
          },
          {
            path: 'dir',
            instanceOf: normalise.Directory,
            mtime
          }
        ]
      )

      testInvalid(
        '[{content:string}, {content:null}]',
        asyncIterableOf({ content: 'hello' }, { content: null })
      )

      testInvalid(
        '[{content:string}, number[]]',
        asyncIterableOf({ content: 'hello' }, [1, 2, 3])
      )

      testInvalid('[{content: Iterable<File>}]',
        asyncIterableOf({
          content: iterableOf(new File(['hello'], ''))
        })
      )
    })

    describe('AsyncIterable<Bloby|string|FileObject> [multiple files]', () => {
      testInput(
        '["hello", "world"] -> [File, File]',
        asyncIterableOf('hello', 'world'),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, Bytes] -> [File, File]',
        asyncIterableOf('hello', encodeText('world')),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, Blob] -> [File, File]',
        asyncIterableOf('hello', new Blob(['world'])),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, File] -> [File, File]',
        asyncIterableOf('hello', new File(['world'], 'w', { lastModified })),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: 'w',
            instanceOf: File,
            mtime,
            content: encodeText('world')
          }
        ]
      )

      testInput(
        '[string, {path:"foo"}] -> [File, Directory]',
        asyncIterableOf('hello', { path: 'foo' }),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: 'foo',
            instanceOf: normalise.Directory
          }
        ]
      )

      testInput(
        '[string, {content:"bar"}] -> [File, File]',
        asyncIterableOf('hello', { content: 'bar' }),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bar')
          }
        ]
      )

      testInput(
        '[string, Bytes] -> [File, File]',
        asyncIterableOf('hello', encodeText('bar')),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bar')
          }
        ]
      )

      testInput(
        '[string, FileObject, Bytes] -> [File, FileStream, File]',
        asyncIterableOf(
          'hello',
          { content: asyncIterableOf() },
          encodeText('bar')
        ),
        [
          {
            path: '',
            instanceOf: File,
            content: encodeText('hello')
          },
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: new Uint8Array([])
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bar')
          }
        ]
      )

      testInput(
        '[FileObject, File] -> [FileStream, File]',
        asyncIterableOf(
          { content: asyncIterableOf(encodeText('world'), encodeText('!')) },
          new File(['file'], 'file', { lastModified })
        ),
        [
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('world!')
          },
          {
            path: 'file',
            instanceOf: File,
            mtime,
            content: encodeText('file')
          }
        ]
      )

      testInput(
        '[FileObject, FileObject] -> [FileStream, FileStream]',
        asyncIterableOf(
          { content: asyncIterableOf(encodeText('hello'), encodeText(' ')) },
          { content: asyncIterableOf(encodeText('world'), encodeText('!')) }
        ),
        [
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('hello ')
          },
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('world!')
          }
        ]
      )

      testInput(
        '[FileObject, FileObject, FileObject, string] -> [File, Directory, FileStream, File]',
        asyncIterableOf(
          { content: iterableOf(encodeText('hello'), encodeText(' ')), path: 'bla' },
          { path: 'foo' },
          { content: asyncIterableOf(encodeText('world'), encodeText('!')) },
          'bzz'
        ),
        [
          {
            path: 'bla',
            instanceOf: File,
            content: encodeText('hello ')
          },
          {
            path: 'foo',
            instanceOf: normalise.Directory
          },
          {
            path: '',
            instanceOf: normalise.FileStream,
            content: encodeText('world!')
          },
          {
            path: '',
            instanceOf: File,
            content: encodeText('bzz')
          }
        ]
      )
    })
  })
})
