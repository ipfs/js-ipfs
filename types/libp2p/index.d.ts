// Type definitions for libp2p 0.27
// Project: https://libp2p.io
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = libp2p;

declare class libp2p {
    constructor(...args: any[]);

    dial(...args: any[]): void;

    dialProtocol(...args: any[]): void;

    emit(...args: any[]): void;

    handle(...args: any[]): void;

    hangUp(...args: any[]): void;

    isStarted(...args: any[]): void;

    ping(...args: any[]): void;

    start(...args: any[]): void;

    stop(...args: any[]): void;

    unhandle(...args: any[]): void;

    static create(options: any): any;

    static defaultMaxListeners: number;

    static init(): void;

    static listenerCount(emitter: any, type: any): any;

    static once(emitter: any, name: any): any;

    static usingDomains: boolean;

}

declare namespace libp2p {
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

}

