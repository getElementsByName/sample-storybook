export type ScrollListenableContainerElementType = Element | Document;

export interface PositionXY {
    y: number;
    x: number;
}

// typescript syntax(user-defined-type-guards): https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
function isDocument(element: ScrollListenableContainerElementType): element is Document {
    return element === document;
}

export const getScrollPosition = (element: ScrollListenableContainerElementType): PositionXY => {
    if (isDocument(element)) {
        return {
            y: window.scrollY,
            x: window.scrollX,
        };
    } else {
        return {
            y: element.scrollTop,
            x: element.scrollLeft,
        };
    }
};
