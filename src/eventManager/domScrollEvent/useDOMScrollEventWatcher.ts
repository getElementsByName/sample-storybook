import * as React from 'react';
import { useDOMEventHandler } from '../../util/useDOMEventHandler';
import {
  ScrollEvent,
  ScrollStartEvent,
  ScrollMoveEvent,
  AccelType,
  SpeedType,
  getDirectionValueFromSpeed,
} from './ScrollEvent';
import { getScrollPosition, ScrollListenableContainerElementType, PositionXY } from '../../util/getScrollPosition';
import { debounce } from '../../util/debounce';

interface ArgumentsType {
  scrollContainerElement: ScrollListenableContainerElementType;
  debounceTime?: number;
}

const useDOMScrollEventWatcher = ({ scrollContainerElement, debounceTime = 300 }: ArgumentsType) => {
  const positionRef = React.useRef<PositionXY | null>(null);

  const [event, setEvent] = React.useState<ScrollEvent<Event | null> | null>(null);

  const latestScrollTimeRef = React.useRef<number | null>(null);
  const speedRef = React.useRef<SpeedType | null>(null);

  React.useEffect(() => {
    positionRef.current = getScrollPosition(scrollContainerElement);
    setEvent({
      eventName: 'end',
      originalEvent: null,
      scrollX: positionRef.current.x,
      scrollY: positionRef.current.y,
      directionX: 0,
      directionY: 0,
    });
  }, [scrollContainerElement]);

  // start, move
  const scrollHandler = React.useRef((event: Event) => {
    if (positionRef.current === null) return;

    let resultEvent: ScrollStartEvent | ScrollMoveEvent;
    const newPosition = getScrollPosition(scrollContainerElement);
    const eventTime = event.timeStamp;

    if (latestScrollTimeRef.current) {
      const deltaTime = eventTime - latestScrollTimeRef.current;
      const deltaPosition = {
        x: newPosition.x - positionRef.current.x,
        y: newPosition.y - positionRef.current.y,
      };

      const newSpeed: SpeedType = {
        speedX: deltaPosition.x / deltaTime,
        speedY: deltaPosition.y / deltaTime,
      };

      let deltaSpeed: AccelType;
      const prevSpeed = speedRef.current;
      if (prevSpeed) {
        deltaSpeed = {
          accelX: (newSpeed.speedX - prevSpeed.speedX) / deltaTime,
          accelY: (newSpeed.speedY - prevSpeed.speedY) / deltaTime,
        };
      } else {
        deltaSpeed = {
          accelX: null,
          accelY: null,
        };
      }

      speedRef.current = newSpeed;
      const direction = getDirectionValueFromSpeed(newSpeed);
      resultEvent = {
        eventName: 'move',
        originalEvent: event,

        scrollY: newPosition.y,
        scrollX: newPosition.x,

        ...newSpeed,
        ...deltaSpeed,
        ...direction,
      };
    } else {
      resultEvent = {
        eventName: 'start',
        originalEvent: event,

        scrollY: positionRef.current.y,
        scrollX: positionRef.current.x,
      };
    }

    latestScrollTimeRef.current = eventTime;
    positionRef.current = newPosition;

    setEvent(resultEvent);
  }).current;

  useDOMEventHandler(scrollContainerElement, 'scroll', scrollHandler);

  // end
  type DebounceScrollEndHandlerType = (event: Event) => void;

  // A function argument is special in useState() for merging objects with prev one & new one
  interface DebounceCallbackFromStateType {
    callback: DebounceScrollEndHandlerType;
  }
  const [debounceCallback, setDebounceCallback] = React.useState<null | DebounceCallbackFromStateType>(null);

  React.useEffect(() => {
    const newDebounceCallback = debounce((event: Event) => {
      const prevSpeed = speedRef.current;

      latestScrollTimeRef.current = null;
      speedRef.current = null;

      const newPosition = getScrollPosition(scrollContainerElement);
      positionRef.current = newPosition;

      const direction = getDirectionValueFromSpeed(prevSpeed);
      setEvent({
        eventName: 'end',
        originalEvent: event,
        scrollX: newPosition.x,
        scrollY: newPosition.y,
        ...direction,
      });
    }, debounceTime);

    setDebounceCallback({
      callback: newDebounceCallback,
    });

    return () => {
      setDebounceCallback(null);
    };
  }, [debounceTime]);

  useDOMEventHandler(scrollContainerElement, 'scroll', debounceCallback && debounceCallback.callback);

  return event;
};

export { useDOMScrollEventWatcher, ScrollEvent, ScrollListenableContainerElementType };
