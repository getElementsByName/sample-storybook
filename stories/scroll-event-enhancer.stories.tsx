import * as React from 'react';

import { useLastFreeScrollSnap } from '../';
import { storiesOf } from '@storybook/react';
import { number, button } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { FixedController } from './storyComponents/FixedElement';
import { GradientList } from './storyComponents/GradientList';

const DEFAULT_WHEEL_DEBOUNCE_TIME_MS = 500;

// prevent duplicated call log (call log only when props are changed)
const Log: React.FC<{ name?: string; msg: any }> = ({ name, msg }) => {
  React.useEffect(() => {
    action(`${name}`)(JSON.stringify(msg, null, 2));
  }, [name, msg]);
  return null;
};

storiesOf('scroll snap', module)
  .add('scroll snap demo', () => {
    const heightList = [200, 300, 4000];
    const snapPointList = [0, heightList[0], heightList[0] + heightList[1]];

    const scrollAnimationDuration = number('scrollAnimationDuration', 350);
    const wheelEndDebounceTime = number('wheelEndDebounceTime', DEFAULT_WHEEL_DEBOUNCE_TIME_MS);

    const ScrollAnimationEventWatcher: React.FC<{
      wheelEndDebounceTime: number;
    }> = ({ wheelEndDebounceTime }) => {
      const { animateScroll, animationTargetPosition } = useLastFreeScrollSnap({
        scrollContainerElement: document,
        animationDurationMs: scrollAnimationDuration,
        snapPointList,
        animationTriggerMinSpeedY: 0.3,
        wheelEndDebounceTime: wheelEndDebounceTime,
      });

      const scrollButtonGroupName = 'scrollTo';
      button('scroll0', () => animateScroll({ y: snapPointList[0] }), scrollButtonGroupName);
      button('scroll1', () => animateScroll({ y: snapPointList[1] }), scrollButtonGroupName);
      button('scroll2', () => animateScroll({ y: snapPointList[2] }), scrollButtonGroupName);

      const controllerTable = {
        scroll0: () => {
          animateScroll({ y: snapPointList[0] });
        },
        scroll1: () => {
          animateScroll({ y: snapPointList[1] });
        },
        scroll2: () => {
          animateScroll({ y: snapPointList[2] });
        },
      };

      return (
        <>
          <Log name="animation" msg={animationTargetPosition} />
          {<FixedController callbackTable={controllerTable} />}
        </>
      );
    };

    return (
      <>
        <GradientList heightList={heightList} />
        <ScrollAnimationEventWatcher wheelEndDebounceTime={wheelEndDebounceTime} />
      </>
    );
  })

  .add('TODO: container element', () => {
    return (
      <>
        <div />
      </>
    );
  });
