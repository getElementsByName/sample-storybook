import * as React from 'react';
import { getClosestAreaIndexFromPoint } from '../util/findArea';
import { getScrollPosition } from '../util/getScrollPosition';
import { getLastFreeScrollSnapAnimationInfo } from './lastFreeScrollSnapAnimation';
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
    animationTriggerMinSpeedY = 0.2,
    scrollContainerElement,
}: ArgumentType) {
    const cancelCallbackRef = React.useRef<Function | null>(null);

    const {
        event,
        scrollAnimationEndTrigger,
        userScrollStartPosition,
        scrollAnimationStartPosition,
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

    // adjust position after scroll end
    React.useEffect(() => {
        if (domScrollEvent.eventName === 'end' && userScrollTriggerEvent.eventName === 'end') {
            if (userScrollStartPosition && scrollAnimationStartPosition) {
                const { minIndex: startAreaIndex } = getClosestAreaIndexFromPoint({
                    areaPointList: snapPointList,
                    checkPoint: userScrollStartPosition.y,
                });
                const lastSnapListIndex = snapPointList.length;

                // from last area && now in last before area ->  animation closest area with direction
                if (startAreaIndex === lastSnapListIndex - 1) {
                    const nowPosition = getScrollPosition(scrollContainerElement);
                    if (nowPosition.y < snapPointList[lastSnapListIndex]) {
                        const { minIndex: targetAreaIndex } = getClosestAreaIndexFromPoint({
                            areaPointList: snapPointList,
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

    // animation start
    React.useEffect(() => {
        if (animationEventName === 'start') {
            if (userScrollStartPosition && scrollAnimationStartPosition) {
                const animationInfo = getLastFreeScrollSnapAnimationInfo({
                    endPosition: scrollAnimationStartPosition.y,
                    startPosition: userScrollStartPosition.y,
                    outDeltaOffset: 50,
                    startAreaAcceptOffset: 10,
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
