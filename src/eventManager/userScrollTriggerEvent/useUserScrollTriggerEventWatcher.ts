import * as React from 'react';
import { ScrollContainerElementType } from '../domScrollEvent/ScrollEvent';
import { UserScrollTriggerEvent, UserScrollTriggerEventType } from './UserScrollTriggerEvent';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';
import { debounce } from '../../util/debounce';

const eventNameMappingTable = {
    touchstart: ['user-scroll:start'],
    touchmove: ['user-scroll:move'],
    touchend: ['user-scroll:end'],
    touchcancel: ['user-scroll:end'],
    mousewheel: ['user-scroll:start', 'user-scroll:move'],
    DOMMouseScroll: ['user-scroll:start', 'user-scroll:move'],
};

type EventHandlerType = (event: UserScrollTriggerEvent) => void;
const useEventHandler = (
    scrollContainerElement: ScrollContainerElementType,
    eventName: string,
    eventHandler: EventHandlerType,
) => {
    const eventHandlerCached = React.useCallback(
        (event: TouchEvent) => {
            const originalEventName = event.type;
            const resultEventNameList = eventNameMappingTable[originalEventName];

            for (let key in resultEventNameList) {
                eventHandler({
                    eventName: resultEventNameList[key],
                    originalEvent: event,
                });
            }
        },
        [eventHandler],
    );

    useDOMEventHandler(scrollContainerElement, eventName, eventHandlerCached);
};

interface ArgumentsType {
    scrollContainerElement: ScrollContainerElementType;
    wheelEndDebounceTime?: number;
}

const useUserScrollTriggerEventWatcher = ({ scrollContainerElement, wheelEndDebounceTime = 1000 }: ArgumentsType) => {
    const [event, setEvent] = React.useState<UserScrollTriggerEvent<UserScrollTriggerEventType | null>>({
        eventName: 'user-scroll:end',
        originalEvent: null,
    });

    useEventHandler(scrollContainerElement, 'touchstart', setEvent);
    useEventHandler(scrollContainerElement, 'touchmove', setEvent);
    useEventHandler(scrollContainerElement, 'touchend', setEvent);
    useEventHandler(scrollContainerElement, 'touchcancel', setEvent);

    // wheel: start | move
    useEventHandler(scrollContainerElement, 'mousewheel', setEvent); // IE9, Chrome, Safari, Opera

    useEventHandler(scrollContainerElement, 'DOMMouseScroll', setEvent); // Firefox

    // wheel debounce: end
    type DebounceScrollEndHandlerType = (event: WheelEvent) => void;

    interface DebounceCallbackFromStateType {
        // A function argument is special in useState() for merging objects with prev one & new one
        callback: DebounceScrollEndHandlerType;
    }
    const [scrollEndFromWheel, setScrollEndFromWheel] = React.useState<null | DebounceCallbackFromStateType>(null);

    React.useEffect(() => {
        const newDebounceCallback = debounce((event: WheelEvent) => {
            setEvent({
                eventName: 'user-scroll:end',
                originalEvent: event,
            });
        }, wheelEndDebounceTime);

        setScrollEndFromWheel({
            callback: newDebounceCallback,
        });

        return () => {
            setScrollEndFromWheel(null);
        };
    }, [wheelEndDebounceTime]);

    useDOMEventHandler(scrollContainerElement, 'mousewheel', scrollEndFromWheel && scrollEndFromWheel.callback);
    useDOMEventHandler(scrollContainerElement, 'DOMMouseScroll', scrollEndFromWheel && scrollEndFromWheel.callback);

    return event;
};

export { useUserScrollTriggerEventWatcher, UserScrollTriggerEvent };
