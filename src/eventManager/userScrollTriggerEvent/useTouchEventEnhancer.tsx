import * as React from 'react';
import { ScrollListenableContainerElementType } from '../../util/getScrollPosition';
import { EventWithPhase } from '../EventPhase';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';

const eventNameMappingTable = {
    touchstart: ['start'],
    touchmove: ['move'],
    touchend: ['end'],
    touchcancel: ['end'],
};

type EventHandlerType = (event: EventWithPhase<TouchEvent | null>) => void;

const useEventHandler = (
    scrollContainerElement: ScrollListenableContainerElementType,
    eventName: string,
    eventHandler: EventHandlerType,
) => {
    const eventHandlerRef = React.useRef((event: TouchEvent) => {
        const originalEventName = event.type;
        const resultEventNameList = eventNameMappingTable[originalEventName];

        for (let key in resultEventNameList) {
            eventHandler({
                eventName: resultEventNameList[key],
                originalEvent: event,
            });
        }
    });
    useDOMEventHandler(scrollContainerElement, eventName, eventHandlerRef.current);
};

interface ArgumentsType {
    element: ScrollListenableContainerElementType;
}

const useTouchEventEnhancer = ({ element: scrollContainerElement }: ArgumentsType) => {
    const [event, setEvent] = React.useState<EventWithPhase<TouchEvent | null>>({
        eventName: 'end',
        originalEvent: null,
    });

    useEventHandler(scrollContainerElement, 'touchstart', setEvent);
    useEventHandler(scrollContainerElement, 'touchmove', setEvent);
    useEventHandler(scrollContainerElement, 'touchend', setEvent);
    useEventHandler(scrollContainerElement, 'touchcancel', setEvent);

    return event;
};

export { useTouchEventEnhancer };
