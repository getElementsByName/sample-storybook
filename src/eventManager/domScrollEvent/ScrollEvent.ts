type ScrollStartEventName = 'scroll:start';
type ScrollMoveEventName = 'scroll:move';
type ScrollEndEventName = 'scroll:end';
// type ScrollMinEventName = 'scroll:min';
// type ScrollMaxEventName = 'scroll:max';

export type ScrollEventName = ScrollStartEventName | ScrollMoveEventName | ScrollEndEventName;

export interface CommonScrollEvent<T = Event> {
    eventName: string;
    originalEvent: T;
}

export interface ScrollStartEvent<T = Event> extends CommonScrollEvent<T> {
    eventName: ScrollStartEventName;
    scrollY: number;
    scrollX: number;
}

export interface ScrollMoveEvent<T = Event> extends CommonScrollEvent<T> {
    eventName: ScrollMoveEventName;
    scrollY: number;
    scrollX: number;
    speedY: number;
    speedX: number;
}

export interface ScrollEndEvent<T = Event> extends CommonScrollEvent<T> {
    eventName: ScrollEndEventName;
}

export type ScrollEvent<T = Event> = ScrollStartEvent<T> | ScrollMoveEvent<T> | ScrollEndEvent<T>;
