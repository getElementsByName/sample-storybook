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

const useScrollAnimationEventWatcher = ({
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
    const isScrollMovedRef = React.useRef(false);

    const userScrollTriggerEvent = useUserScrollTriggerEventWatcher({
        scrollContainerElement: scrollContainerElement,
        wheelEndDebounceTime: wheelEndDebounceTime,
    });

    const domScrollEvent = useDOMScrollEventWatcher({
        debounceTime: scrollEndDebounceTime,
        scrollContainerElement: scrollContainerElement,
    });

    const setStart = React.useCallback(() => {
        if (isStartAnimation === false && isScrollMovedRef.current === true) {
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

    if (userScrollTriggerEvent.eventName === 'start') {
        cancelCallbackRef && cancelCallbackRef.current && cancelCallbackRef.current(); // TODO: once

        if (isReady !== true) {
            setReady(true);
            setUserScrollStartPosition(getScrollPosition(scrollContainerElement));
        }

        if (isEndAnimation === true) {
            setIsEndAnimation(false);
        }

        if (isStartAnimation == true && isEndAnimation === false) {
            scrollAnimationEndTrigger();
        }
    }

    if (
        isReady &&
        isEndAnimation === false &&
        userScrollTriggerEvent.eventName === 'move' &&
        domScrollEvent.eventName === 'move'
    ) {
        if (
            userScrollStartPosition !== null &&
            (userScrollStartPosition.x !== domScrollEvent.scrollX ||
                userScrollStartPosition.y !== domScrollEvent.scrollY)
        ) {
            isScrollMovedRef.current = true;
        }
    }

    if (isScrollMovedRef.current && isEndAnimation === true && userScrollTriggerEvent.eventName === 'end') {
        isScrollMovedRef.current = false;
    }

    if (isReady && isEndAnimation === false && userScrollTriggerEvent.eventName === 'end') {
        // after user event end
        if (domScrollEvent.eventName === 'move') {
            if (
                (minSpeedY !== undefined && Math.abs(domScrollEvent.speedY) < minSpeedY) ||
                (minSpeedX !== undefined && Math.abs(domScrollEvent.speedX) < minSpeedX)
            ) {
                setStart();
            }
        } else if (domScrollEvent.eventName === 'end') {
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
        domScrollEvent,
        userScrollTriggerEvent,
    };
};

export { useScrollAnimationEventWatcher };
