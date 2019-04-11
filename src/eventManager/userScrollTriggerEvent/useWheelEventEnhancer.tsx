import * as React from 'react';
import { ScrollListenableContainerElementType } from '../../util/getScrollPosition';
import { EventWithPhase } from '../EventPhase';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';
import { useContinuousEventPhase } from '../../util/useContinuousEventPhase';

interface ArgumentsType {
    element: ScrollListenableContainerElementType;
    wheelEndDebounceTime?: number;
}

const useWheelEventEnhancer = ({ element: scrollContainerElement, wheelEndDebounceTime = 1000 }: ArgumentsType) => {
    const [event, setEvent] = React.useState<EventWithPhase<WheelEvent | null>>({
        eventName: 'end',
        originalEvent: null,
    });

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
            if (event.eventName !== 'end') {
                setEvent({
                    eventName: 'end',
                    originalEvent: wheelEvent,
                });
            }
        }
    }, [wheelPhase, wheelEvent, event.eventName]);

    useDOMEventHandler(scrollContainerElement, 'mousewheel', wheelEventPhase && wheelEventPhase.triggerCallback); // IE9, Chrome, Safari, Opera
    useDOMEventHandler(scrollContainerElement, 'DOMMouseScroll', wheelEventPhase && wheelEventPhase.triggerCallback); // Firefox

    return event;
};

export { useWheelEventEnhancer };
