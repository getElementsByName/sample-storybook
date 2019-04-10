import * as React from 'react';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';
import {
    ScrollContainerElementType,
    ScrollEvent,
    ScrollStartEvent,
    ScrollMoveEvent,
    // ScrollEndEvent,
} from './ScrollEvent';
import { debounce } from '../../util/debounce';

interface Position {
    y: number;
    x: number;
}

const getScrollPosition = (element: ScrollContainerElementType): Position => {
    if (element === document) {
        return {
            y: window.scrollY,
            x: window.scrollX,
        };
    }

    return {
        y: (element as Element).scrollTop,
        x: (element as Element).scrollLeft,
    };
};

interface ArgumentsType {
    scrollContainerElement: ScrollContainerElementType;
    debounceTime?: number;
}

const useDOMScrollEventWatcher = ({ scrollContainerElement, debounceTime = 300 }: ArgumentsType) => {
    const [event, setEvent] = React.useState<ScrollEvent<Event | null>>({
        eventName: 'scroll:end',
        originalEvent: null,
    });

    const latestScrollTimeRef = React.useRef<number | null>(null);
    const positionRef = React.useRef<Position>(getScrollPosition(scrollContainerElement));

    // start, move
    const scrollHandler = React.useCallback(
        (event: Event) => {
            let resultEvent: ScrollStartEvent | ScrollMoveEvent;
            const newPosition = getScrollPosition(scrollContainerElement);
            const eventTime = event.timeStamp;

            if (latestScrollTimeRef.current) {
                const deltaTime = eventTime - latestScrollTimeRef.current;
                const deltaPosition = {
                    x: newPosition.x - positionRef.current.x,
                    y: newPosition.y - positionRef.current.y,
                };

                resultEvent = {
                    eventName: 'scroll:move',
                    originalEvent: event,

                    scrollY: newPosition.y,
                    scrollX: newPosition.x,
                    speedY: deltaPosition.y / deltaTime,
                    speedX: deltaPosition.x / deltaTime,
                };
            } else {
                resultEvent = {
                    eventName: 'scroll:start',
                    originalEvent: event,

                    scrollY: positionRef.current.x,
                    scrollX: positionRef.current.y,
                };
            }

            latestScrollTimeRef.current = eventTime;
            positionRef.current = newPosition;
            setEvent(resultEvent);
        },
        [], // TODO: latestScrollTime를 private member로 고려했을때, 적합한 지 다시 생각해봐야함
    );

    useDOMEventHandler(scrollContainerElement, 'scroll', scrollHandler);

    // end
    type DebounceScrollEndHandlerType = (event: Event) => void;

    // A function argument is special in useState() for merging objects with prev one & new one
    interface DebounceCallbackFromStateType {
        callback: DebounceScrollEndHandlerType;
    }
    const [debounceCallback, setDebounceCallback] = React.useState<null | DebounceCallbackFromStateType>(null);

    React.useEffect(() => {
        const newDebounceCallback = debounce((event: Event) => {
            latestScrollTimeRef.current = null;

            setEvent({
                eventName: 'scroll:end',
                originalEvent: event,
            });
        }, debounceTime);

        setDebounceCallback({
            callback: newDebounceCallback,
        });

        return () => {
            setDebounceCallback(null);
        };
    }, [debounceTime]);

    useDOMEventHandler(scrollContainerElement, 'scroll', debounceCallback && debounceCallback.callback);

    return event;
};

export { useDOMScrollEventWatcher, ScrollEvent, ScrollContainerElementType };
