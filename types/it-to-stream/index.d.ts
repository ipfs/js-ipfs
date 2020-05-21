// Type definitions for it-to-stream 0.1
// Project: https://github.com/alanshaw/it-to-stream#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = it_to_stream;

declare function it_to_stream(source: any, options: any): any;

declare namespace it_to_stream {
    // Circular reference from it_to_stream
    const readable: any;

    function duplex(duplex: any, options: any): any;

    function transform(transform: any, options: any): any;

    function writable(sink: any, options: any): any;

}

