import * as React from 'react';
import { getLastFreeScrollSnapAnimationInfo } from './getLastFreeScrollSnapAnimationInfo';
import { useScrollAnimationEventWatcher } from '../eventManager/scrollAnimationTriggerEvent/useScrollAnimationEventWatcher';
import { smoothScroll } from './scrollAnimation';
import { ScrollListenableContainerElementType } from '../eventManager/domScrollEvent/useDOMScrollEventWatcher';

interface ArgumentType {
  snapPointList: number[];
  wheelEndDebounceTime?: number;
  animationTriggerMinSpeedY: number;
  animationDurationMs: number;
  scrollContainerElement: ScrollListenableContainerElementType;
}

function useLastFreeScrollSnapAnimation({
  snapPointList,
  wheelEndDebounceTime,
  animationDurationMs,
  animationTriggerMinSpeedY = 0.05,
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
  } = useScrollAnimationEventWatcher({
    scrollContainerElement: scrollContainerElement,
    wheelEndDebounceTime: wheelEndDebounceTime,
    scrollEndDebounceTime: 300,
    minSpeedY: animationTriggerMinSpeedY,
    cancelCallbackRef: allCancelCallbackRef,
  });

  const animationEndCallbackRef = React.useRef<Function>(() => {
    scrollAnimationEndTrigger();
    cancelCallbackRef.current = null;
  });

  const animateScrollRef = React.useRef(({ y }: { y: number }) => {
    allCancelCallbackRef.current(); // 이전 애니매이션 종료

    // console.log('animation', y)
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
