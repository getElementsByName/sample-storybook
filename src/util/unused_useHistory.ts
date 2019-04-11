import * as React from 'react';

interface ArgumentType<T> {
    data: T;
    isChange: (preOne: T, newOne: T) => boolean;
}
function useHistory<T>({ data, isChange }: ArgumentType<T>) {
    const startDataRef = React.useRef<T>(data);
    const previousDataRef = React.useRef<T>(data);

    React.useEffect(() => {
        if (isChange(previousDataRef.current, data)) {
            previousDataRef.current = data;
        }
    }, [data, isChange]);

    const [state, resetStart] = React.useReducer((state, startData: T) => {
        startDataRef.current = startData;
        return null;
    }, null);

    return {
        startData: startDataRef.current,
        previousData: previousDataRef.current,
        nowData: data,
        resetStart,
    };
}

export { useHistory };
