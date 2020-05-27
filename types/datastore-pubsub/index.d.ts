// Type definitions for datastore-pubsub 0.3
// Project: https://github.com/ipfs/js-datastore-pubsub#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = datastore_pubsub;

declare class datastore_pubsub {
    constructor(...args: any[]);

    batch(...args: any[]): void;

    close(...args: any[]): void;

    delete(...args: any[]): void;

    get(...args: any[]): void;

    has(...args: any[]): void;

    open(...args: any[]): void;

    put(...args: any[]): void;

    query(...args: any[]): void;

    unsubscribe(...args: any[]): void;

}

