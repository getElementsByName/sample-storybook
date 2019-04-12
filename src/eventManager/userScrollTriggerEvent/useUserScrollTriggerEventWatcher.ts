import * as React from 'react';
import { useTouchEventEnhancer } from './useTouchEventEnhancer';
import { useWheelEventEnhancer } from './useWheelEventEnhancer';
import { ScrollListenableContainerElementType } from '../../util/getScrollPosition';
import { EventWithPhase, WheelTouchEventType } from '../EventPhase';

interface ArgumentsType {
  scrollContainerElement: ScrollListenableContainerElementType;
  wheelEndDebounceTime?: number;
}

interface UserScrollTriggerEvent {
  event: EventWithPhase<WheelTouchEventType | null>;
  type: 'wheel' | 'touch';
}

const useUserScrollTriggerEventWatcher = ({ scrollContainerElement, wheelEndDebounceTime = 1000 }: ArgumentsType) => {
  const touchEvent = useTouchEventEnhancer({
    element: scrollContainerElement,
  });

  const wheelEvent = useWheelEventEnhancer({
    wheelEndDebounceTime,
    element: scrollContainerElement,
  });

  const [lastEvent, setLastEvent] = React.useState<UserScrollTriggerEvent>({ event: wheelEvent, type: 'wheel' });

  React.useEffect(() => {
    setLastEvent({
      event: touchEvent,
      type: 'touch',
    });
  }, [touchEvent]);

  React.useEffect(() => {
    setLastEvent({
      event: wheelEvent,
      type: 'wheel',
    });
  }, [wheelEvent]);

  return lastEvent;
};

export { useUserScrollTriggerEventWatcher };
