import * as React from 'react';

type CallbackType = ((event: Event) => void) | undefined | null;

const useDOMEventHandler = (element: Element | Document, eventName: string, callback: CallbackType) => {
    React.useEffect(() => {
        if (callback) {
            // console.log('addEvent', eventName)
            element.addEventListener(eventName, callback);
        }

        return () => {
            // console.log('removeEventListener');
            if (callback) {
                element.removeEventListener(eventName, callback);
            }
        };
    }, [element, eventName, callback]);
};

export { useDOMEventHandler };
