// Type definitions for @hapi/boom 9.1
// Project: https://github.com/hapijs/boom#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = hapi__boom;

declare function hapi__boom(...args: any[]): any;

declare namespace hapi__boom {
    // Circular reference from hapi__boom
    const default: any;

    const stackTraceLimit: number;

    function badData(...args: any[]): void;

    function badGateway(...args: any[]): void;

    function badImplementation(...args: any[]): void;

    function badRequest(...args: any[]): void;

    function boomify(...args: any[]): void;

    function captureStackTrace(p0: any, p1: any): any;

    function clientTimeout(...args: any[]): void;

    function conflict(...args: any[]): void;

    function entityTooLarge(...args: any[]): void;

    function expectationFailed(...args: any[]): void;

    function failedDependency(...args: any[]): void;

    function forbidden(...args: any[]): void;

    function gatewayTimeout(...args: any[]): void;

    function illegal(...args: any[]): void;

    function internal(...args: any[]): void;

    function isBoom(...args: any[]): void;

    function lengthRequired(...args: any[]): void;

    function locked(...args: any[]): void;

    function methodNotAllowed(...args: any[]): void;

    function notAcceptable(...args: any[]): void;

    function notFound(...args: any[]): void;

    function notImplemented(...args: any[]): void;

    function paymentRequired(...args: any[]): void;

    function preconditionFailed(...args: any[]): void;

    function preconditionRequired(...args: any[]): void;

    function proxyAuthRequired(...args: any[]): void;

    function rangeNotSatisfiable(...args: any[]): void;

    function resourceGone(...args: any[]): void;

    function serverUnavailable(...args: any[]): void;

    function teapot(...args: any[]): void;

    function tooManyRequests(...args: any[]): void;

    function unauthorized(...args: any[]): void;

    function unsupportedMediaType(...args: any[]): void;

    function uriTooLong(...args: any[]): void;

}

