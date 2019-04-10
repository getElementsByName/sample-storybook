export type UserScrollTriggerEventType = TouchEvent | WheelEvent;
export type UserScrollEventNameType = 'start' | 'move' | 'end';

export interface UserScrollTriggerEvent<T = UserScrollTriggerEventType> {
    eventName: UserScrollEventNameType;
    originalEvent: T;
}
