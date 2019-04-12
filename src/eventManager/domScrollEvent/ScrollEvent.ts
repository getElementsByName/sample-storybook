type ScrollStartEventName = 'start';
type ScrollMoveEventName = 'move';
type ScrollEndEventName = 'end';

export type ScrollEventName = ScrollStartEventName | ScrollMoveEventName | ScrollEndEventName;

export interface ScrollPosition {
  scrollY: number;
  scrollX: number;
}

export interface CommonScrollEvent<T = Event> {
  eventName: string;
  originalEvent: T;
}

export interface ScrollStartEvent<T = Event> extends CommonScrollEvent<T>, ScrollPosition {
  eventName: ScrollStartEventName;
}

export interface SpeedType {
  speedY: number;
  speedX: number;
}

export interface AccelType {
  accelX: number | null; // 초기 null
  accelY: number | null;
}

export type DirectionValueType = -1 | 0 | 1;
export function getDirectionValue(v: number) {
  if (v === 0) {
    return 0;
  } else if (v > 0) {
    return 1;
  } else {
    return -1;
  }
}

export interface DirectionType {
  directionX: DirectionValueType;
  directionY: DirectionValueType;
}

export function getDirectionValueFromSpeed(s: SpeedType | null): DirectionType {
  return {
    directionX: s === null ? 0 : getDirectionValue(s.speedX),
    directionY: s === null ? 0 : getDirectionValue(s.speedY),
  };
}

export interface ScrollMoveEvent<T = Event>
  extends CommonScrollEvent<T>,
    AccelType,
    SpeedType,
    ScrollPosition,
    DirectionType {
  eventName: ScrollMoveEventName;
}

export interface ScrollEndEvent<T = Event> extends CommonScrollEvent<T>, ScrollPosition, DirectionType {
  eventName: ScrollEndEventName;
}

export type ScrollEvent<T = Event> = ScrollStartEvent<T> | ScrollMoveEvent<T> | ScrollEndEvent<T>;
