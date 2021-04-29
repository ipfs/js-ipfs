import * as $protobuf from "protobufjs";
/** Namespace ipfs. */
export namespace ipfs {

    /** FileType enum. */
    enum FileType {
        DIRECTORY = 0,
        FILE = 1
    }

    /** Represents a MFS */
    class MFS extends $protobuf.rpc.Service {

        /**
         * Constructs a new MFS service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Calls ls.
         * @param request LsRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and LsResponse
         */
        public ls(request: ipfs.ILsRequest, callback: ipfs.MFS.lsCallback): void;

        /**
         * Calls ls.
         * @param request LsRequest message or plain object
         * @returns Promise
         */
        public ls(request: ipfs.ILsRequest): Promise<ipfs.LsResponse>;

        /**
         * Calls write.
         * @param request WriteRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and WriteResponse
         */
        public write(request: ipfs.IWriteRequest, callback: ipfs.MFS.writeCallback): void;

        /**
         * Calls write.
         * @param request WriteRequest message or plain object
         * @returns Promise
         */
        public write(request: ipfs.IWriteRequest): Promise<ipfs.WriteResponse>;
    }

    namespace MFS {

        /**
         * Callback as used by {@link ipfs.MFS#ls}.
         * @param error Error, if any
         * @param [response] LsResponse
         */
        type lsCallback = (error: (Error|null), response?: ipfs.LsResponse) => void;

        /**
         * Callback as used by {@link ipfs.MFS#write}.
         * @param error Error, if any
         * @param [response] WriteResponse
         */
        type writeCallback = (error: (Error|null), response?: ipfs.WriteResponse) => void;
    }

    /** Properties of a LsRequest. */
    interface ILsRequest {

        /** LsRequest path */
        path?: (string|null);
    }

    /** Represents a LsRequest. */
    class LsRequest implements ILsRequest {

        /**
         * Constructs a new LsRequest.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.ILsRequest);

        /** LsRequest path. */
        public path: string;

        /**
         * Encodes the specified LsRequest message. Does not implicitly {@link ipfs.LsRequest.verify|verify} messages.
         * @param m LsRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.ILsRequest, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LsRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns LsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.LsRequest;

        /**
         * Creates a LsRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns LsRequest
         */
        public static fromObject(d: { [k: string]: any }): ipfs.LsRequest;

        /**
         * Creates a plain object from a LsRequest message. Also converts values to other types if specified.
         * @param m LsRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.LsRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LsRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a LsResponse. */
    interface ILsResponse {

        /** LsResponse name */
        name?: (string|null);

        /** LsResponse type */
        type?: (ipfs.FileType|null);

        /** LsResponse size */
        size?: (number|null);

        /** LsResponse cid */
        cid?: (string|null);

        /** LsResponse mode */
        mode?: (number|null);

        /** LsResponse mtime */
        mtime?: (number|null);

        /** LsResponse mtimeNsecs */
        mtimeNsecs?: (number|null);
    }

    /** Represents a LsResponse. */
    class LsResponse implements ILsResponse {

        /**
         * Constructs a new LsResponse.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.ILsResponse);

        /** LsResponse name. */
        public name: string;

        /** LsResponse type. */
        public type: ipfs.FileType;

        /** LsResponse size. */
        public size: number;

        /** LsResponse cid. */
        public cid: string;

        /** LsResponse mode. */
        public mode: number;

        /** LsResponse mtime. */
        public mtime: number;

        /** LsResponse mtimeNsecs. */
        public mtimeNsecs: number;

        /**
         * Encodes the specified LsResponse message. Does not implicitly {@link ipfs.LsResponse.verify|verify} messages.
         * @param m LsResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.ILsResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LsResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns LsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.LsResponse;

        /**
         * Creates a LsResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns LsResponse
         */
        public static fromObject(d: { [k: string]: any }): ipfs.LsResponse;

        /**
         * Creates a plain object from a LsResponse message. Also converts values to other types if specified.
         * @param m LsResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.LsResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a WriteRequest. */
    interface IWriteRequest {

        /** WriteRequest path */
        path?: (string|null);

        /** WriteRequest content */
        content?: (Uint8Array|null);
    }

    /** Represents a WriteRequest. */
    class WriteRequest implements IWriteRequest {

