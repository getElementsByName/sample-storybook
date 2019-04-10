import React, { FC, useEffect, useState, useRef, useCallback } from 'react';
import { smoothScroll } from './scrollAnimation';

type ScrollContainerElementType = Element;

export interface ChildArgumentsType {
    scrollContainerRef: React.RefObject<HTMLElement>;
}

interface PropsType {
    scrollContainerElement?: ScrollContainerElementType;
    children: (args: ChildArgumentsType) => React.ReactElement | null;
}

function getScrollEventTarget(element: ScrollContainerElementType) {
    if (element === document.documentElement) {
        // documentElement 가 스크롤 container 인 경우 이벤트는 document 에서 발생
        return document;
    }
    return element;
}

const ScrollSnap: FC<PropsType> = ({ children, scrollContainerElement: scrollContainerElementFromProps }) => {
    const scrollContainerRef = useRef(null);
    const [scrollContainerElementInState, setScrollContainerElement] = useState<Element | null>(null);

    const scrollHandler = useCallback(() => {
        // console.log('scrolling')
    }, []);

    useEffect(() => {
        let scrollContainerElement: ScrollContainerElementType | null;

        if (scrollContainerElementFromProps) {
            scrollContainerElement = scrollContainerElementFromProps;
        } else {
            scrollContainerElement = scrollContainerRef.current;
        }
        setScrollContainerElement(scrollContainerElement);

        // console.log('scroll container', scrollContainerElement)

        const eventTargetElement = scrollContainerElement && getScrollEventTarget(scrollContainerElement);

        if (eventTargetElement) {
            eventTargetElement.addEventListener('scroll', scrollHandler);
        }

        return () => {
            if (eventTargetElement) {
                eventTargetElement.removeEventListener('scroll', scrollHandler);
            }
        };
    }, [scrollContainerElementFromProps, scrollHandler]);

    // test scroll animation
    useEffect(() => {
        if (scrollContainerElementInState) {
            smoothScroll({
                scrollContainerElement: scrollContainerElementInState,
                end: {
                    y: 400,
                },
                scrollTime: 300,
            });
        }

        return () => {};
    }, [scrollContainerElementInState]);

    return children({
        scrollContainerRef,
    });
};

export { ScrollSnap };
