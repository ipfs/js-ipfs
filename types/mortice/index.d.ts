export = mortice;

type Options = {
  timeout?:number
  concurrency?:number
  singleProcess?:boolean
}

type Lock = () => void
interface Mutex {
  readLock():Promise<Lock>
  writeLock():Promise<Lock>
}

declare function mortice(name?: string, options?: Options): Mutex;

interface WorkerClass {
  new(script:string):Worker
}

interface WorkerFactory {
  (script:string):Worker
}


declare namespace mortice {
  function Worker(script: string, Impl?: WorkerClass | WorkerFactory):Worker
  export { Options, Mutex, Lock }
}

