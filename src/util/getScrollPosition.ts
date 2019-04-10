export type ScrollContainerElementType = Element | Document;

export interface PositionXY {
    y: number;
    x: number;
}

// typescript syntax(user-defined-type-guards): https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
function isDocument(element: ScrollContainerElementType): element is Document {
    return element === document;
}

export const getScrollPosition = (element: ScrollContainerElementType): PositionXY => {
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
