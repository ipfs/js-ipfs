// Type definitions for ipld-dag-cbor 0.15
// Project: https://github.com/ipld/js-ipld-dag-cbor
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = ipld_dag_cbor;

declare const ipld_dag_cbor: {
    codec: number;
    defaultHashAlg: number;
    resolver: {
        resolve: any;
        tree: any;
    };
    util: {
        cid: any;
        codec: number;
        configureDecoder: any;
        defaultHashAlg: number;
        deserialize: any;
        serialize: any;
    };
};

