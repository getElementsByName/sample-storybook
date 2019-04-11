import * as React from 'react';

import {
    useDOMEventHandler,
    useDOMScrollEventWatcher,
    useUserScrollTriggerEventWatcher,
    useWheelEventEnhancer,
    useTouchEventEnhancer,
    useScrollChangeByUser,
} from '../';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { GradientList } from './storyComponents/GradientList';

function log(name: string, e: any) {
    action(name)(e);
    console.log(name, e);
}

// prevent duplicated call log (call log only when props are changed)
const Log: React.FC<{ name?: string; msg: any }> = ({ name, msg }) => {
    React.useEffect(() => {
        log(`${name}`, msg);
    }, [name, msg]);
    return null;
};

storiesOf('basic', module)
    .add('DOM Event', () => {
        function eventHandler(e: Event) {
            log('scroll', e);
        }

        const ScrollEventWatcher: React.FC = ({}) => {
            useDOMEventHandler(document, 'scroll event from DOM', eventHandler);
            return null;
        };

        return (
            <>
                <GradientList heightList={[300, 600, 1000, 1000]} />
                <ScrollEventWatcher />
            </>
        );
    })
    .add('DOM scroll event enhancer', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            const domScrollEvent = useDOMScrollEventWatcher({
                scrollContainerElement: document,
            });

            React.useEffect(() => {
                log(domScrollEvent.eventName, domScrollEvent);
            }, [domScrollEvent]);
            return null;
        };

        return (
            <>
                <GradientList heightList={[300, 600, 1000, 1000]} />
                <ScrollEventWatcher />
            </>
        );
    })
    .add('wheel event enhancer', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            const wheelEvent = useWheelEventEnhancer({
                element: document,
                wheelEndDebounceTime: 500,
            });

            React.useEffect(() => {
                log(wheelEvent.eventName, wheelEvent);
            }, [wheelEvent]);
            return null;
        };

        return (
            <>
                <GradientList heightList={[300, 600, 1000, 1000]} />
                <ScrollEventWatcher />
            </>
        );
    })
    .add('touch event enhancer', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            const touchEvent = useTouchEventEnhancer({
                element: document,
            });

            React.useEffect(() => {
                log(touchEvent.eventName, touchEvent);
            }, [touchEvent]);
            return null;
        };

        return (
            <>
                <GradientList heightList={[300, 600, 1000, 1000]} />
                <ScrollEventWatcher />
            </>
        );
    })
    .add('user scroll Event', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            const userScrollTriggerEvent = useUserScrollTriggerEventWatcher({
                scrollContainerElement: document,
            });

            React.useEffect(() => {
                log(userScrollTriggerEvent.eventName, userScrollTriggerEvent);
            }, [userScrollTriggerEvent]);
            return null;
        };

        return (
            <>
                <GradientList heightList={[300, 600, 1000, 1000]} />
                <ScrollEventWatcher />
            </>
        );
    })
    .add('scroll change by user event', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            const scrollChangeByUserEvent = useScrollChangeByUser({
                scrollContainerElement: document,
            });

            React.useEffect(() => {
                log(scrollChangeByUserEvent.eventName, JSON.stringify(scrollChangeByUserEvent.originalEvent));
            }, [scrollChangeByUserEvent]);
            return null;
        };

        return (
            <>
                <GradientList heightList={[300, 600, 1000, 1000]} />
                <ScrollEventWatcher />
            </>
        );
    });
