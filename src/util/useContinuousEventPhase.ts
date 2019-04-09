import * as React from 'react';
import { debounce } from './debounce';

type PhaseName = 'start' | 'progress' | 'end';

interface ArgumentsType<T, R> {
    debounceTime: number;
}

function useContinuousEventPhase<T, R>({ debounceTime }: ArgumentsType<T, R>) {
    interface DebounceCallbackFromStateType {
        // A function argument is special in useState() for merging objects with prev one & new one
        callback: Function;
    }
    const [debounceCallback, setDebounceCallback] = React.useState<null | DebounceCallbackFromStateType>(null);
    const [isReady, setIsReady] = React.useState<boolean>(true);
    const [isFirst, setIsFirst] = React.useState<boolean>(true);

    React.useEffect(() => {
        const newDebounceCallback = debounce((args: T) => {
            setIsReady(true);
            setIsFirst(true);
        }, debounceTime);

        setDebounceCallback({
            callback: newDebounceCallback,
        });

        return () => {
            setDebounceCallback(null);
        };
    }, [debounceTime]);

    const triggerCallback = React.useCallback(
        (args: T) => {
            if (debounceCallback) {
                debounceCallback.callback(args);
            }

            if (isReady) {
                setIsReady(false);
            }

            if (isReady === false && isFirst) {
                setIsFirst(false);
            }
        },
        [debounceCallback, isReady],
    );

    let phaseName: PhaseName;
    if (isReady) {
        phaseName = 'end';
    } else if (isFirst) {
        phaseName = 'start';
    } else {
        phaseName = 'progress';
    }

    return {
        triggerCallback,
        phase: phaseName,
    };
}
