// Type definitions for libp2p-keychain 0.5
// Project: https://github.com/libp2p/js-libp2p-keychain#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = libp2p_keychain;

declare class libp2p_keychain {
    constructor(...args: any[]);

    createKey(...args: any[]): void;

    exportKey(...args: any[]): void;

    findKeyById(...args: any[]): void;

    findKeyByName(...args: any[]): void;

    importKey(...args: any[]): void;

    importPeer(...args: any[]): void;

    listKeys(...args: any[]): void;

    removeKey(...args: any[]): void;

    renameKey(...args: any[]): void;

    static generateOptions(...args: any[]): void;

    static options: {
        dek: {
            hash: string;
            iterationCount: number;
            keyLength: number;
            salt: string;
        };
    };

}