        /**
         * Constructs a new WriteRequest.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.IWriteRequest);

        /** WriteRequest path. */
        public path: string;

        /** WriteRequest content. */
        public content: Uint8Array;

        /**
         * Encodes the specified WriteRequest message. Does not implicitly {@link ipfs.WriteRequest.verify|verify} messages.
         * @param m WriteRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.IWriteRequest, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WriteRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns WriteRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.WriteRequest;

        /**
         * Creates a WriteRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns WriteRequest
         */
        public static fromObject(d: { [k: string]: any }): ipfs.WriteRequest;

        /**
         * Creates a plain object from a WriteRequest message. Also converts values to other types if specified.
         * @param m WriteRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.WriteRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WriteRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a WriteResponse. */
    interface IWriteResponse {
    }

    /** Represents a WriteResponse. */
    class WriteResponse implements IWriteResponse {

        /**
         * Constructs a new WriteResponse.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.IWriteResponse);

        /**
         * Encodes the specified WriteResponse message. Does not implicitly {@link ipfs.WriteResponse.verify|verify} messages.
         * @param m WriteResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.IWriteResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WriteResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns WriteResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.WriteResponse;

        /**
         * Creates a WriteResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns WriteResponse
         */
        public static fromObject(d: { [k: string]: any }): ipfs.WriteResponse;

        /**
         * Creates a plain object from a WriteResponse message. Also converts values to other types if specified.
         * @param m WriteResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.WriteResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WriteResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Represents a Root */
    class Root extends $protobuf.rpc.Service {

        /**
         * Constructs a new Root service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Calls id.
         * @param request IdRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and IdResponse
         */
        public id(request: ipfs.IIdRequest, callback: ipfs.Root.idCallback): void;

        /**
         * Calls id.
         * @param request IdRequest message or plain object
         * @returns Promise
         */
        public id(request: ipfs.IIdRequest): Promise<ipfs.IdResponse>;

        /**
         * Calls add.
         * @param request AddRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and AddResponse
         */
        public add(request: ipfs.IAddRequest, callback: ipfs.Root.addCallback): void;

        /**
         * Calls add.
         * @param request AddRequest message or plain object
         * @returns Promise
         */
        public add(request: ipfs.IAddRequest): Promise<ipfs.AddResponse>;
    }

    namespace Root {

        /**
         * Callback as used by {@link ipfs.Root#id}.
         * @param error Error, if any
         * @param [response] IdResponse
         */
        type idCallback = (error: (Error|null), response?: ipfs.IdResponse) => void;

        /**
         * Callback as used by {@link ipfs.Root#add}.
         * @param error Error, if any
         * @param [response] AddResponse
         */
        type addCallback = (error: (Error|null), response?: ipfs.AddResponse) => void;
    }

    /** AddResponseType enum. */
    enum AddResponseType {
        PROGRESS = 0,
        RESULT = 1
    }

    /** Properties of an IdRequest. */
    interface IIdRequest {

        /** IdRequest peerId */
        peerId?: (string|null);
    }

    /** Represents an IdRequest. */
    class IdRequest implements IIdRequest {

        /**
         * Constructs a new IdRequest.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.IIdRequest);

        /** IdRequest peerId. */
        public peerId: string;

        /**
         * Encodes the specified IdRequest message. Does not implicitly {@link ipfs.IdRequest.verify|verify} messages.
         * @param m IdRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.IIdRequest, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an IdRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns IdRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.IdRequest;

        /**
         * Creates an IdRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns IdRequest
         */
        public static fromObject(d: { [k: string]: any }): ipfs.IdRequest;

        /**
         * Creates a plain object from an IdRequest message. Also converts values to other types if specified.
         * @param m IdRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.IdRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this IdRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an IdResponse. */
    interface IIdResponse {

        /** IdResponse id */
        id?: (string|null);

        /** IdResponse publicKey */
        publicKey?: (string|null);

        /** IdResponse addresses */
        addresses?: (string[]|null);

        /** IdResponse agentVersion */
        agentVersion?: (string|null);

        /** IdResponse protocolVersion */
        protocolVersion?: (string|null);

        /** IdResponse protocols */
        protocols?: (string[]|null);
    }

    /** Represents an IdResponse. */
    class IdResponse implements IIdResponse {

