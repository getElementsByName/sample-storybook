import * as React from 'react';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';
import { ScrollEvent, ScrollStartEvent, ScrollMoveEvent } from './ScrollEvent';
import { getScrollPosition, ScrollListenableContainerElementType, PositionXY } from '../../util/getScrollPosition';
import { debounce } from '../../util/debounce';

interface ArgumentsType {
    scrollContainerElement: ScrollListenableContainerElementType;
    debounceTime?: number;
}

const useDOMScrollEventWatcher = ({ scrollContainerElement, debounceTime = 300 }: ArgumentsType) => {
    const [event, setEvent] = React.useState<ScrollEvent<Event | null>>({
        eventName: 'end',
        originalEvent: null,
    });

    const latestScrollTimeRef = React.useRef<number | null>(null);
    const positionRef = React.useRef<PositionXY>(getScrollPosition(scrollContainerElement));

    // start, move
    const scrollHandler = React.useCallback((event: Event) => {
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
                eventName: 'move',
                originalEvent: event,

                scrollY: newPosition.y,
                scrollX: newPosition.x,
                speedY: deltaPosition.y / deltaTime,
                speedX: deltaPosition.x / deltaTime,
            };
        } else {
            resultEvent = {
                eventName: 'start',
                originalEvent: event,

                scrollY: positionRef.current.y,
                scrollX: positionRef.current.x,
            };
        }

        latestScrollTimeRef.current = eventTime;
        positionRef.current = newPosition;
        setEvent(resultEvent);
    }, []);

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
                eventName: 'end',
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

export { useDOMScrollEventWatcher, ScrollEvent, ScrollListenableContainerElementType };
