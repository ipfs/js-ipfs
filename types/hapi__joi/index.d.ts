// Type definitions for @hapi/joi 17.1
// Project: https://github.com/hapijs/joi#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export const isImmutable: boolean;

export const isJoi: boolean;

export const schemaType: string;

export const version: string;

export function allow(...args: any[]): void;

export function alt(args: any): any;

export function alternatives(args: any): any;

export function any(args: any): any;

export function applyFunctionToChildren(...args: any[]): void;

export function array(args: any): any;

export function assert(value: any, schema: any, message: any): void;

export function attempt(value: any, schema: any, message: any): any;

export function binary(args: any): any;

export function bind(): any;

export function bool(args: any): any;

export function checkOptions(...args: any[]): void;

export function clone(...args: any[]): void;

export function compile(schema: any): any;

export function concat(...args: any[]): void;

export function createError(...args: any[]): void;

export function createOverrideError(...args: any[]): void;

export function date(args: any): any;

export function defaults(fn: any): any;

export function describe(args: any): any;

export function description(...args: any[]): void;

export function disallow(...args: any[]): void;

export function empty(...args: any[]): void;

export function equal(...args: any[]): void;

export function error(...args: any[]): void;

export function example(...args: any[]): void;

export function exist(...args: any[]): void;

export function extend(args: any): any;

export function forbidden(...args: any[]): void;

export function func(args: any): any;

export function invalid(...args: any[]): void;

export function isRef(ref: any): any;

export function label(...args: any[]): void;

export function lazy(args: any): any;

export function meta(...args: any[]): void;

export function not(...args: any[]): void;

export function notes(...args: any[]): void;

export function number(args: any): any;

export function object(args: any): any;

export function only(...args: any[]): void;

export function optional(...args: any[]): void;

export function options(...args: any[]): void;

export function raw(...args: any[]): void;

export function reach(schema: any, path: any): any;

export function ref(args: any): any;

export function required(...args: any[]): void;

export function strict(...args: any[]): void;

export function string(args: any): any;

export function strip(...args: any[]): void;

export function symbol(args: any): any;

export function tags(...args: any[]): void;

export function unit(...args: any[]): void;

export function valid(...args: any[]): void;

export function validate(value: any, args: any): any;

export function when(...args: any[]): void;

export namespace extensionSchema {
    const isImmutable: boolean;

    const isJoi: boolean;

    const schemaType: string;

    function allow(...args: any[]): void;

    function and(...args: any[]): void;

    function append(...args: any[]): void;

    function applyFunctionToChildren(...args: any[]): void;

    function assert(...args: any[]): void;

    function checkOptions(...args: any[]): void;

    function clone(...args: any[]): void;

    function concat(...args: any[]): void;

    function createError(...args: any[]): void;

    function createOverrideError(...args: any[]): void;

    function describe(...args: any[]): void;

    function description(...args: any[]): void;

    function disallow(...args: any[]): void;

    function empty(...args: any[]): void;

    function equal(...args: any[]): void;

    function error(...args: any[]): void;

    function example(...args: any[]): void;

    function exist(...args: any[]): void;

    function forbidden(...args: any[]): void;

    function forbiddenKeys(...args: any[]): void;

    function invalid(...args: any[]): void;

    function keys(...args: any[]): void;

    function label(...args: any[]): void;

    function length(...args: any[]): void;

    function max(...args: any[]): void;

    function meta(...args: any[]): void;

    function min(...args: any[]): void;

    function nand(...args: any[]): void;

    function not(...args: any[]): void;

    function notes(...args: any[]): void;

    function only(...args: any[]): void;

    function optional(...args: any[]): void;

    function optionalKeys(...args: any[]): void;

    function options(...args: any[]): void;

    function or(...args: any[]): void;

    function oxor(...args: any[]): void;

    function pattern(...args: any[]): void;

    function raw(...args: any[]): void;

    function rename(...args: any[]): void;

    function required(...args: any[]): void;

    function requiredKeys(...args: any[]): void;

    function schema(...args: any[]): void;

    function strict(...args: any[]): void;

    function strip(...args: any[]): void;

    function tags(...args: any[]): void;

    function type(...args: any[]): void;

    function unit(...args: any[]): void;

    function unknown(...args: any[]): void;

    function valid(...args: any[]): void;

    function validate(...args: any[]): void;

    function when(...args: any[]): void;

    function without(...args: any[]): void;

    function xor(...args: any[]): void;

}

export namespace extensionsSchema {
    const isImmutable: boolean;

    const isJoi: boolean;

    const schemaType: string;

    function allow(...args: any[]): void;

    function applyFunctionToChildren(...args: any[]): void;

    function checkOptions(...args: any[]): void;

    function clone(...args: any[]): void;

    function concat(...args: any[]): void;

    function createError(...args: any[]): void;

    function createOverrideError(...args: any[]): void;

    function describe(...args: any[]): void;

    function description(...args: any[]): void;

    function disallow(...args: any[]): void;

    function empty(...args: any[]): void;

    function equal(...args: any[]): void;

    function error(...args: any[]): void;

    function example(...args: any[]): void;

    function exist(...args: any[]): void;

    function forbidden(...args: any[]): void;

    function has(...args: any[]): void;

    function invalid(...args: any[]): void;

    function items(...args: any[]): void;

    function label(...args: any[]): void;

    function length(...args: any[]): void;

    function max(...args: any[]): void;

    function meta(...args: any[]): void;

    function min(...args: any[]): void;

    function not(...args: any[]): void;

    function notes(...args: any[]): void;

    function only(...args: any[]): void;

    function optional(...args: any[]): void;

    function options(...args: any[]): void;

    function ordered(...args: any[]): void;

    function raw(...args: any[]): void;

    function required(...args: any[]): void;

    function single(...args: any[]): void;

    function sparse(...args: any[]): void;

    function strict(...args: any[]): void;

    function strip(...args: any[]): void;

    function tags(...args: any[]): void;

    function unique(...args: any[]): void;

    function unit(...args: any[]): void;

    function valid(...args: any[]): void;

    function validate(...args: any[]): void;

    function when(...args: any[]): void;

}

