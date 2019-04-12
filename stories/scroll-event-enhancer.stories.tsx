import * as React from 'react';

import { useDOMScrollEventWatcher, useUserScrollTriggerEventWatcher, useLastFreeScrollSnapAnimation } from '../';
import { storiesOf } from '@storybook/react';
import { number, button } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

const DEFAULT_DEBOUNCE_TIME_MS = 300;
const DEFAULT_WHEEL_DEBOUNCE_TIME_MS = 500;

// prevent duplicated call log (call log only when props are changed)
const Log: React.FC<{ name?: string; msg: any }> = ({ name, msg }) => {
  React.useEffect(() => {
    action(`${name}`)(msg);
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

storiesOf('scroll snap', module)
  .add('scroll snap demo', () => {
    const snapPointList = [0, 200, 500];
    const LAST_HEIGHT = 3000;

    const scrollAnimationDuration = number('scrollAnimationDuration', 300);
    const scrollEndDebounceTime = number('scrollEndDebounceTime', DEFAULT_DEBOUNCE_TIME_MS);
    const wheelEndDebounceTime = number('wheelEndDebounceTime', DEFAULT_WHEEL_DEBOUNCE_TIME_MS);

    const ScrollAnimationEventWatcher: React.FC<{
      scrollEndDebounceTime: number;
      wheelEndDebounceTime: number;
    }> = ({ scrollEndDebounceTime, wheelEndDebounceTime }) => {
      const { animationEvent, animateScroll } = useLastFreeScrollSnapAnimation({
        scrollContainerElement: document,
        animationDurationMs: scrollAnimationDuration,
        snapPointList,
        animationTriggerMinSpeedY: 0.3,
        scrollEndDebounceTime: scrollEndDebounceTime,
        wheelEndDebounceTime: wheelEndDebounceTime,
      });

      const scrollButtonGroupName = 'scrollTo';
      button('scroll0', () => animateScroll({ y: snapPointList[0] }), scrollButtonGroupName);
      button('scroll1', () => animateScroll({ y: snapPointList[1] }), scrollButtonGroupName);
      button('scroll2', () => animateScroll({ y: snapPointList[2] }), scrollButtonGroupName);

      return <>{/* <Log name="scrollAnimationEvent" msg={animationEvent} /> */}</>;
    };

    const elementList = [];

    for (let i = 0; i < snapPointList.length; i++) {
      const nextPosition = snapPointList[i + 1] ? snapPointList[i + 1] : snapPointList[i] + LAST_HEIGHT;
      const height = nextPosition - snapPointList[i];
      elementList.push(
        <div
          key={i}
          style={{
            top: `${snapPointList[i]}px`,
            position: 'absolute',
            height: `${height}px`,
            width: '50%',
            background: 'linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
          }}
        >
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

  .add('TODO: container element', () => {
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
