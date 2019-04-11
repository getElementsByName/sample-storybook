import * as React from 'react';

import { useUserScrollTriggerEventWatcher } from '../userScrollTriggerEvent/useUserScrollTriggerEventWatcher';
import {
    useDOMScrollEventWatcher,
    ScrollListenableContainerElementType,
} from '../domScrollEvent/useDOMScrollEventWatcher';
import { EventWithPhase } from '../EventPhase';
import { getScrollPosition } from '../../util/getScrollPosition';

interface ArgumentsType {
    scrollContainerElement: ScrollListenableContainerElementType;
}

interface PositionXY {
    x: number;
    y: number;
}
interface ScrollChangeEvent {
    nowPosition: PositionXY;
    startPosition: PositionXY;
}

type EventType = EventWithPhase<ScrollChangeEvent | null>;

const useScrollChangeByUser = ({ scrollContainerElement }: ArgumentsType) => {
    const [event, setEvent] = React.useState<EventType>({
        eventName: 'end',
        originalEvent: null,
    });

    const startPositionRef = React.useRef(getScrollPosition(scrollContainerElement));

    const userScrollTriggerEvent = useUserScrollTriggerEventWatcher({
        scrollContainerElement,
    });
    const domScrollEvent = useDOMScrollEventWatcher({
        scrollContainerElement,
        // debounceTime
    });

    React.useEffect(() => {
        if (userScrollTriggerEvent.eventName !== 'end' && domScrollEvent.eventName !== 'end') {
            if (event.eventName === 'end') {
                setEvent({
                    eventName: 'start',
                    originalEvent: {
                        nowPosition: {
                            x: domScrollEvent.scrollX,
                            y: domScrollEvent.scrollY,
                        },
                        startPosition: startPositionRef.current,
                    },
                });
            } else {
                if (
                    // 위치 값이 변경된 경우만
                    event.originalEvent && // TODO: typing 해서 제거
                    (event.originalEvent.nowPosition.x !== domScrollEvent.scrollX ||
                        event.originalEvent.nowPosition.y !== domScrollEvent.scrollY)
                ) {
                    setEvent({
                        eventName: 'move',
                        originalEvent: {
                            nowPosition: {
                                x: domScrollEvent.scrollX,
                                y: domScrollEvent.scrollY,
                            },
                            startPosition: startPositionRef.current,
                        },
                    });
                }
            }
        }

        if (userScrollTriggerEvent.eventName === 'end') {
            const nowPosition = getScrollPosition(scrollContainerElement);
            const startPosition = startPositionRef.current;

            if (event.eventName !== 'end') {
                setEvent({
                    eventName: 'end',
                    originalEvent: {
                        nowPosition,
                        startPosition: startPosition,
                    },
                });
            }

            startPositionRef.current = nowPosition;
        }
    }, [
        event.eventName,
        userScrollTriggerEvent.eventName,
        domScrollEvent,
        scrollContainerElement,
        event.originalEvent,
    ]);

    return event;
};

export { useScrollChangeByUser };
