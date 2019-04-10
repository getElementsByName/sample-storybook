import * as React from 'react';
import { ScrollContainerElementType } from '../../util/getScrollPosition';
import { UserScrollTriggerEvent, UserScrollTriggerEventType } from './UserScrollTriggerEvent';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';
import { useContinuousEventPhase } from '../../util/useContinuousEventPhase';

const eventNameMappingTable = {
    touchstart: ['start'],
    touchmove: ['move'],
    touchend: ['end'],
    touchcancel: ['end'],
    mousewheel: ['start', 'move'],
    DOMMouseScroll: ['start', 'move'],
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
        eventName: 'end',
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
                eventName: 'start',
                originalEvent: wheelEvent,
            });
        } else if (wheelPhase === 'progress') {
            setEvent({
                eventName: 'move',
                originalEvent: wheelEvent,
            });
        } else {
            setEvent({
                eventName: 'end',
                originalEvent: wheelEvent,
            });
        }
    }, [wheelPhase, wheelEvent]);

    useDOMEventHandler(scrollContainerElement, 'mousewheel', wheelEventPhase && wheelEventPhase.triggerCallback); // IE9, Chrome, Safari, Opera
    useDOMEventHandler(scrollContainerElement, 'DOMMouseScroll', wheelEventPhase && wheelEventPhase.triggerCallback); // Firefox

    return event;
};

export { useUserScrollTriggerEventWatcher, UserScrollTriggerEvent };
