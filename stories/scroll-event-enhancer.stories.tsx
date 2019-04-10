import * as React from 'react';

import {
    useDOMScrollEventWatcher,
    ScrollEvent,
    useUserScrollTriggerEventWatcher,
    UserScrollTriggerEvent,
    useScrollAnimationEvent,
    smoothScroll,
    getRangeInfo,
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

const ScrollElement: React.FC = () => {
    return (
        <div>
            <div style={{ width: '100%', height: '1000px', fontSize: '200px' }}>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
                <div>1</div>
            </div>
            <div style={{ width: '100%', height: '1000px' }}>BOX</div>
            <div style={{ width: '100%', height: '1000px' }}>BOX</div>
            <div style={{ width: '100%', height: '1000px' }}>BOX</div>
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
                    <Log name="userScrollTriggerEvent" msg={userScrollTriggerEvent} />;
                    <Log name="domScrollEvent" msg={domScrollEvent} />;
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
            } = useScrollAnimationEvent({
                scrollContainerElement: document,
                wheelEndDebounceTime: wheelEndDebounceTime,
                scrollEndDebounceTime: scrollEndDebounceTime,
                minSpeedY: 0.3,
                cancelCallbackRef,
            });

            // console.log('userScrollStartPosition', userScrollStartPosition);
            // console.log('scrollAnimationStartPosition', scrollAnimationStartPosition);
            // console.log('scrollAnimationEndPosition', scrollAnimationEndPosition);

            const animationEventName = event && event.eventName;
            React.useEffect(() => {
                if (animationEventName === 'start') {
                    // 0 ~ 200
                    const topArea = {
                        entryMin: 0,
                        entryMax: 150,
                        max: 200,
                        min: 0,
                    };

                    // 201 ~ 400
                    const middleArea = {
                        entryMin: 100,
                        entryMax: 450,
                        min: 201,
                        max: 400,
                    };

                    // 400 ~
                    const bottomArea = {
                        entryMin: 350,
                        min: 401,
                    };

                    if (userScrollStartPosition && scrollAnimationStartPosition) {
                        const rangeInfo = getRangeInfo({
                            rangeList: [topArea, middleArea, bottomArea],
                            startPosition: userScrollStartPosition.y,
                            endPosition: scrollAnimationStartPosition.y,
                        });

                        // console.log('rangeInfo', rangeInfo);

                        if (rangeInfo) {
                            const entryPosition = rangeInfo.entryRange.min;

                            const { cancel } = smoothScroll({
                                scrollContainerElement: document.documentElement,
                                end: {
                                    y: entryPosition,
                                },
                                scrollTime: 1000,
                                callback: scrollAnimationEndTrigger,
                            });

                            cancelCallbackRef.current = cancel;

                            return;
                        }
                    }
                    scrollAnimationEndTrigger();
                }
            }, [animationEventName, scrollAnimationEndTrigger]);

            return (
                <>
                    <Log name="scrollAnimationEvent" msg={event} />;
                </>
            );
        };

        return (
            <>
                <ScrollElement />
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
