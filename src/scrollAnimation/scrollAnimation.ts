import { easeOutCubic } from './easingFunctions';

type ScrollContainerElementType = Element | Window;

interface Position {
    x: number;
    y: number;
}

function isEdge() {
    return false;
}

function position(start: number, end: number, elapsed: number, duration: number) {
    if (elapsed > duration) {
        return end;
    }

    const normalizedDeltaTime = elapsed / duration; // [0, 1]
    const normalizedNowTimeAfterEasing = easeOutCubic(normalizedDeltaTime);
    const distance = end - start;
    const distanceDelta = distance * normalizedNowTimeAfterEasing;
    return start + distanceDelta;
}

// get animation frame or a fallback
const requestAnimationFrameForAllBrowser: (callback: Function) => number =
    window.requestAnimationFrame ||
    (window as any).mozRequestAnimationFrame || // TODO: typing
    window.webkitRequestAnimationFrame ||
    function requestAnimationFrameImplementedBySetTimeout(fn: Function) {
        return window.setTimeout(fn, 15);
    };

// get animation frame or a fallback
const cancelAnimationFrameForAllBrowser: (id: number) => void =
    window.cancelAnimationFrame ||
    (window as any).mozCancelAnimationFrame || // TODO: typing
    window.webkitCancelAnimationFrame ||
    function requestAnimationFrameImplementedBySetTimeout(id: number) {
        window.clearTimeout(id);
    };

interface ArgumentType {
    scrollContainerElement: ScrollContainerElementType;
    scrollTime: number;
    end: Partial<Position>;
    callback?: Function;
}

function getScrollPosition(element: ScrollContainerElementType) {
    if (element === window) {
        return {
            x: element.scrollX,
            y: element.scrollY,
        };
    } else {
        return {
            x: (element as Element).scrollLeft,
            y: (element as Element).scrollTop,
        };
    }
}

// disable acceleration
function getResetScrollCurrentPosition(element: ScrollContainerElementType) {
    const nowScrollPosition = getScrollPosition(element);

    element.scrollTo(nowScrollPosition.x, nowScrollPosition.y);
}

function smoothScroll({ callback, scrollContainerElement, end, scrollTime }: ArgumentType) {
    const start = getScrollPosition(scrollContainerElement);
    // getResetScrollCurrentPosition(scrollContainerElement);

    const duration = isEdge() ? 0 : scrollTime;
    let startTime: number | null = null;

    let scheduleId: number | null = null;
    // setup the stepping function
    function step(timestamp: number) {
        // console.log('animation step');

        if (!startTime) {
            startTime = timestamp;
        }
        const elapsed = timestamp - startTime;

        const deltaScrollPosition = {
            x: start.x,
            y: start.y,
        };
        // change position on y-axis if result is a number.
        if (end.y !== undefined && !Number.isNaN(end.y)) {
            deltaScrollPosition.y = position(start.y, end.y, elapsed, duration);
        }

        // change position on x-axis if result is a number.
        if (end.x !== undefined && !Number.isNaN(end.x)) {
            deltaScrollPosition.x = position(start.x, end.x, elapsed, duration);
        }

        // console.log('deltaScrollPosition', deltaScrollPosition);

        scrollContainerElement.scrollTo(deltaScrollPosition.x, deltaScrollPosition.y);

        // check if we are over due;
        if (elapsed < duration) {
            scheduleId = requestAnimationFrameForAllBrowser(step);
        } else {
            // const nowScrollPosition = getScrollPosition(scrollContainerElement);

            // const lastPosition = {
            //     x: end.x !== undefined ? end.x : nowScrollPosition.x,
            //     y: end.y !== undefined ? end.y : nowScrollPosition.y,
            // };

            // scrollContainerElement.scrollTo(lastPosition.x, lastPosition.y);

            scheduleId = null;
            if (typeof callback === 'function') {
                // is there a callback?

                // stop execution and run the callback
                return callback(end);
            }
        }
    }
    scheduleId = requestAnimationFrameForAllBrowser(step);

    return {
        cancel: () => {
            // console.log('cancelAnimationFrame', scheduleId);
            if (scheduleId) {
                cancelAnimationFrameForAllBrowser(scheduleId);
            } else {
                console.warn('already done animation');
            }
        },
    };
}

export { smoothScroll };
