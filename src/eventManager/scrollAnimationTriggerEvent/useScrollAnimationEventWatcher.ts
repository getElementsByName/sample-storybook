import * as React from 'react';
import { ScrollAnimationEvent } from './ScrollAnimationEvent';
import {
  useDOMScrollEventWatcher,
  ScrollListenableContainerElementType,
} from '../domScrollEvent/useDOMScrollEventWatcher';
import { useUserScrollTriggerEventWatcher } from '../userScrollTriggerEvent/useUserScrollTriggerEventWatcher';
import { PositionXY, getScrollPosition } from '../../util/getScrollPosition';
import { useScrollChangeByUser } from '../scrollChangeByUser/useScrollChangeByUser';

interface ArgumentsType {
  scrollContainerElement: ScrollListenableContainerElementType;
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
  const isStartAnimationRef = React.useRef<boolean>(false);
  const isReadyRef = React.useRef<boolean>(false);
  const isScrollMovedRef = React.useRef(false);
  const isEndAnimationRef = React.useRef<boolean>(false);

  const [event, setEvent] = React.useState<ScrollAnimationEvent | null>(null);
  const [userScrollStartPosition, setUserScrollStartPosition] = React.useState<PositionXY | null>(null);
  const [scrollAnimationStartPosition, setScrollAnimationStartPosition] = React.useState<PositionXY | null>(null);
  const [scrollAnimationEndPosition, setScrollAnimationEndPosition] = React.useState<PositionXY | null>(null);

  const scrollChangeByUserEvent = useScrollChangeByUser({
    scrollContainerElement,
  });

  const domScrollEvent = useDOMScrollEventWatcher({
    debounceTime: scrollEndDebounceTime,
    scrollContainerElement: scrollContainerElement,
  });

  const setStart = React.useRef(() => {
    if (isStartAnimationRef.current === false && isScrollMovedRef.current === true) {
      isStartAnimationRef.current = true;
      setEvent({
        eventName: 'start',
      });
      setScrollAnimationStartPosition(getScrollPosition(scrollContainerElement));
    }
  }).current;

  const scrollAnimationEndTrigger = React.useRef(() => {
    isEndAnimationRef.current = true;
    isStartAnimationRef.current = false;
    isReadyRef.current = false;

    setEvent({
      eventName: 'end',
    });
    setScrollAnimationEndPosition(getScrollPosition(scrollContainerElement));
  }).current;

  if (scrollChangeByUserEvent.eventName === 'start') {
    cancelCallbackRef && cancelCallbackRef.current && cancelCallbackRef.current(); // TODO: once

    if (isReadyRef.current !== true) {
      isReadyRef.current = true;
      setUserScrollStartPosition(
        scrollChangeByUserEvent.originalEvent && scrollChangeByUserEvent.originalEvent.nowPosition,
      );
    }

    if (isEndAnimationRef.current === true) {
      isEndAnimationRef.current = false;
    }

    if (isStartAnimationRef.current == true && isEndAnimationRef.current === false) {
      scrollAnimationEndTrigger();
    }
  }

  if (
    isReadyRef.current &&
    isEndAnimationRef.current === false &&
    scrollChangeByUserEvent.eventName === 'move' &&
    domScrollEvent !== null &&
    domScrollEvent.eventName === 'move'
  ) {
    if (
      userScrollStartPosition !== null &&
      (userScrollStartPosition.x !== domScrollEvent.scrollX || userScrollStartPosition.y !== domScrollEvent.scrollY)
    ) {
      isScrollMovedRef.current = true;
    }
  }

  if (isScrollMovedRef.current && isEndAnimationRef.current === true && scrollChangeByUserEvent.eventName === 'end') {
    isScrollMovedRef.current = false;
  }

  if (isReadyRef.current && isEndAnimationRef.current === false && scrollChangeByUserEvent.eventName === 'end') {
    // after user event end
    if (domScrollEvent !== null && domScrollEvent.eventName === 'move') {
      if (
        (minSpeedY !== undefined && Math.abs(domScrollEvent.speedY) < minSpeedY) ||
        (minSpeedX !== undefined && Math.abs(domScrollEvent.speedX) < minSpeedX)
      ) {
        setStart();
      }
    } else if (domScrollEvent !== null && domScrollEvent.eventName === 'end') {
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
  };
};

export { useScrollAnimationEventWatcher };
