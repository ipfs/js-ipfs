// Type definitions for stream-to-it 0.2
// Project: https://github.com/alanshaw/stream-to-it#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = stream_to_it;

declare function stream_to_it(readable: any): any;

declare namespace stream_to_it {
    // Circular reference from stream_to_it
    const source: any;

    function duplex(duplex: any): void;

    function sink(writable: any): any;

    function transform(transform: any): void;

}

