// Type definitions for multibase 0.7
// Project: https://github.com/multiformats/js-multibase#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = multibase;

declare function multibase(nameOrCode: any, buf: any): any;

declare namespace multibase {
    const codes: string[];

    const names: string[];

    function decode(bufOrString: any): any;

    function encode(nameOrCode: any, buf: any): any;

    function isEncoded(bufOrString: any): any;

}

