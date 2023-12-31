export function findInArray(
  array: Array<any> | TouchList,
  callback: Function
): any {
  for (let i = 0, length = array.length; i < length; i++) {
    if (callback.apply(callback, [array[i], i, array])) return array[i];
  }
}

export function isFunction(func: any): func is Function {
  return (
    typeof func === "function" ||
    Object.prototype.toString.call(func) === "[object Function]"
  );
}

export function isNum(num: any): num is number {
  return typeof num === "number" && !isNaN(num);
}

export function int(a: string): number {
  return parseInt(a, 10);
}
