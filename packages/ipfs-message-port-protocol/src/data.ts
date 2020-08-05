export type JSONObject = { [key: string]: JSONValue }
export type JSONArray = Array<JSONValue>
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONArray
  | JSONObject

export type Encoded<_Data, Representation> = Representation
export type StringEncoded<T> = Encoded<T, string>

export type UnixFSTime = {
  secs: number
  nsecs: number
}

export type LooseUnixFSTime = {
  secs: number
  nsecs?: number
}

export type HRTime = [number, number]

export type Time = Date | LooseUnixFSTime | HRTime
export type Mode = string | number
export type HashAlg = string
export type FileType = 'directory' | 'file'
export type CIDVersion = 0 | 1

export type Result<X, T> = { ok: true; value: T } | { ok: false; error: X }

export type EncodedError = {
  message: string
  name: string
  stack: string
}
