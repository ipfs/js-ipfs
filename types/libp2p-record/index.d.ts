// Type definitions for libp2p-record 0.7
// Project: https://github.com/libp2p/js-libp2p-record
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export class Record {
    constructor(...args: any[]);

    prepareSerialize(...args: any[]): void;

    serialize(...args: any[]): void;

    static deserialize(...args: any[]): void;

    static fromDeserialized(...args: any[]): void;

}

export namespace selection {
    function bestRecord(selectors: any, k: any, records: any): any;

    namespace selectors {
        function pk(k: any, records: any): any;

    }

}

export namespace validator {
    const validators: {
        pk: {
            func: any;
            sign: boolean;
        };
    };

    function verifyRecord(validators: any, record: any): any;

}

