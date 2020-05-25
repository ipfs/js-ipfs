

type ErrorCode<C extends string> = Error & { code:C }

declare function err_code <C extends string>(err: Error|string, code?:C): ErrorCode<C>;
declare namespace err_code {
  export { ErrorCode }
}


export = err_code
