export type ScrollContainerElementType = Element | Document;

export interface PositionXY {
    y: number;
    x: number;
}

export const getScrollPosition = (element: ScrollContainerElementType): PositionXY => {
    if (element === document) {
        return {
            y: window.scrollY,
            x: window.scrollX,
        };
    }

    return {
        y: (element as Element).scrollTop,
        x: (element as Element).scrollLeft,
    };
};
