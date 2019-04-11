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
        cancelCallbackRef,
    });

    const animationEventName = event && event.eventName;

    // animation start
    React.useEffect(() => {
        if (animationEventName === 'start') {
            if (userScrollStartPosition && scrollAnimationStartPosition) {
                const animationInfo = getLastFreeScrollSnapAnimationInfo({
                    endPosition: scrollAnimationStartPosition.y,
                    startPosition: userScrollStartPosition.y,
                    outDeltaOffset: 50,
                    startAreaAcceptOffset: START_AREA_ACCEPT_OFFSET,
                    snapPointList: snapPointList,
                });

                if (animationInfo !== null) {
                    const { cancel } = smoothScroll({
                        scrollContainerElement: window,
                        end: {
                            y: animationInfo.animationTargetPosition,
                        },
                        scrollTime: animationDurationMs,
                        callback: scrollAnimationEndTrigger,
                    });

                    cancelCallbackRef.current = cancel;

                    return;
                }
            }
            scrollAnimationEndTrigger();
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
    };
}

export { useLastFreeScrollSnapAnimation };
