import * as React from 'react';
import { ScrollAnimationEvent } from './ScrollAnimationEvent';
import { useDOMScrollEventWatcher, ScrollContainerElementType } from '../domScrollEvent/useDOMScrollEventWatcher';
import { useUserScrollTriggerEventWatcher } from '../userScrollTriggerEvent/useUserScrollTriggerEventWatcher';
import { PositionXY, getScrollPosition } from '../../util/getScrollPosition';

interface ArgumentsType {
    scrollContainerElement: ScrollContainerElementType;
    scrollEndDebounceTime?: number;
    wheelEndDebounceTime?: number;
    minSpeedY?: number;
    minSpeedX?: number;
    cancelCallbackRef?: React.RefObject<Function | null>;
}

const useScrollAnimationEvent = ({
    scrollEndDebounceTime,
    wheelEndDebounceTime,
    scrollContainerElement,
    minSpeedY,
    minSpeedX,
    cancelCallbackRef,
}: ArgumentsType) => {
    const [event, setEvent] = React.useState<ScrollAnimationEvent | null>(null);
    const [isStartAnimation, setIsStartAnimation] = React.useState<boolean>(false);
    const [isEndAnimation, setIsEndAnimation] = React.useState<boolean>(false);
    const [isReady, setReady] = React.useState<boolean>(false);
    const [userScrollStartPosition, setUserScrollStartPosition] = React.useState<PositionXY | null>(null);
    const [scrollAnimationStartPosition, setScrollAnimationStartPosition] = React.useState<PositionXY | null>(null);
    const [scrollAnimationEndPosition, setScrollAnimationEndPosition] = React.useState<PositionXY | null>(null);

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
            setScrollAnimationStartPosition(getScrollPosition(scrollContainerElement));
        }
    }, [isStartAnimation, scrollContainerElement]);

    const scrollAnimationEndTrigger = React.useCallback(() => {
        setIsEndAnimation(true);
        setIsStartAnimation(false);
        setReady(false);

        setEvent({
            eventName: 'end',
        });
        setScrollAnimationEndPosition(getScrollPosition(scrollContainerElement));
    }, []);

    if (userScrollTriggerEvent.eventName === 'user-scroll:start') {
        if (isReady !== true) {
            setReady(true);
            setUserScrollStartPosition(getScrollPosition(scrollContainerElement));
        }

        if (isEndAnimation === true) {
            setIsEndAnimation(false);
        }

        if (isStartAnimation == true && isEndAnimation === false) {
            cancelCallbackRef && cancelCallbackRef.current && cancelCallbackRef.current(); // TODO: once
            scrollAnimationEndTrigger();
        }
    } else if (isReady && isEndAnimation === false && userScrollTriggerEvent.eventName === 'user-scroll:end') {
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
            // without minSpeed
            setStart();
        }
    }

    return {
        event,
        scrollAnimationEndTrigger,
        userScrollStartPosition,
        scrollAnimationStartPosition,
        scrollAnimationEndPosition,
    };
};

export { useScrollAnimationEvent };
