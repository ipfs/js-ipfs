// Type definitions for ipld-raw 5.0
// Project: https://github.com/ipld/js-ipld-raw#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = ipld_raw;

declare const ipld_raw: {
    codec: number;
    defaultHashAlg: number;
    resolver: {
        resolve: any;
        tree: any;
    };
    util: {
        cid: any;
        deserialize: any;
        serialize: any;
    };
};

