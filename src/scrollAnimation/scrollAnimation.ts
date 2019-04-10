type ScrollContainerElementType = Element;

interface Position {
    x: number;
    y: number;
}

function isEdge() {
    return false;
}

function easeInCubic(t: number, b: number, c: number, d: number) {
    const td = t / d;
    return c * td * td * td + b;
}

function position(start: number, end: number, elapsed: number, duration: number) {
    if (elapsed > duration) {
        return end;
    }
    return easeInCubic(elapsed, start, end - start, duration);
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

function smoothScroll({ callback, scrollContainerElement, end, scrollTime }: ArgumentType) {
    const start = {
        y: scrollContainerElement.scrollTop,
        x: scrollContainerElement.scrollLeft,
    };

    const duration = isEdge() ? 0 : scrollTime;
    let startTime: number | null = null;

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

        scrollContainerElement.scrollTo(deltaScrollPosition.x, deltaScrollPosition.y);

        // check if we are over due;
        if (elapsed < duration) {
            requestAnimationFrameForAllBrowser(step);
        } else {
            // console.log('animation end');
            // console.log('animation callback', callback);
            if (typeof callback === 'function') {
                // is there a callback?

                // stop execution and run the callback
                return callback(end);
            }
        }
    }
    const scheduleId = requestAnimationFrameForAllBrowser(step);

    return {
        cancel: () => {
            cancelAnimationFrameForAllBrowser(scheduleId);
        },
    };
}

export { smoothScroll };
