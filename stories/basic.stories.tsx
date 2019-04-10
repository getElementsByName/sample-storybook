import * as React from 'react';

import { useDOMEventHandler, useDOMScrollEventWatcher, useUserScrollTriggerEventWatcher } from '../';

import { storiesOf } from '@storybook/react';

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
            <div style={{ width: '100%', height: '1000px' }}>
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

storiesOf('basic', module)
    .add('DOM Event', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            function log(e: Event) {
                console.log(e);
            }

            useDOMEventHandler(document, 'scroll', log);
            return null;
        };

        return (
            <>
                <ScrollElement />
                <ScrollEventWatcher />
            </>
        );
    })
    .add('DOM scroll Event', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            const { eventName, originalEvent } = useDOMScrollEventWatcher({
                scrollContainerElement: document,
            });

            console.log(eventName, originalEvent);
            return null;
        };

        return (
            <>
                <ScrollElement />
                <ScrollEventWatcher />
            </>
        );
    })
    .add('user scroll Event', () => {
        const ScrollEventWatcher: React.FC = ({}) => {
            const { eventName, originalEvent } = useUserScrollTriggerEventWatcher({
                scrollContainerElement: document,
            });

            console.log(eventName, originalEvent);
            return null;
        };

        return (
            <>
                <ScrollElement />
                <ScrollEventWatcher />
            </>
        );
    });
