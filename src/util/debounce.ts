// original source code: https://davidwalsh.name/javascript-debounce-function

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce<T extends Function>(func: T, wait: number, immediate?: boolean) {
  let timeout: any;

  return (((...args: any[]) => {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(null, args);
    };
    const callNow = immediate && !timeout;
    timeout && clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(null, args);
  }) as any) as T;
}
