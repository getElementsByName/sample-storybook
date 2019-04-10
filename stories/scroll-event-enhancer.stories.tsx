import * as React from 'react';

import { useDOMScrollEventWatcher, useUserScrollTriggerEventWatcher, useLastFreeScrollSnapAnimation } from '../';

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

        const scrollAnimationDuration = number('scrollAnimationDuration', 500);
        const scrollEndDebounceTime = number('scrollEndDebounceTime', DEFAULT_DEBOUNCE_TIME_MS);
        const wheelEndDebounceTime = number('wheelEndDebounceTime', DEFAULT_WHEEL_DEBOUNCE_TIME_MS);

        const ScrollAnimationEventWatcher: React.FC<{
            scrollEndDebounceTime: number;
            wheelEndDebounceTime: number;
        }> = ({ scrollEndDebounceTime, wheelEndDebounceTime }) => {
            const { animationEvent } = useLastFreeScrollSnapAnimation({
                scrollContainerElement: document,
                animationDurationMs: scrollAnimationDuration,
                snapPointList,
                animationTriggerMinSpeedY: 0.3,
                scrollEndDebounceTime: scrollEndDebounceTime,
                wheelEndDebounceTime: wheelEndDebounceTime,
            });
            return (
                <>
                    <Log name="scrollAnimationEvent" msg={animationEvent} />
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
