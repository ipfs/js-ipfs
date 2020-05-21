
export = merge_options;

interface MergeOptions {
   <a, b>(left: a, right:b): a & b;
   call<a, b>(_:any, left: a, right:b): a & b;
}

declare var merge_options:MergeOptions

