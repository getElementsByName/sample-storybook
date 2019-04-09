export type UserScrollTriggerEventType = TouchEvent | WheelEvent;
export type UserScrollEventNameType = 'user-scroll:start' | 'user-scroll:move' | 'user-scroll:end';

export interface UserScrollTriggerEvent<T = UserScrollTriggerEventType> {
    eventName: UserScrollEventNameType;
    originalEvent: T;
}
