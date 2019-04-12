type EventNameType = 'start' | 'cancel' | 'end';

export interface ScrollAnimationEvent {
  eventName: EventNameType;
}
