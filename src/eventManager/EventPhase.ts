export type WheelTouchEventType = TouchEvent | WheelEvent;
export type EventPhaseNameType = 'start' | 'move' | 'end';

export interface EventWithPhase<T = WheelTouchEventType> {
  eventName: EventPhaseNameType;
  originalEvent: T;
}
