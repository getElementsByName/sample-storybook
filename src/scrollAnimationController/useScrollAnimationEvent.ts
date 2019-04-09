import * as React from 'react';
import { ScrollAnimationEvent } from './ScrollAnimationEvent';
import {
    useDOMScrollEventWatcher,
    ScrollContainerElementType,
} from '../eventManager/domScrollEvent/useDOMScrollEventWatcher';
import { useUserScrollTriggerEventWatcher } from '../eventManager/userScrollTriggerEvent/useUserScrollTriggerEventWatcher';

interface ArgumentsType {
    scrollContainerElement: ScrollContainerElementType;
    scrollEndDebounceTime?: number;
    wheelEndDebounceTime?: number;
    minSpeedY?: number;
    minSpeedX?: number;
}

const useScrollAnimationEvent = ({
    scrollEndDebounceTime,
    wheelEndDebounceTime,
    scrollContainerElement,
    minSpeedY,
    minSpeedX,
}: ArgumentsType) => {
    const [event, setEvent] = React.useState<ScrollAnimationEvent | null>(null);
    const [isStartAnimation, setIsStartAnimation] = React.useState<boolean>(false);
    const [isEndAnimation, setIsEndAnimation] = React.useState<boolean>(true);

    const userScrollTriggerEvent = useUserScrollTriggerEventWatcher({
        scrollContainerElement: scrollContainerElement,
        wheelEndDebounceTime: wheelEndDebounceTime,
    });

    const domScrollEvent = useDOMScrollEventWatcher({
        debounceTime: scrollEndDebounceTime,
        scrollContainerElement: scrollContainerElement,
    });

    // after user event end
    if (userScrollTriggerEvent.eventName === 'user-scroll:end') {
        if (domScrollEvent.eventName === 'scroll:move') {
            if (
                (minSpeedY !== undefined && domScrollEvent.scrollY < minSpeedY) ||
                (minSpeedX !== undefined && domScrollEvent.scrollX < minSpeedX)
            ) {
                if (isStartAnimation === false) {
                    setIsStartAnimation(true);
                }
            }
        } else if (domScrollEvent.eventName === 'scroll:end') {
            // first time after move
            if (isEndAnimation === false) {
                // applied minSpeed
                if (isStartAnimation === true) {
                    setIsStartAnimation(false); // TODO: animation end
                } else {
                    // without minSpeed
                    setIsStartAnimation(true);
                }

                setIsEndAnimation(true); // TODO: animation end
            }
        }
    }

    if (isStartAnimation) {
        return {
            eventName: 'start',
        };
    }

    return {
        eventName: 'end',
    };
};

export { useScrollAnimationEvent };
