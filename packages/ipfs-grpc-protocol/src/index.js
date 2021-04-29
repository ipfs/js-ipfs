/*eslint-disable*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["ipfs-grpc-protocol"] || ($protobuf.roots["ipfs-grpc-protocol"] = {});

$root.ipfs = (function() {

    /**
     * Namespace ipfs.
     * @exports ipfs
     * @namespace
     */
    var ipfs = {};

    /**
     * FileType enum.
     * @name ipfs.FileType
     * @enum {number}
     * @property {number} DIRECTORY=0 DIRECTORY value
     * @property {number} FILE=1 FILE value
     */
    ipfs.FileType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "DIRECTORY"] = 0;
        values[valuesById[1] = "FILE"] = 1;
        return values;
    })();

    ipfs.MFS = (function() {

        /**
         * Constructs a new MFS service.
         * @memberof ipfs
         * @classdesc Represents a MFS
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function MFS(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (MFS.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = MFS;

        /**
         * Callback as used by {@link ipfs.MFS#ls}.
         * @memberof ipfs.MFS
         * @typedef lsCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {ipfs.LsResponse} [response] LsResponse
         */

        /**
         * Calls ls.
         * @function ls
         * @memberof ipfs.MFS
         * @instance
         * @param {ipfs.ILsRequest} request LsRequest message or plain object
         * @param {ipfs.MFS.lsCallback} callback Node-style callback called with the error, if any, and LsResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(MFS.prototype.ls = function ls(request, callback) {
            return this.rpcCall(ls, $root.ipfs.LsRequest, $root.ipfs.LsResponse, request, callback);
        }, "name", { value: "ls" });

        /**
         * Calls ls.
         * @function ls
         * @memberof ipfs.MFS
         * @instance
         * @param {ipfs.ILsRequest} request LsRequest message or plain object
         * @returns {Promise<ipfs.LsResponse>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link ipfs.MFS#write}.
         * @memberof ipfs.MFS
         * @typedef writeCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {ipfs.WriteResponse} [response] WriteResponse
         */

        /**
         * Calls write.
         * @function write
         * @memberof ipfs.MFS
         * @instance
         * @param {ipfs.IWriteRequest} request WriteRequest message or plain object
         * @param {ipfs.MFS.writeCallback} callback Node-style callback called with the error, if any, and WriteResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(MFS.prototype.write = function write(request, callback) {
            return this.rpcCall(write, $root.ipfs.WriteRequest, $root.ipfs.WriteResponse, request, callback);
        }, "name", { value: "write" });

        /**
         * Calls write.
         * @function write
         * @memberof ipfs.MFS
         * @instance
         * @param {ipfs.IWriteRequest} request WriteRequest message or plain object
         * @returns {Promise<ipfs.WriteResponse>} Promise
         * @variation 2
         */

        return MFS;
    })();

    ipfs.LsRequest = (function() {

        /**
         * Properties of a LsRequest.
         * @memberof ipfs
         * @interface ILsRequest
         * @property {string|null} [path] LsRequest path
         */

        /**
         * Constructs a new LsRequest.
         * @memberof ipfs
         * @classdesc Represents a LsRequest.
         * @implements ILsRequest
         * @constructor
         * @param {ipfs.ILsRequest=} [p] Properties to set
         */
        function LsRequest(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * LsRequest path.
         * @member {string} path
         * @memberof ipfs.LsRequest
         * @instance
         */
        LsRequest.prototype.path = "";

        /**
         * Encodes the specified LsRequest message. Does not implicitly {@link ipfs.LsRequest.verify|verify} messages.
         * @function encode
         * @memberof ipfs.LsRequest
         * @static
         * @param {ipfs.ILsRequest} m LsRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsRequest.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.path != null && Object.hasOwnProperty.call(m, "path"))
                w.uint32(10).string(m.path);
            return w;
        };

        /**
         * Decodes a LsRequest message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.LsRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.LsRequest} LsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.LsRequest();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.path = r.string();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates a LsRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.LsRequest
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.LsRequest} LsRequest
         */
        LsRequest.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.LsRequest)
                return d;
            var m = new $root.ipfs.LsRequest();
            if (d.path != null) {
                m.path = String(d.path);
            }
            return m;
        };

        /**
         * Creates a plain object from a LsRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.LsRequest
         * @static
         * @param {ipfs.LsRequest} m LsRequest
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LsRequest.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.defaults) {
                d.path = "";
            }
            if (m.path != null && m.hasOwnProperty("path")) {
                d.path = m.path;
            }
            return d;
        };

        /**
         * Converts this LsRequest to JSON.
         * @function toJSON
         * @memberof ipfs.LsRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return LsRequest;
    })();

    ipfs.LsResponse = (function() {

        /**
         * Properties of a LsResponse.
         * @memberof ipfs
         * @interface ILsResponse
         * @property {string|null} [name] LsResponse name
         * @property {ipfs.FileType|null} [type] LsResponse type
         * @property {number|null} [size] LsResponse size
         * @property {string|null} [cid] LsResponse cid
         * @property {number|null} [mode] LsResponse mode
         * @property {number|null} [mtime] LsResponse mtime
         * @property {number|null} [mtimeNsecs] LsResponse mtimeNsecs
         */

        /**
         * Constructs a new LsResponse.
         * @memberof ipfs
         * @classdesc Represents a LsResponse.
         * @implements ILsResponse
         * @constructor
         * @param {ipfs.ILsResponse=} [p] Properties to set
         */
        function LsResponse(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * LsResponse name.
         * @member {string} name
         * @memberof ipfs.LsResponse
         * @instance
         */
        LsResponse.prototype.name = "";

        /**
         * LsResponse type.
         * @member {ipfs.FileType} type
         * @memberof ipfs.LsResponse
         * @instance
         */
        LsResponse.prototype.type = 0;

        /**
         * LsResponse size.
         * @member {number} size
         * @memberof ipfs.LsResponse
         * @instance
         */
        LsResponse.prototype.size = 0;

        /**
         * LsResponse cid.
         * @member {string} cid
         * @memberof ipfs.LsResponse
         * @instance
         */
        LsResponse.prototype.cid = "";

        /**
         * LsResponse mode.
         * @member {number} mode
         * @memberof ipfs.LsResponse
         * @instance
         */
        LsResponse.prototype.mode = 0;

        /**
         * LsResponse mtime.
         * @member {number} mtime
         * @memberof ipfs.LsResponse
         * @instance
         */
        LsResponse.prototype.mtime = 0;

        /**
         * LsResponse mtimeNsecs.
         * @member {number} mtimeNsecs
         * @memberof ipfs.LsResponse
         * @instance
         */
        LsResponse.prototype.mtimeNsecs = 0;

        /**
         * Encodes the specified LsResponse message. Does not implicitly {@link ipfs.LsResponse.verify|verify} messages.
         * @function encode
         * @memberof ipfs.LsResponse
         * @static
         * @param {ipfs.ILsResponse} m LsResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsResponse.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.name != null && Object.hasOwnProperty.call(m, "name"))
                w.uint32(10).string(m.name);
            if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                w.uint32(16).int32(m.type);
            if (m.size != null && Object.hasOwnProperty.call(m, "size"))
                w.uint32(24).uint32(m.size);
            if (m.cid != null && Object.hasOwnProperty.call(m, "cid"))
                w.uint32(34).string(m.cid);
            if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                w.uint32(40).uint32(m.mode);
            if (m.mtime != null && Object.hasOwnProperty.call(m, "mtime"))
                w.uint32(48).int32(m.mtime);
            if (m.mtimeNsecs != null && Object.hasOwnProperty.call(m, "mtimeNsecs"))
                w.uint32(56).uint32(m.mtimeNsecs);
            return w;
        };

        /**
         * Decodes a LsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.LsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.LsResponse} LsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.LsResponse();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.name = r.string();
                    break;
                case 2:
                    m.type = r.int32();
                    break;
                case 3:
                    m.size = r.uint32();
                    break;
                case 4:
                    m.cid = r.string();
                    break;
                case 5:
                    m.mode = r.uint32();
                    break;
                case 6:
                    m.mtime = r.int32();
                    break;
                case 7:
                    m.mtimeNsecs = r.uint32();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates a LsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.LsResponse
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.LsResponse} LsResponse
         */
        LsResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.LsResponse)
                return d;
            var m = new $root.ipfs.LsResponse();
            if (d.name != null) {
                m.name = String(d.name);
            }
            switch (d.type) {
            case "DIRECTORY":
            case 0:
                m.type = 0;
                break;
            case "FILE":
            case 1:
                m.type = 1;
                break;
            }
            if (d.size != null) {
                m.size = d.size >>> 0;
            }
            if (d.cid != null) {
                m.cid = String(d.cid);
            }
            if (d.mode != null) {
                m.mode = d.mode >>> 0;
            }
            if (d.mtime != null) {
                m.mtime = d.mtime | 0;
            }
            if (d.mtimeNsecs != null) {
                m.mtimeNsecs = d.mtimeNsecs >>> 0;
            }
            return m;
        };

        /**
         * Creates a plain object from a LsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.LsResponse
         * @static
         * @param {ipfs.LsResponse} m LsResponse
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LsResponse.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.defaults) {
                d.name = "";
                d.type = o.enums === String ? "DIRECTORY" : 0;
                d.size = 0;
                d.cid = "";
                d.mode = 0;
                d.mtime = 0;
                d.mtimeNsecs = 0;
            }
            if (m.name != null && m.hasOwnProperty("name")) {
                d.name = m.name;
            }
            if (m.type != null && m.hasOwnProperty("type")) {
                d.type = o.enums === String ? $root.ipfs.FileType[m.type] : m.type;
            }
            if (m.size != null && m.hasOwnProperty("size")) {
                d.size = m.size;
            }
            if (m.cid != null && m.hasOwnProperty("cid")) {
                d.cid = m.cid;
            }
            if (m.mode != null && m.hasOwnProperty("mode")) {
                d.mode = m.mode;
            }
            if (m.mtime != null && m.hasOwnProperty("mtime")) {
                d.mtime = m.mtime;
            }
            if (m.mtimeNsecs != null && m.hasOwnProperty("mtimeNsecs")) {
                d.mtimeNsecs = m.mtimeNsecs;
            }
            return d;
        };

        /**
         * Converts this LsResponse to JSON.
         * @function toJSON
         * @memberof ipfs.LsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return LsResponse;
    })();

    ipfs.WriteRequest = (function() {

        /**
         * Properties of a WriteRequest.
         * @memberof ipfs
         * @interface IWriteRequest
         * @property {string|null} [path] WriteRequest path
         * @property {Uint8Array|null} [content] WriteRequest content
         */

        /**
         * Constructs a new WriteRequest.
         * @memberof ipfs
         * @classdesc Represents a WriteRequest.
         * @implements IWriteRequest
         * @constructor
         * @param {ipfs.IWriteRequest=} [p] Properties to set
         */
        function WriteRequest(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * WriteRequest path.
         * @member {string} path
         * @memberof ipfs.WriteRequest
         * @instance
         */
        WriteRequest.prototype.path = "";

        /**
         * WriteRequest content.
         * @member {Uint8Array} content
         * @memberof ipfs.WriteRequest
         * @instance
         */
        WriteRequest.prototype.content = $util.newBuffer([]);

        /**
         * Encodes the specified WriteRequest message. Does not implicitly {@link ipfs.WriteRequest.verify|verify} messages.
         * @function encode
         * @memberof ipfs.WriteRequest
         * @static
         * @param {ipfs.IWriteRequest} m WriteRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WriteRequest.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.path != null && Object.hasOwnProperty.call(m, "path"))
                w.uint32(10).string(m.path);
            if (m.content != null && Object.hasOwnProperty.call(m, "content"))
                w.uint32(18).bytes(m.content);
            return w;
        };

        /**
         * Decodes a WriteRequest message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.WriteRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.WriteRequest} WriteRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WriteRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.WriteRequest();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.path = r.string();
                    break;
                case 2:
                    m.content = r.bytes();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates a WriteRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.WriteRequest
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.WriteRequest} WriteRequest
         */
        WriteRequest.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.WriteRequest)
                return d;
            var m = new $root.ipfs.WriteRequest();
            if (d.path != null) {
                m.path = String(d.path);
            }
            if (d.content != null) {
                if (typeof d.content === "string")
                    $util.base64.decode(d.content, m.content = $util.newBuffer($util.base64.length(d.content)), 0);
                else if (d.content.length)
                    m.content = d.content;
            }
            return m;
        };

        /**
         * Creates a plain object from a WriteRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.WriteRequest
         * @static
         * @param {ipfs.WriteRequest} m WriteRequest
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WriteRequest.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.defaults) {
                d.path = "";
                if (o.bytes === String)
                    d.content = "";
                else {
                    d.content = [];
                    if (o.bytes !== Array)
                        d.content = $util.newBuffer(d.content);
                }
            }
            if (m.path != null && m.hasOwnProperty("path")) {
                d.path = m.path;
            }
            if (m.content != null && m.hasOwnProperty("content")) {
                d.content = o.bytes === String ? $util.base64.encode(m.content, 0, m.content.length) : o.bytes === Array ? Array.prototype.slice.call(m.content) : m.content;
            }
            return d;
        };

        /**
         * Converts this WriteRequest to JSON.
         * @function toJSON
         * @memberof ipfs.WriteRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WriteRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return WriteRequest;
    })();

    ipfs.WriteResponse = (function() {

        /**
         * Properties of a WriteResponse.
         * @memberof ipfs
         * @interface IWriteResponse
         */

        /**
         * Constructs a new WriteResponse.
         * @memberof ipfs
         * @classdesc Represents a WriteResponse.
         * @implements IWriteResponse
         * @constructor
         * @param {ipfs.IWriteResponse=} [p] Properties to set
         */
        function WriteResponse(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * Encodes the specified WriteResponse message. Does not implicitly {@link ipfs.WriteResponse.verify|verify} messages.
         * @function encode
         * @memberof ipfs.WriteResponse
         * @static
         * @param {ipfs.IWriteResponse} m WriteResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WriteResponse.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            return w;
        };

        /**
         * Decodes a WriteResponse message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.WriteResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.WriteResponse} WriteResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WriteResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.WriteResponse();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates a WriteResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.WriteResponse
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.WriteResponse} WriteResponse
         */
        WriteResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.WriteResponse)
                return d;
            return new $root.ipfs.WriteResponse();
        };

        /**
         * Creates a plain object from a WriteResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.WriteResponse
         * @static
         * @param {ipfs.WriteResponse} m WriteResponse
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WriteResponse.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this WriteResponse to JSON.
         * @function toJSON
         * @memberof ipfs.WriteResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WriteResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return WriteResponse;
    })();

    ipfs.Root = (function() {

        /**
         * Constructs a new Root service.
         * @memberof ipfs
         * @classdesc Represents a Root
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function Root(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (Root.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Root;

        /**
         * Callback as used by {@link ipfs.Root#id}.
         * @memberof ipfs.Root
         * @typedef idCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {ipfs.IdResponse} [response] IdResponse
         */

        /**
         * Calls id.
         * @function id
         * @memberof ipfs.Root
         * @instance
         * @param {ipfs.IIdRequest} request IdRequest message or plain object
         * @param {ipfs.Root.idCallback} callback Node-style callback called with the error, if any, and IdResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(Root.prototype.id = function id(request, callback) {
            return this.rpcCall(id, $root.ipfs.IdRequest, $root.ipfs.IdResponse, request, callback);
        }, "name", { value: "id" });

        /**
         * Calls id.
         * @function id
         * @memberof ipfs.Root
         * @instance
         * @param {ipfs.IIdRequest} request IdRequest message or plain object
         * @returns {Promise<ipfs.IdResponse>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link ipfs.Root#add}.
         * @memberof ipfs.Root
         * @typedef addCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {ipfs.AddResponse} [response] AddResponse
         */

        /**
         * Calls add.
         * @function add
         * @memberof ipfs.Root
         * @instance
         * @param {ipfs.IAddRequest} request AddRequest message or plain object
         * @param {ipfs.Root.addCallback} callback Node-style callback called with the error, if any, and AddResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(Root.prototype.add = function add(request, callback) {
            return this.rpcCall(add, $root.ipfs.AddRequest, $root.ipfs.AddResponse, request, callback);
        }, "name", { value: "add" });

        /**
         * Calls add.
         * @function add
         * @memberof ipfs.Root
         * @instance
         * @param {ipfs.IAddRequest} request AddRequest message or plain object
         * @returns {Promise<ipfs.AddResponse>} Promise
         * @variation 2
         */

        return Root;
    })();

    /**
     * AddResponseType enum.
     * @name ipfs.AddResponseType
     * @enum {number}
     * @property {number} PROGRESS=0 PROGRESS value
     * @property {number} RESULT=1 RESULT value
     */
    ipfs.AddResponseType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "PROGRESS"] = 0;
        values[valuesById[1] = "RESULT"] = 1;
        return values;
    })();

    ipfs.IdRequest = (function() {

        /**
         * Properties of an IdRequest.
         * @memberof ipfs
         * @interface IIdRequest
         * @property {string|null} [peerId] IdRequest peerId
         */

        /**
         * Constructs a new IdRequest.
         * @memberof ipfs
         * @classdesc Represents an IdRequest.
         * @implements IIdRequest
         * @constructor
         * @param {ipfs.IIdRequest=} [p] Properties to set
         */
        function IdRequest(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * IdRequest peerId.
         * @member {string} peerId
         * @memberof ipfs.IdRequest
         * @instance
         */
        IdRequest.prototype.peerId = "";

        /**
         * Encodes the specified IdRequest message. Does not implicitly {@link ipfs.IdRequest.verify|verify} messages.
         * @function encode
         * @memberof ipfs.IdRequest
         * @static
         * @param {ipfs.IIdRequest} m IdRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IdRequest.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.peerId != null && Object.hasOwnProperty.call(m, "peerId"))
                w.uint32(10).string(m.peerId);
            return w;
        };

        /**
         * Decodes an IdRequest message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.IdRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.IdRequest} IdRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IdRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.IdRequest();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.peerId = r.string();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates an IdRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.IdRequest
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.IdRequest} IdRequest
         */
        IdRequest.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.IdRequest)
                return d;
            var m = new $root.ipfs.IdRequest();
            if (d.peerId != null) {
                m.peerId = String(d.peerId);
            }
            return m;
        };

        /**
         * Creates a plain object from an IdRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.IdRequest
         * @static
         * @param {ipfs.IdRequest} m IdRequest
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        IdRequest.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.defaults) {
                d.peerId = "";
            }
            if (m.peerId != null && m.hasOwnProperty("peerId")) {
                d.peerId = m.peerId;
            }
            return d;
        };

        /**
         * Converts this IdRequest to JSON.
         * @function toJSON
         * @memberof ipfs.IdRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        IdRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return IdRequest;
    })();

    ipfs.IdResponse = (function() {

        /**
         * Properties of an IdResponse.
         * @memberof ipfs
         * @interface IIdResponse
         * @property {string|null} [id] IdResponse id
         * @property {string|null} [publicKey] IdResponse publicKey
         * @property {Array.<string>|null} [addresses] IdResponse addresses
         * @property {string|null} [agentVersion] IdResponse agentVersion
         * @property {string|null} [protocolVersion] IdResponse protocolVersion
         * @property {Array.<string>|null} [protocols] IdResponse protocols
         */

        /**
         * Constructs a new IdResponse.
         * @memberof ipfs
         * @classdesc Represents an IdResponse.
         * @implements IIdResponse
         * @constructor
         * @param {ipfs.IIdResponse=} [p] Properties to set
         */
        function IdResponse(p) {
            this.addresses = [];
            this.protocols = [];
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * IdResponse id.
         * @member {string} id
         * @memberof ipfs.IdResponse
         * @instance
         */
        IdResponse.prototype.id = "";

        /**
         * IdResponse publicKey.
         * @member {string} publicKey
         * @memberof ipfs.IdResponse
         * @instance
         */
        IdResponse.prototype.publicKey = "";

        /**
         * IdResponse addresses.
         * @member {Array.<string>} addresses
         * @memberof ipfs.IdResponse
         * @instance
         */
        IdResponse.prototype.addresses = $util.emptyArray;

        /**
         * IdResponse agentVersion.
         * @member {string} agentVersion
         * @memberof ipfs.IdResponse
         * @instance
         */
        IdResponse.prototype.agentVersion = "";

        /**
         * IdResponse protocolVersion.
         * @member {string} protocolVersion
         * @memberof ipfs.IdResponse
         * @instance
         */
        IdResponse.prototype.protocolVersion = "";

        /**
         * IdResponse protocols.
         * @member {Array.<string>} protocols
         * @memberof ipfs.IdResponse
         * @instance
         */
        IdResponse.prototype.protocols = $util.emptyArray;

        /**
         * Encodes the specified IdResponse message. Does not implicitly {@link ipfs.IdResponse.verify|verify} messages.
         * @function encode
         * @memberof ipfs.IdResponse
         * @static
         * @param {ipfs.IIdResponse} m IdResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        IdResponse.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.id != null && Object.hasOwnProperty.call(m, "id"))
                w.uint32(10).string(m.id);
            if (m.publicKey != null && Object.hasOwnProperty.call(m, "publicKey"))
                w.uint32(18).string(m.publicKey);
            if (m.addresses != null && m.addresses.length) {
                for (var i = 0; i < m.addresses.length; ++i)
                    w.uint32(26).string(m.addresses[i]);
            }
            if (m.agentVersion != null && Object.hasOwnProperty.call(m, "agentVersion"))
                w.uint32(34).string(m.agentVersion);
            if (m.protocolVersion != null && Object.hasOwnProperty.call(m, "protocolVersion"))
                w.uint32(42).string(m.protocolVersion);
            if (m.protocols != null && m.protocols.length) {
                for (var i = 0; i < m.protocols.length; ++i)
                    w.uint32(50).string(m.protocols[i]);
            }
            return w;
        };

        /**
         * Decodes an IdResponse message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.IdResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.IdResponse} IdResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        IdResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.IdResponse();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.id = r.string();
                    break;
                case 2:
                    m.publicKey = r.string();
                    break;
                case 3:
                    if (!(m.addresses && m.addresses.length))
                        m.addresses = [];
                    m.addresses.push(r.string());
                    break;
                case 4:
                    m.agentVersion = r.string();
                    break;
                case 5:
                    m.protocolVersion = r.string();
                    break;
                case 6:
                    if (!(m.protocols && m.protocols.length))
                        m.protocols = [];
                    m.protocols.push(r.string());
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates an IdResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.IdResponse
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.IdResponse} IdResponse
         */
        IdResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.IdResponse)
                return d;
            var m = new $root.ipfs.IdResponse();
            if (d.id != null) {
                m.id = String(d.id);
            }
            if (d.publicKey != null) {
                m.publicKey = String(d.publicKey);
            }
            if (d.addresses) {
                if (!Array.isArray(d.addresses))
                    throw TypeError(".ipfs.IdResponse.addresses: array expected");
                m.addresses = [];
                for (var i = 0; i < d.addresses.length; ++i) {
                    m.addresses[i] = String(d.addresses[i]);
                }
            }
            if (d.agentVersion != null) {
                m.agentVersion = String(d.agentVersion);
            }
            if (d.protocolVersion != null) {
                m.protocolVersion = String(d.protocolVersion);
            }
            if (d.protocols) {
                if (!Array.isArray(d.protocols))
                    throw TypeError(".ipfs.IdResponse.protocols: array expected");
                m.protocols = [];
                for (var i = 0; i < d.protocols.length; ++i) {
                    m.protocols[i] = String(d.protocols[i]);
                }
            }
            return m;
        };

        /**
         * Creates a plain object from an IdResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.IdResponse
         * @static
         * @param {ipfs.IdResponse} m IdResponse
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        IdResponse.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.arrays || o.defaults) {
                d.addresses = [];
                d.protocols = [];
            }
            if (o.defaults) {
                d.id = "";
                d.publicKey = "";
                d.agentVersion = "";
                d.protocolVersion = "";
            }
            if (m.id != null && m.hasOwnProperty("id")) {
                d.id = m.id;
            }
            if (m.publicKey != null && m.hasOwnProperty("publicKey")) {
                d.publicKey = m.publicKey;
            }
            if (m.addresses && m.addresses.length) {
                d.addresses = [];
                for (var j = 0; j < m.addresses.length; ++j) {
                    d.addresses[j] = m.addresses[j];
                }
            }
            if (m.agentVersion != null && m.hasOwnProperty("agentVersion")) {
                d.agentVersion = m.agentVersion;
            }
            if (m.protocolVersion != null && m.hasOwnProperty("protocolVersion")) {
                d.protocolVersion = m.protocolVersion;
            }
            if (m.protocols && m.protocols.length) {
                d.protocols = [];
                for (var j = 0; j < m.protocols.length; ++j) {
                    d.protocols[j] = m.protocols[j];
                }
            }
            return d;
        };

        /**
         * Converts this IdResponse to JSON.
         * @function toJSON
         * @memberof ipfs.IdResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        IdResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return IdResponse;
    })();

    ipfs.AddRequest = (function() {

        /**
         * Properties of an AddRequest.
         * @memberof ipfs
         * @interface IAddRequest
         * @property {number|null} [index] AddRequest index
         * @property {ipfs.FileType|null} [type] AddRequest type
         * @property {string|null} [path] AddRequest path
         * @property {number|null} [mode] AddRequest mode
         * @property {number|null} [mtime] AddRequest mtime
         * @property {number|null} [mtimeNsecs] AddRequest mtimeNsecs
         * @property {Uint8Array|null} [content] AddRequest content
         */

        /**
         * Constructs a new AddRequest.
         * @memberof ipfs
         * @classdesc Represents an AddRequest.
         * @implements IAddRequest
         * @constructor
         * @param {ipfs.IAddRequest=} [p] Properties to set
         */
        function AddRequest(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * AddRequest index.
         * @member {number} index
         * @memberof ipfs.AddRequest
         * @instance
         */
        AddRequest.prototype.index = 0;

        /**
         * AddRequest type.
         * @member {ipfs.FileType} type
         * @memberof ipfs.AddRequest
         * @instance
         */
        AddRequest.prototype.type = 0;

        /**
         * AddRequest path.
         * @member {string} path
         * @memberof ipfs.AddRequest
         * @instance
         */
        AddRequest.prototype.path = "";

        /**
         * AddRequest mode.
         * @member {number} mode
         * @memberof ipfs.AddRequest
         * @instance
         */
        AddRequest.prototype.mode = 0;

        /**
         * AddRequest mtime.
         * @member {number} mtime
         * @memberof ipfs.AddRequest
         * @instance
         */
        AddRequest.prototype.mtime = 0;

        /**
         * AddRequest mtimeNsecs.
         * @member {number} mtimeNsecs
         * @memberof ipfs.AddRequest
         * @instance
         */
        AddRequest.prototype.mtimeNsecs = 0;

        /**
         * AddRequest content.
         * @member {Uint8Array} content
         * @memberof ipfs.AddRequest
         * @instance
         */
        AddRequest.prototype.content = $util.newBuffer([]);

        /**
         * Encodes the specified AddRequest message. Does not implicitly {@link ipfs.AddRequest.verify|verify} messages.
         * @function encode
         * @memberof ipfs.AddRequest
         * @static
         * @param {ipfs.IAddRequest} m AddRequest message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddRequest.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.index != null && Object.hasOwnProperty.call(m, "index"))
                w.uint32(8).int32(m.index);
            if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                w.uint32(16).int32(m.type);
            if (m.path != null && Object.hasOwnProperty.call(m, "path"))
                w.uint32(26).string(m.path);
            if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                w.uint32(32).uint32(m.mode);
            if (m.mtime != null && Object.hasOwnProperty.call(m, "mtime"))
                w.uint32(40).int32(m.mtime);
            if (m.mtimeNsecs != null && Object.hasOwnProperty.call(m, "mtimeNsecs"))
                w.uint32(48).uint32(m.mtimeNsecs);
            if (m.content != null && Object.hasOwnProperty.call(m, "content"))
                w.uint32(58).bytes(m.content);
            return w;
        };

        /**
         * Decodes an AddRequest message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.AddRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.AddRequest} AddRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.AddRequest();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.index = r.int32();
                    break;
                case 2:
                    m.type = r.int32();
                    break;
                case 3:
                    m.path = r.string();
                    break;
                case 4:
                    m.mode = r.uint32();
                    break;
                case 5:
                    m.mtime = r.int32();
                    break;
                case 6:
                    m.mtimeNsecs = r.uint32();
                    break;
                case 7:
                    m.content = r.bytes();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates an AddRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.AddRequest
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.AddRequest} AddRequest
         */
        AddRequest.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.AddRequest)
                return d;
            var m = new $root.ipfs.AddRequest();
            if (d.index != null) {
                m.index = d.index | 0;
            }
            switch (d.type) {
            case "DIRECTORY":
            case 0:
                m.type = 0;
                break;
            case "FILE":
            case 1:
                m.type = 1;
                break;
            }
            if (d.path != null) {
                m.path = String(d.path);
            }
            if (d.mode != null) {
                m.mode = d.mode >>> 0;
            }
            if (d.mtime != null) {
                m.mtime = d.mtime | 0;
            }
            if (d.mtimeNsecs != null) {
                m.mtimeNsecs = d.mtimeNsecs >>> 0;
            }
            if (d.content != null) {
                if (typeof d.content === "string")
                    $util.base64.decode(d.content, m.content = $util.newBuffer($util.base64.length(d.content)), 0);
                else if (d.content.length)
                    m.content = d.content;
            }
            return m;
        };

        /**
         * Creates a plain object from an AddRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.AddRequest
         * @static
         * @param {ipfs.AddRequest} m AddRequest
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AddRequest.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.defaults) {
                d.index = 0;
                d.type = o.enums === String ? "DIRECTORY" : 0;
                d.path = "";
                d.mode = 0;
                d.mtime = 0;
                d.mtimeNsecs = 0;
                if (o.bytes === String)
                    d.content = "";
                else {
                    d.content = [];
                    if (o.bytes !== Array)
                        d.content = $util.newBuffer(d.content);
                }
            }
            if (m.index != null && m.hasOwnProperty("index")) {
                d.index = m.index;
            }
            if (m.type != null && m.hasOwnProperty("type")) {
                d.type = o.enums === String ? $root.ipfs.FileType[m.type] : m.type;
            }
            if (m.path != null && m.hasOwnProperty("path")) {
                d.path = m.path;
            }
            if (m.mode != null && m.hasOwnProperty("mode")) {
                d.mode = m.mode;
            }
            if (m.mtime != null && m.hasOwnProperty("mtime")) {
                d.mtime = m.mtime;
            }
            if (m.mtimeNsecs != null && m.hasOwnProperty("mtimeNsecs")) {
                d.mtimeNsecs = m.mtimeNsecs;
            }
            if (m.content != null && m.hasOwnProperty("content")) {
                d.content = o.bytes === String ? $util.base64.encode(m.content, 0, m.content.length) : o.bytes === Array ? Array.prototype.slice.call(m.content) : m.content;
            }
            return d;
        };

        /**
         * Converts this AddRequest to JSON.
         * @function toJSON
         * @memberof ipfs.AddRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AddRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AddRequest;
    })();

    ipfs.AddResponse = (function() {

        /**
         * Properties of an AddResponse.
         * @memberof ipfs
         * @interface IAddResponse
         * @property {ipfs.AddResponseType|null} [type] AddResponse type
         * @property {string|null} [path] AddResponse path
         * @property {number|null} [bytes] AddResponse bytes
         * @property {string|null} [cid] AddResponse cid
         * @property {number|null} [mode] AddResponse mode
         * @property {number|null} [mtime] AddResponse mtime
         * @property {number|null} [mtimeNsecs] AddResponse mtimeNsecs
         * @property {number|null} [size] AddResponse size
         */

        /**
         * Constructs a new AddResponse.
         * @memberof ipfs
         * @classdesc Represents an AddResponse.
         * @implements IAddResponse
         * @constructor
         * @param {ipfs.IAddResponse=} [p] Properties to set
         */
        function AddResponse(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * AddResponse type.
         * @member {ipfs.AddResponseType} type
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.type = 0;

        /**
         * AddResponse path.
         * @member {string} path
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.path = "";

        /**
         * AddResponse bytes.
         * @member {number} bytes
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.bytes = 0;

        /**
         * AddResponse cid.
         * @member {string} cid
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.cid = "";

        /**
         * AddResponse mode.
         * @member {number} mode
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.mode = 0;

        /**
         * AddResponse mtime.
         * @member {number} mtime
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.mtime = 0;

        /**
         * AddResponse mtimeNsecs.
         * @member {number} mtimeNsecs
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.mtimeNsecs = 0;

        /**
         * AddResponse size.
         * @member {number} size
         * @memberof ipfs.AddResponse
         * @instance
         */
        AddResponse.prototype.size = 0;

        /**
         * Encodes the specified AddResponse message. Does not implicitly {@link ipfs.AddResponse.verify|verify} messages.
         * @function encode
         * @memberof ipfs.AddResponse
         * @static
         * @param {ipfs.IAddResponse} m AddResponse message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddResponse.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.type != null && Object.hasOwnProperty.call(m, "type"))
                w.uint32(8).int32(m.type);
            if (m.path != null && Object.hasOwnProperty.call(m, "path"))
                w.uint32(18).string(m.path);
            if (m.bytes != null && Object.hasOwnProperty.call(m, "bytes"))
                w.uint32(24).int32(m.bytes);
            if (m.cid != null && Object.hasOwnProperty.call(m, "cid"))
                w.uint32(34).string(m.cid);
            if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                w.uint32(40).uint32(m.mode);
            if (m.mtime != null && Object.hasOwnProperty.call(m, "mtime"))
                w.uint32(48).int32(m.mtime);
            if (m.mtimeNsecs != null && Object.hasOwnProperty.call(m, "mtimeNsecs"))
                w.uint32(56).uint32(m.mtimeNsecs);
            if (m.size != null && Object.hasOwnProperty.call(m, "size"))
                w.uint32(64).uint32(m.size);
            return w;
        };

        /**
         * Decodes an AddResponse message from the specified reader or buffer.
         * @function decode
         * @memberof ipfs.AddResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {ipfs.AddResponse} AddResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.ipfs.AddResponse();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.type = r.int32();
                    break;
                case 2:
                    m.path = r.string();
                    break;
                case 3:
                    m.bytes = r.int32();
                    break;
                case 4:
                    m.cid = r.string();
                    break;
                case 5:
                    m.mode = r.uint32();
                    break;
                case 6:
                    m.mtime = r.int32();
                    break;
                case 7:
                    m.mtimeNsecs = r.uint32();
                    break;
                case 8:
                    m.size = r.uint32();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates an AddResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ipfs.AddResponse
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {ipfs.AddResponse} AddResponse
         */
        AddResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ipfs.AddResponse)
                return d;
            var m = new $root.ipfs.AddResponse();
            switch (d.type) {
            case "PROGRESS":
            case 0:
                m.type = 0;
                break;
            case "RESULT":
            case 1:
                m.type = 1;
                break;
            }
            if (d.path != null) {
                m.path = String(d.path);
            }
            if (d.bytes != null) {
                m.bytes = d.bytes | 0;
            }
            if (d.cid != null) {
                m.cid = String(d.cid);
            }
            if (d.mode != null) {
                m.mode = d.mode >>> 0;
            }
            if (d.mtime != null) {
                m.mtime = d.mtime | 0;
            }
            if (d.mtimeNsecs != null) {
                m.mtimeNsecs = d.mtimeNsecs >>> 0;
            }
            if (d.size != null) {
                m.size = d.size >>> 0;
            }
            return m;
        };

        /**
         * Creates a plain object from an AddResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ipfs.AddResponse
         * @static
         * @param {ipfs.AddResponse} m AddResponse
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AddResponse.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.defaults) {
                d.type = o.enums === String ? "PROGRESS" : 0;
                d.path = "";
                d.bytes = 0;
                d.cid = "";
                d.mode = 0;
                d.mtime = 0;
                d.mtimeNsecs = 0;
                d.size = 0;
            }
            if (m.type != null && m.hasOwnProperty("type")) {
                d.type = o.enums === String ? $root.ipfs.AddResponseType[m.type] : m.type;
            }
            if (m.path != null && m.hasOwnProperty("path")) {
                d.path = m.path;
            }
            if (m.bytes != null && m.hasOwnProperty("bytes")) {
                d.bytes = m.bytes;
            }
            if (m.cid != null && m.hasOwnProperty("cid")) {
                d.cid = m.cid;
            }
            if (m.mode != null && m.hasOwnProperty("mode")) {
                d.mode = m.mode;
            }
            if (m.mtime != null && m.hasOwnProperty("mtime")) {
                d.mtime = m.mtime;
            }
            if (m.mtimeNsecs != null && m.hasOwnProperty("mtimeNsecs")) {
                d.mtimeNsecs = m.mtimeNsecs;
            }
            if (m.size != null && m.hasOwnProperty("size")) {
                d.size = m.size;
            }
            return d;
        };

        /**
         * Converts this AddResponse to JSON.
         * @function toJSON
         * @memberof ipfs.AddResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AddResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AddResponse;
    })();

    return ipfs;
})();

module.exports = $root;
