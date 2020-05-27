// Type definitions for any-signal 1.1
// Project: https://github.com/jacobheun/any-signal#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = any_signal;

declare function any_signal(signals: any): any;

declare namespace any_signal {
    // Circular reference from any_signal
    const anySignal: any;

}

