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
  outOffset?: number;
  scrollContainerElement: ScrollListenableContainerElementType;
}

function useLastFreeScrollSnap({
  snapPointList,
  wheelEndDebounceTime,
  animationDurationMs,
  outOffset = 30,
  animationTriggerMinSpeedY = 0.05,
  scrollContainerElement,
}: ArgumentType) {
  const [animationTargetPosition, setAnimationStateForReturn] = React.useState<{ y: number } | null>(null);
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
    setAnimationStateForReturn(null);
  });

  const animateScrollRef = React.useRef(({ y }: { y: number }) => {
    allCancelCallbackRef.current(); // 이전 애니매이션 종료

    // console.log('animation', y)
    const { cancel, willAnimate } = smoothScroll({
      scrollContainerElement: window,
      end: {
        y,
      },
      scrollTime: animationDurationMs,
      callback: animationEndCallbackRef.current,
    });

    if (willAnimate) {
      cancelCallbackRef.current = cancel;
      setAnimationStateForReturn({ y: y });
    } else {
      animationEndCallbackRef.current();
    }
  });

  const animationEventName = event && event.eventName;

  // animation start
  React.useEffect(() => {
    if (animationEventName === 'start') {
      if (userScrollStartPosition && scrollAnimationStartPosition) {
        const animationInfo = getLastFreeScrollSnapAnimationInfo({
          endPosition: scrollAnimationStartPosition.y,
          startPosition: userScrollStartPosition.y,
          outOffset: outOffset,
          startAreaAcceptOffset: 10,
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
    outOffset,
    scrollAnimationEndTrigger,
    scrollAnimationStartPosition,
    snapPointList,
    userScrollStartPosition,
  ]);

  return {
    animationTargetPosition: animationTargetPosition,
    animateScroll: animateScrollRef.current,
  };
}

export { useLastFreeScrollSnap };
