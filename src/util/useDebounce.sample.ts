import * as React from 'react';
import { debounce } from './debounce';

interface ArgumentsType<T extends Function> {
  callback: T;
  debounceTime: number;
}
function useDebounce<T extends Function>({ callback, debounceTime }: ArgumentsType<T>) {
  const [debounceCallback, setDebounceCallback] = React.useState<null | T>(null);

  React.useEffect(() => {
    setDebounceCallback(debounce(callback, debounceTime));
    return () => {
      setDebounceCallback(null);
    };
  }, [callback, debounceTime]);

  return debounceCallback;
}

export { useDebounce };
