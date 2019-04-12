import * as React from 'react';
import { useTouchEventEnhancer } from './useTouchEventEnhancer';
import { useWheelEventEnhancer } from './useWheelEventEnhancer';
import { ScrollListenableContainerElementType } from '../../util/getScrollPosition';
import { EventWithPhase, WheelTouchEventType } from '../EventPhase';

interface ArgumentsType {
  scrollContainerElement: ScrollListenableContainerElementType;
  wheelEndDebounceTime?: number;
}

const useUserScrollTriggerEventWatcher = ({ scrollContainerElement, wheelEndDebounceTime = 1000 }: ArgumentsType) => {
  const touchEvent = useTouchEventEnhancer({
    element: scrollContainerElement,
  });

  const wheelEvent = useWheelEventEnhancer({
    wheelEndDebounceTime,
    element: scrollContainerElement,
  });

  const [lastEvent, setLastEvent] = React.useState<EventWithPhase<WheelTouchEventType | null>>(wheelEvent);

  React.useEffect(() => {
    setLastEvent(touchEvent);
  }, [touchEvent]);

  React.useEffect(() => {
    setLastEvent(wheelEvent);
  }, [wheelEvent]);

  return lastEvent;
};

export { useUserScrollTriggerEventWatcher };
