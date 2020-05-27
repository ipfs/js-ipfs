// Type definitions for datastore-core 1.1
// Project: https://github.com/ipfs/js-datastore-core#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export class KeytransformDatastore {
    constructor(...args: any[]);

    batch(...args: any[]): void;

    close(...args: any[]): void;

    delete(...args: any[]): void;

    get(...args: any[]): void;

    has(...args: any[]): void;

    open(...args: any[]): void;

    put(...args: any[]): void;

    query(...args: any[]): void;

}

export class MountDatastore {
    constructor(...args: any[]);

    batch(...args: any[]): void;

    close(...args: any[]): void;

    delete(...args: any[]): void;

    get(...args: any[]): void;

    has(...args: any[]): void;

    open(...args: any[]): void;

    put(...args: any[]): void;

    query(...args: any[]): void;

}

export class NamespaceDatastore {
    constructor(...args: any[]);

    query(...args: any[]): void;

}

export class ShardingDatastore {
    constructor(...args: any[]);

    batch(...args: any[]): void;

    close(...args: any[]): void;

    delete(...args: any[]): void;

    get(...args: any[]): void;

    has(...args: any[]): void;

    open(...args: any[]): void;

    put(...args: any[]): void;

    query(...args: any[]): void;

    static create(...args: any[]): void;

    static createOrOpen(...args: any[]): void;

    static open(...args: any[]): void;

}

export class TieredDatastore {
    constructor(...args: any[]);

    batch(...args: any[]): void;

    close(...args: any[]): void;

    delete(...args: any[]): void;

    get(...args: any[]): void;

    has(...args: any[]): void;

    open(...args: any[]): void;

    put(...args: any[]): void;

    query(...args: any[]): void;

}

export namespace shard {
    class NextToLast {
        constructor(...args: any[]);

        fun(...args: any[]): void;

    }

    class Prefix {
        constructor(...args: any[]);

        fun(...args: any[]): void;

    }

    class Suffix {
        constructor(...args: any[]);

        fun(...args: any[]): void;

    }

    const PREFIX: string;

    const README_FN: string;

    const SHARDING_FN: string;

    const readme: string;

    function parseShardFun(str: any): any;

    function readShardFun(path: any, store: any): any;

}

