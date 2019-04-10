import * as React from 'react';

import {
    useDOMScrollEventWatcher,
    ScrollEvent,
    useUserScrollTriggerEventWatcher,
    UserScrollTriggerEvent,
    useScrollAnimationEvent,
    smoothScroll,
    getPointIndex,
    getClosestPointIndex,
    getLastFreeScrollSnapAnimationInfo,
    getScrollPosition,
} from '../';

import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';

const DEFAULT_DEBOUNCE_TIME_MS = 300;
const DEFAULT_WHEEL_DEBOUNCE_TIME_MS = 1000;

// prevent duplicated call log (call log only when props are changed)
const Log: React.FC<{ name?: string; msg: any }> = ({ name, msg }) => {
    React.useEffect(() => {
        console.log(name, msg);
    }, [name, msg]);
    return null;
};

const ScrollElement: React.FC<{ elementLength?: number }> = ({ elementLength = 20 }) => {
    const elementList = [];

    for (let i = 0; i < elementLength; i++) {
        elementList.push(<div key={i}>{i}</div>);
    }
    return (
        <div>
            <div style={{ width: '100%', fontSize: '200px' }}>{elementList}</div>
            <div style={{ width: '100%' }}>END</div>
        </div>
    );
};

storiesOf('scroll-event-enhancer', module)
    .add('basic', () => {
        const scrollEndDebounceTime = number('scrollEndDebounceTime', DEFAULT_DEBOUNCE_TIME_MS);
        const wheelEndDebounceTime = number('wheelEndDebounceTime', DEFAULT_WHEEL_DEBOUNCE_TIME_MS);

        const ScrollEventWatcher: React.FC<{ scrollEndDebounceTime: number; wheelEndDebounceTime: number }> = ({
            scrollEndDebounceTime,
            wheelEndDebounceTime,
        }) => {
            const userScrollTriggerEvent = useUserScrollTriggerEventWatcher({
                scrollContainerElement: document,
                wheelEndDebounceTime: wheelEndDebounceTime,
            });

            const domScrollEvent = useDOMScrollEventWatcher({
                debounceTime: scrollEndDebounceTime,
                scrollContainerElement: document,
            });

            return (
                <>
                    <Log name="userScrollTriggerEvent" msg={userScrollTriggerEvent} />
                    <Log name="domScrollEvent" msg={domScrollEvent} />
                </>
            );
        };

        return (
            <>
                <ScrollElement />
                <ScrollEventWatcher
                    scrollEndDebounceTime={scrollEndDebounceTime}
                    wheelEndDebounceTime={wheelEndDebounceTime}
                />
            </>
        );
    })
    .add('basic - animation event', () => {
        const snapPointList = [0, 500, 1000];
        const outOffset = 50;

        const scrollEndDebounceTime = number('scrollEndDebounceTime', DEFAULT_DEBOUNCE_TIME_MS);
        const wheelEndDebounceTime = number('wheelEndDebounceTime', DEFAULT_WHEEL_DEBOUNCE_TIME_MS);

        const ScrollAnimationEventWatcher: React.FC<{
            scrollEndDebounceTime: number;
            wheelEndDebounceTime: number;
        }> = ({ scrollEndDebounceTime, wheelEndDebounceTime }) => {
            const cancelCallbackRef = React.useRef<Function | null>(null);

            const {
                event,
                scrollAnimationEndTrigger,
                userScrollStartPosition,
                scrollAnimationStartPosition,
                scrollAnimationEndPosition,
                domScrollEvent,
                userScrollTriggerEvent,
            } = useScrollAnimationEvent({
                scrollContainerElement: document,
                wheelEndDebounceTime: wheelEndDebounceTime,
                scrollEndDebounceTime: scrollEndDebounceTime,
                minSpeedY: 0.2,
                cancelCallbackRef,
            });

            // console.log('userScrollStartPosition', userScrollStartPosition);
            // console.log('scrollAnimationStartPosition', scrollAnimationStartPosition);
            // console.log('scrollAnimationEndPosition', scrollAnimationEndPosition);

            const animationEventName = event && event.eventName;

            React.useEffect(() => {
                if (
                    domScrollEvent.eventName === 'scroll:end' &&
                    userScrollTriggerEvent.eventName === 'user-scroll:end'
                ) {
                    if (userScrollStartPosition && scrollAnimationStartPosition) {
                        // TODO: from last area && now in last before area ->  animation closest area
                        const { minIndex: startAreaIndex } = getClosestPointIndex({
                            pointList: snapPointList,
                            checkPoint: userScrollStartPosition.y,
                        });
                        const lastSnapListIndex = snapPointList.length;
                        if (startAreaIndex === lastSnapListIndex - 1) {
                            const nowPosition = getScrollPosition(document);
                            if (nowPosition.y < snapPointList[lastSnapListIndex]) {
                                const { minIndex: targetAreaIndex } = getClosestPointIndex({
                                    pointList: snapPointList,
                                    checkPoint: nowPosition.y,
                                });

                                if (targetAreaIndex !== null) {
                                    const { cancel } = smoothScroll({
                                        scrollContainerElement: window,
                                        end: {
                                            y: snapPointList[targetAreaIndex],
                                        },
                                        scrollTime: 500,
                                        callback: scrollAnimationEndTrigger,
                                    });

                                    cancelCallbackRef.current = cancel;

                                    return;
                                }
                            }
                        }
                    }
                }
            }, [
                domScrollEvent.eventName,
                scrollAnimationEndTrigger,
                scrollAnimationStartPosition,
                userScrollStartPosition,
                userScrollTriggerEvent.eventName,
            ]);

            React.useEffect(() => {
                if (animationEventName === 'start') {
                    if (userScrollStartPosition && scrollAnimationStartPosition) {
                        const animationInfo = getLastFreeScrollSnapAnimationInfo({
                            endPosition: scrollAnimationStartPosition.y,
                            startPosition: userScrollStartPosition.y,
                            outOffset: 50,
                            startOffset: 10,
                            snapPointList: snapPointList,
                        });

                        if (animationInfo !== null) {
                            const { cancel } = smoothScroll({
                                scrollContainerElement: window,
                                end: {
                                    y: animationInfo.animationTargetPosition,
                                },
                                scrollTime: 500,
                                callback: scrollAnimationEndTrigger,
                            });

                            cancelCallbackRef.current = cancel;

                            return;
                        }
                    }
                    scrollAnimationEndTrigger();
                }
            }, [animationEventName, scrollAnimationEndTrigger, scrollAnimationStartPosition, userScrollStartPosition]);

            return (
                <>
                    <Log name="scrollAnimationEvent" msg={event} />
                </>
            );
        };

        const elementList = [];

        for (let i = 0; i < snapPointList.length; i++) {
            elementList.push(
                <div key={i} style={{ top: `${snapPointList[i]}px`, position: 'absolute', height: 1000 }}>
                    {i}
                </div>,
            );
        }

        return (
            <>
                <div>{elementList}</div>
                <ScrollAnimationEventWatcher
                    scrollEndDebounceTime={scrollEndDebounceTime}
                    wheelEndDebounceTime={wheelEndDebounceTime}
                />
            </>
        );
    })

    .add('basic - container element', () => {
        return (
            <>
                <div>
                    <div style={{ width: '100%', height: '1000px' }}>TODO</div>
                    <div style={{ width: '100%', height: '1000px' }}>BOX</div>
                    <div style={{ width: '100%', height: '1000px' }}>BOX</div>
                    <div style={{ width: '100%', height: '1000px' }}>BOX</div>
                </div>
            </>
        );
    });
