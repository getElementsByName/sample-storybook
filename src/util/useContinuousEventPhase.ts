import * as React from 'react';
import { debounce } from './debounce';

type PhaseName = 'start' | 'progress' | 'end';

interface ArgumentsType<T, R> {
    debounceTime: number;
}

const INIT_STATUS = {
    isFirst: true,
    isReady: true,
    functionArgument: null,
};

function useContinuousEventPhase<T, R>({ debounceTime }: ArgumentsType<T, R>) {
    interface DebounceCallbackFromStateType {
        // A function argument is special in useState() for merging objects with prev one & new one
        callback: Function;
    }
    const [debounceCallback, setDebounceCallback] = React.useState<null | DebounceCallbackFromStateType>(null);

    interface StatusType {
        isReady: boolean;
        isFirst: boolean;
        functionArgument: null | T;
    }

    const [status, setStatus] = React.useState<StatusType>(INIT_STATUS);

    React.useEffect(() => {
        const newDebounceCallback = debounce(() => {
            // END
            setStatus(prev => ({ ...prev, ...{ isReady: true, isFirst: true } }));
        }, debounceTime);

        setDebounceCallback({
            callback: newDebounceCallback,
        });

        return () => {
            setDebounceCallback(null);
            setStatus(INIT_STATUS);
        };
    }, [debounceTime]);

    const [state, triggerCallback] = React.useReducer((state, action: T) => {
        // TRIGGER EVENT
        if (debounceCallback) {
            debounceCallback.callback(action);
        }

        if (status.isReady) {
            setStatus(prev => ({ ...prev, ...{ isReady: false, functionArgument: action } }));
        } else if (status.isFirst) {
            setStatus(prev => ({ ...prev, ...{ isFirst: false, functionArgument: action } }));
        } else {
            setStatus(prev => ({ ...prev, ...{ functionArgument: action } }));
        }

        return null;
    }, null);

    let phaseName: PhaseName;
    if (status.isReady === false && status.isFirst) {
        phaseName = 'start';
    } else if (status.isReady && status.isFirst) {
        phaseName = 'end';
    } else {
        phaseName = 'progress';
    }

    return {
        functionArgument: status.functionArgument,
        triggerCallback,
        phase: phaseName,
    };
}

export { useContinuousEventPhase };