        /**
         * Constructs a new IdResponse.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.IIdResponse);

        /** IdResponse id. */
        public id: string;

        /** IdResponse publicKey. */
        public publicKey: string;

        /** IdResponse addresses. */
        public addresses: string[];

        /** IdResponse agentVersion. */
        public agentVersion: string;

        /** IdResponse protocolVersion. */
        public protocolVersion: string;

        /** IdResponse protocols. */
        public protocols: string[];

        /**
         * Encodes the specified IdResponse message. Does not implicitly {@link ipfs.IdResponse.verify|verify} messages.
         * @param m IdResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.IIdResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an IdResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns IdResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.IdResponse;

        /**
         * Creates an IdResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns IdResponse
         */
        public static fromObject(d: { [k: string]: any }): ipfs.IdResponse;

        /**
         * Creates a plain object from an IdResponse message. Also converts values to other types if specified.
         * @param m IdResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.IdResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this IdResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an AddRequest. */
    interface IAddRequest {

        /** AddRequest index */
        index?: (number|null);

        /** AddRequest type */
        type?: (ipfs.FileType|null);

        /** AddRequest path */
        path?: (string|null);

        /** AddRequest mode */
        mode?: (number|null);

        /** AddRequest mtime */
        mtime?: (number|null);

        /** AddRequest mtimeNsecs */
        mtimeNsecs?: (number|null);

        /** AddRequest content */
        content?: (Uint8Array|null);
    }

    /** Represents an AddRequest. */
    class AddRequest implements IAddRequest {

        /**
         * Constructs a new AddRequest.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.IAddRequest);

        /** AddRequest index. */
        public index: number;

        /** AddRequest type. */
        public type: ipfs.FileType;

        /** AddRequest path. */
        public path: string;

        /** AddRequest mode. */
        public mode: number;

        /** AddRequest mtime. */
        public mtime: number;

        /** AddRequest mtimeNsecs. */
        public mtimeNsecs: number;

        /** AddRequest content. */
        public content: Uint8Array;

        /**
         * Encodes the specified AddRequest message. Does not implicitly {@link ipfs.AddRequest.verify|verify} messages.
         * @param m AddRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.IAddRequest, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AddRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AddRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.AddRequest;

        /**
         * Creates an AddRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns AddRequest
         */
        public static fromObject(d: { [k: string]: any }): ipfs.AddRequest;

        /**
         * Creates a plain object from an AddRequest message. Also converts values to other types if specified.
         * @param m AddRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.AddRequest, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AddRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an AddResponse. */
    interface IAddResponse {

        /** AddResponse type */
        type?: (ipfs.AddResponseType|null);

        /** AddResponse path */
        path?: (string|null);

        /** AddResponse bytes */
        bytes?: (number|null);

        /** AddResponse cid */
        cid?: (string|null);

        /** AddResponse mode */
        mode?: (number|null);

        /** AddResponse mtime */
        mtime?: (number|null);

        /** AddResponse mtimeNsecs */
        mtimeNsecs?: (number|null);

        /** AddResponse size */
        size?: (number|null);
    }

    /** Represents an AddResponse. */
    class AddResponse implements IAddResponse {

        /**
         * Constructs a new AddResponse.
         * @param [p] Properties to set
         */
        constructor(p?: ipfs.IAddResponse);

        /** AddResponse type. */
        public type: ipfs.AddResponseType;

        /** AddResponse path. */
        public path: string;

        /** AddResponse bytes. */
        public bytes: number;

        /** AddResponse cid. */
        public cid: string;

        /** AddResponse mode. */
        public mode: number;

        /** AddResponse mtime. */
        public mtime: number;

        /** AddResponse mtimeNsecs. */
        public mtimeNsecs: number;

        /** AddResponse size. */
        public size: number;

        /**
         * Encodes the specified AddResponse message. Does not implicitly {@link ipfs.AddResponse.verify|verify} messages.
         * @param m AddResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: ipfs.IAddResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AddResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AddResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): ipfs.AddResponse;

        /**
         * Creates an AddResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns AddResponse
         */
        public static fromObject(d: { [k: string]: any }): ipfs.AddResponse;

        /**
         * Creates a plain object from an AddResponse message. Also converts values to other types if specified.
         * @param m AddResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: ipfs.AddResponse, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AddResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
