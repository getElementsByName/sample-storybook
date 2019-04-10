import * as React from 'react';
import { ScrollContainerElementType } from '../../util/getScrollPosition';
import { UserScrollTriggerEvent, UserScrollTriggerEventType } from './UserScrollTriggerEvent';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';
import { useContinuousEventPhase } from '../../util/useContinuousEventPhase';
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
    const eventHandlerCached = React.useCallback((event: TouchEvent) => {
        const originalEventName = event.type;
        const resultEventNameList = eventNameMappingTable[originalEventName];

        for (let key in resultEventNameList) {
            eventHandler({
                eventName: resultEventNameList[key],
                originalEvent: event,
            });
        }
    }, []);

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
    const wheelEventPhase = useContinuousEventPhase<WheelEvent, void>({
        debounceTime: wheelEndDebounceTime,
    });

    const wheelPhase = wheelEventPhase && wheelEventPhase.phase;
    const wheelEvent = wheelEventPhase && wheelEventPhase.functionArgument;

    React.useEffect(() => {
        if (wheelPhase === 'start') {
            setEvent({
                eventName: 'user-scroll:start',
                originalEvent: wheelEvent,
            });
        } else if (wheelPhase === 'progress') {
            setEvent({
                eventName: 'user-scroll:move',
                originalEvent: wheelEvent,
            });
        } else {
            setEvent({
                eventName: 'user-scroll:end',
                originalEvent: wheelEvent,
            });
        }
    }, [wheelPhase, wheelEvent]);

    useDOMEventHandler(scrollContainerElement, 'mousewheel', wheelEventPhase && wheelEventPhase.triggerCallback); // IE9, Chrome, Safari, Opera
    useDOMEventHandler(scrollContainerElement, 'DOMMouseScroll', wheelEventPhase && wheelEventPhase.triggerCallback); // Firefox

    return event;
};

export { useUserScrollTriggerEventWatcher, UserScrollTriggerEvent };
