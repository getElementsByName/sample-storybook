import * as React from 'react';
import { getClosestPointIndex } from '../entryDecision/EntryDecisionMaker';
import { getScrollPosition } from '../util/getScrollPosition';
import { getLastFreeScrollSnapAnimationInfo } from './lastFreeScrollSnapAnimation';
import { useScrollAnimationEvent } from '../eventManager/scrollAnimationTriggerEvent/useScrollAnimationEvent';
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
    animationTriggerMinSpeedY = 0.2,
    scrollContainerElement,
}: ArgumentType) {
    const cancelCallbackRef = React.useRef<Function | null>(null);

    const {
        event,
        scrollAnimationEndTrigger,
        userScrollStartPosition,
        scrollAnimationStartPosition,
        scrollAnimationEndPosition,
        domScrollEvent,
        userScrollTriggerEvent,
    } = useScrollAnimationEvent({
        scrollContainerElement: scrollContainerElement,
        wheelEndDebounceTime: wheelEndDebounceTime,
        scrollEndDebounceTime: scrollEndDebounceTime,
        minSpeedY: animationTriggerMinSpeedY,
        cancelCallbackRef,
    });

    // console.log('scrollAnimationEndPosition', scrollAnimationEndPosition);

    const animationEventName = event && event.eventName;

    React.useEffect(() => {
        if (domScrollEvent.eventName === 'scroll:end' && userScrollTriggerEvent.eventName === 'user-scroll:end') {
            if (userScrollStartPosition && scrollAnimationStartPosition) {
                // TODO: from last area && now in last before area ->  animation closest area
                const { minIndex: startAreaIndex } = getClosestPointIndex({
                    pointList: snapPointList,
                    checkPoint: userScrollStartPosition.y,
                });
                const lastSnapListIndex = snapPointList.length;
                if (startAreaIndex === lastSnapListIndex - 1) {
                    const nowPosition = getScrollPosition(scrollContainerElement);
                    if (nowPosition.y < snapPointList[lastSnapListIndex]) {
                        const { minIndex: targetAreaIndex } = getClosestPointIndex({
                            pointList: snapPointList,
                            checkPoint: nowPosition.y,
                        });

                        if (targetAreaIndex !== null) {
                            const { cancel } = smoothScroll({
                                scrollContainerElement: window,
                                end: {
                                    y: snapPointList[targetAreaIndex],
                                },
                                scrollTime: animationDurationMs,
                                callback: scrollAnimationEndTrigger,
                            });

                            cancelCallbackRef.current = cancel;

                            return;
                        }
                    }
                }
            }
        }
    }, [
        animationDurationMs,
        domScrollEvent.eventName,
        scrollAnimationEndTrigger,
        scrollAnimationStartPosition,
        scrollContainerElement,
        snapPointList,
        userScrollStartPosition,
        userScrollTriggerEvent.eventName,
    ]);

    React.useEffect(() => {
        if (animationEventName === 'start') {
            if (userScrollStartPosition && scrollAnimationStartPosition) {
                const animationInfo = getLastFreeScrollSnapAnimationInfo({
                    endPosition: scrollAnimationStartPosition.y,
                    startPosition: userScrollStartPosition.y,
                    outOffset: 50,
                    startOffset: 10,
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
