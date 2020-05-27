type GlobOptions = {
  recursive?:boolean
  hidden?:boolean
  ignore?:string[]
  followSymlinks?:boolean
  preserveMode?:boolean
  preserveMtime?:boolean
  mode?:boolean
  mtime?:boolean
}

type FileObject = {
  path: string
  content: AsyncIterable<Buffer>
}

declare function globSource(paths:Iterable<string>|AsyncIterable<string>|string, options?:GlobOptions):AsyncIterable<FileObject>

export = globSource