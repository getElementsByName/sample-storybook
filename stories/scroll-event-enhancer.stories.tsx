import * as React from 'react';

import {
    useDOMScrollEventWatcher,
    ScrollEvent,
    useUserScrollTriggerEventWatcher,
    UserScrollTriggerEvent,
    useScrollAnimationEvent,
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
            <div style={{ width: '100%', height: '1000px' }}>BOX</div>
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
            const scrollAnimationEvent = useScrollAnimationEvent({
                scrollContainerElement: document,
                wheelEndDebounceTime: wheelEndDebounceTime,
                scrollEndDebounceTime: scrollEndDebounceTime,
            });

            console.log('scrollAnimationEvent', scrollAnimationEvent);

            return null;
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
