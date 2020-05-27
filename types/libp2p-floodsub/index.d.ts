// Type definitions for libp2p-floodsub 0.20
// Project: https://github.com/libp2p/js-libp2p-floodsub#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = libp2p_floodsub;

declare class libp2p_floodsub {
    constructor(...args: any[]);

    getTopics(...args: any[]): void;

    publish(...args: any[]): void;

    stop(...args: any[]): void;

    subscribe(...args: any[]): void;

    unsubscribe(...args: any[]): void;

    static defaultMaxListeners: number;

    static init(): void;

    static listenerCount(emitter: any, type: any): any;

    static message: {
        Message: {
            buffer: boolean;
            decode: any;
            encode: any;
            encodingLength: any;
            message: boolean;
            name: string;
            type: number;
        };
        RPC: {
            Message: {
                buffer: boolean;
                decode: any;
                encode: any;
                encodingLength: any;
                message: boolean;
                name: string;
                type: number;
            };
            SubOpts: {
                buffer: boolean;
                decode: any;
                encode: any;
                encodingLength: any;
                message: boolean;
                name: string;
                type: number;
            };
            buffer: boolean;
            decode: any;
            encode: any;
            encodingLength: any;
            message: boolean;
            name: string;
            type: number;
        };
        SubOpts: {
            buffer: boolean;
            decode: any;
            encode: any;
            encodingLength: any;
            message: boolean;
            name: string;
            type: number;
        };
        rpc: {
            RPC: {
                Message: {
                    buffer: boolean;
                    decode: any;
                    encode: any;
                    encodingLength: any;
                    message: boolean;
                    name: string;
                    type: number;
                };
                SubOpts: {
                    buffer: boolean;
                    decode: any;
                    encode: any;
                    encodingLength: any;
                    message: boolean;
                    name: string;
                    type: number;
                };
                buffer: boolean;
                decode: any;
                encode: any;
                encodingLength: any;
                message: boolean;
                name: string;
                type: number;
            };
            toJSON: any;
            toString: any;
        };
        td: {
            TopicDescriptor: {
                AuthOpts: {
                    AuthMode: {
                        KEY: number;
                        NONE: number;
                        WOT: number;
                    };
                    buffer: boolean;
                    decode: any;
                    encode: any;
                    encodingLength: any;
                    message: boolean;
                    name: string;
                    type: number;
                };
                EncOpts: {
                    EncMode: {
                        NONE: number;
                        SHAREDKEY: number;
                        WOT: number;
                    };
                    buffer: boolean;
                    decode: any;
                    encode: any;
                    encodingLength: any;
                    message: boolean;
                    name: string;
                    type: number;
                };
                buffer: boolean;
                decode: any;
                encode: any;
                encodingLength: any;
                message: boolean;
                name: string;
                type: number;
            };
            toJSON: any;
            toString: any;
        };
    };

    static multicodec: string;

    static once(emitter: any, name: any): any;

    static usingDomains: boolean;

}

declare namespace libp2p_floodsub {
    class EventEmitter {
        constructor();

        addListener(type: any, listener: any): any;

        emit(type: any, args: any): any;

        eventNames(): any;

        getMaxListeners(): any;

        listenerCount(type: any): any;

        listeners(type: any): any;

        off(type: any, listener: any): any;

        on(type: any, listener: any): any;

        once(type: any, listener: any): any;

        prependListener(type: any, listener: any): any;

        prependOnceListener(type: any, listener: any): any;

        rawListeners(type: any): any;

        removeAllListeners(type: any, ...args: any[]): any;

        removeListener(type: any, listener: any): any;

        setMaxListeners(n: any): any;

        static EventEmitter: any;

        static defaultMaxListeners: number;

        static init(): void;

        static listenerCount(emitter: any, type: any): any;

        static once(emitter: any, name: any): any;

        static usingDomains: boolean;

    }

    namespace utils {
        function anyMatch(a: any, b: any): any;

        function ensureArray(maybeArray: any): any;

        function msgId(from: any, seqno: any): any;

        function normalizeInRpcMessage(message: any): any;

        function normalizeInRpcMessages(messages: any): any;

        function normalizeOutRpcMessage(message: any): any;

        function normalizeOutRpcMessages(messages: any): any;

        function randomSeqno(): any;

    }

}

