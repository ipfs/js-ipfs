// Type definitions for class-is 1.1
// Project: https://github.com/moxystudio/js-class-is
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = class_is;

declare function class_is(Class: any, { className, symbolName }: any): any;

declare namespace class_is {
    function proto(Class: any, { className, symbolName, withoutNew }: any): any;

}

