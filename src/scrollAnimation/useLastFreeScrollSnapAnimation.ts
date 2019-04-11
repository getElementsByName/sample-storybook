import * as React from 'react';
import { getClosestAreaIndexFromPoint, getAreaIndexByPoint, getAreaStartPointIndex } from '../util/findArea';
import { getScrollPosition } from '../util/getScrollPosition';
import { getLastFreeScrollSnapAnimationInfo } from './getLastFreeScrollSnapAnimationInfo';
import { useScrollAnimationEventWatcher } from '../eventManager/scrollAnimationTriggerEvent/useScrollAnimationEventWatcher';
import { smoothScroll } from './scrollAnimation';
import { ScrollContainerElementType } from '../eventManager/domScrollEvent/useDOMScrollEventWatcher';

interface ArgumentType {
    snapPointList: number[];
    wheelEndDebounceTime?: number;
    scrollEndDebounceTime?: number;
    animationTriggerMinSpeedY: number;
    animationDurationMs: number;
    scrollContainerElement: ScrollContainerElementType;
}

function useLastFreeScrollSnapAnimation({
    snapPointList,
    wheelEndDebounceTime,
    scrollEndDebounceTime,
    animationDurationMs,
    animationTriggerMinSpeedY = 0.1,
    scrollContainerElement,
}: ArgumentType) {
    const START_AREA_ACCEPT_OFFSET = 10;

    const cancelCallbackRef = React.useRef<Function | null>(null);
    const allCancelCallbackRef = React.useRef<Function>(() => {
        cancelCallbackRef.current !== null && cancelCallbackRef.current();
        cancelCallbackRef.current = null;
    });

    const {
        event,
        scrollAnimationEndTrigger,
        userScrollStartPosition,
        scrollAnimationStartPosition,
        scrollAnimationEndPosition,
        domScrollEvent,
        userScrollTriggerEvent,
    } = useScrollAnimationEventWatcher({
        scrollContainerElement: scrollContainerElement,
        wheelEndDebounceTime: wheelEndDebounceTime,
        scrollEndDebounceTime: scrollEndDebounceTime,
        minSpeedY: animationTriggerMinSpeedY,
        cancelCallbackRef: allCancelCallbackRef,
    });

    const animationEndCallbackRef = React.useRef<Function>(() => {
        scrollAnimationEndTrigger();
        cancelCallbackRef.current = null;
    });

    const animateScrollRef = React.useRef(({ y }: { y: number }) => {
        allCancelCallbackRef.current(); // 이전 애니매이션 종료

        const { cancel } = smoothScroll({
            scrollContainerElement: window,
            end: {
                y,
            },
            scrollTime: animationDurationMs,
            callback: animationEndCallbackRef.current,
        });

        cancelCallbackRef.current = cancel;
    });

    const animationEventName = event && event.eventName;

    // animation start
    React.useEffect(() => {
        if (animationEventName === 'start') {
            if (userScrollStartPosition && scrollAnimationStartPosition) {
                const animationInfo = getLastFreeScrollSnapAnimationInfo({
                    endPosition: scrollAnimationStartPosition.y,
                    startPosition: userScrollStartPosition.y,
                    outDeltaOffset: 10,
                    startAreaAcceptOffset: START_AREA_ACCEPT_OFFSET,
                    snapPointList: snapPointList,
                });

                if (animationInfo !== null) {
                    // console.log('user scroll animation trigger')
                    animateScrollRef.current({ y: animationInfo.animationTargetPosition });

                    return;
                }
            }
            animationEndCallbackRef.current();
        }
    }, [
        animationDurationMs,
        animationEventName,
        scrollAnimationEndTrigger,
        scrollAnimationStartPosition,
        snapPointList,
        userScrollStartPosition,
    ]);

    return {
        animationEvent: event,
        animateScroll: animateScrollRef.current,
    };
}

export { useLastFreeScrollSnapAnimation };
