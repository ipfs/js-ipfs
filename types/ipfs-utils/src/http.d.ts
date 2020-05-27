type Body = any
type APIOptions = {
  body?: BodyInit
  json?: JSON
  method?: string
  base?:string
  headers?:Headers|Record<string, string>  
  timeout?:number
  signal?:AbortSignal
  searchParams?:URLSearchParams|Record<string, number|string|boolean|number[]|string[]|boolean[]>
  credentials?:string
  throwHttpErrors?:boolean
  transformSearchParams?:(params:URLSearchParams) => URLSearchParams 
  transform?:(body:BodyInit) => BodyInit
  handleError?:(response:Response) => Promise<void>
}

type Resource = string | URL | Request

declare class HTTP {
  constructor(options?:APIOptions)
  fetch(resource:Resource, options?:APIOptions):Promise<Response>
  post(resource:Resource, options?:APIOptions):Promise<Response>
  get(resource:Resource, options?:APIOptions):Promise<Response>
  put(resource:Resource, options?:APIOptions):Promise<Response>
  delete(resource:Resource, options?:APIOptions):Promise<Response>
  options(resource:Resource, options?:APIOptions):Promise<Response>

  static fetch(resource:Resource, options?:APIOptions):Promise<Response>
  static post(resource:Resource, options?:APIOptions):Promise<Response>
  static get(resource:Resource, options?:APIOptions):Promise<Response>
  static put(resource:Resource, options?:APIOptions):Promise<Response>
  static delete(resource:Resource, options?:APIOptions):Promise<Response>
  static options(resource:Resource, options?:APIOptions):Promise<Response>

  static HTTPError: typeof HTTPError
  static TimeoutError: typeof TimeoutError
}

declare class HTTPError extends Error {
  name: "HTTPError"
  response: Response
}

declare class TimeoutError extends Error {
  name: "TimeoutError"
}


export = HTTP