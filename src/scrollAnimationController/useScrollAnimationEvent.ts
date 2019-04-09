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

    const setStart = React.useCallback(() => {
        if (isStartAnimation === false) {
            setIsStartAnimation(true);
            setEvent({
                eventName: 'start',
            });
        }
    }, [isStartAnimation]);

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
                setStart();
            }
        } else if (domScrollEvent.eventName === 'scroll:end') {
            if (isEndAnimation === false) {
                // without minSpeed
                setStart();
            }
        }
    }

    const scrollAnimationEndTrigger = React.useCallback(() => {
        setIsEndAnimation(true);
        setIsStartAnimation(false);

        setEvent({
            eventName: 'end',
        });
    }, []);

    return {
        event,
        scrollAnimationEndTrigger,
    };
};

export { useScrollAnimationEvent };
