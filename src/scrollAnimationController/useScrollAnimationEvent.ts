import * as React from 'react';
import { ScrollAnimationEvent } from './ScrollAnimationEvent';
import {
    useDOMScrollEventWatcher,
    ScrollContainerElementType,
} from '../eventManager/domScrollEvent/useDOMScrollEventWatcher';
import { useUserScrollTriggerEventWatcher } from '../eventManager/userScrollTriggerEvent/useUserScrollTriggerEventWatcher';
import { useContinuousEventPhase } from '../util/useContinuousEventPhase';

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
    const [isEndAnimation, setIsEndAnimation] = React.useState<boolean>(false);

    const userScrollTriggerEvent = useUserScrollTriggerEventWatcher({
        scrollContainerElement: scrollContainerElement,
        wheelEndDebounceTime: wheelEndDebounceTime,
    });

    const domScrollEvent = useDOMScrollEventWatcher({
        debounceTime: scrollEndDebounceTime,
        scrollContainerElement: scrollContainerElement,
    });

    if (userScrollTriggerEvent.eventName === 'user-scroll:start') {
        if (isEndAnimation === true) {
            setIsEndAnimation(false);
        }
    } else if (userScrollTriggerEvent.eventName === 'user-scroll:end') {
        // after user event end
        if (domScrollEvent.eventName === 'scroll:move') {
            // console.log('domScrollEvent.speedY', Math.abs(domScrollEvent.speedY));

            if (
                (minSpeedY !== undefined && Math.abs(domScrollEvent.speedY) < minSpeedY) ||
                (minSpeedX !== undefined && Math.abs(domScrollEvent.speedX) < minSpeedX)
            ) {
                if (isStartAnimation === false) {
                    setIsStartAnimation(true);
                    setEvent({
                        eventName: 'start',
                    });
                }
            }
        } else if (domScrollEvent.eventName === 'scroll:end') {
            // first time after move
            if (isEndAnimation === false) {
                // applied minSpeed
                if (isStartAnimation === true) {
                    setIsStartAnimation(false); // TODO: animation end
                    setIsEndAnimation(true);
                    setEvent({
                        eventName: 'end',
                    });
                } else {
                    // without minSpeed
                    setIsStartAnimation(true);
                    setEvent({
                        eventName: 'start',
                    });
                }
            }
        }
    }

    return event;
};

export { useScrollAnimationEvent };
