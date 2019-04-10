import { getClosestAreaIndexFromPoint, getAreaIndexFromPoint } from '../util/findArea';

function getLastFreeScrollSnapAnimationInfo({
    startPosition,
    snapPointList,
    endPosition,
    startOffset = 0,
    outOffset,
}: {
    startPosition: number;
    snapPointList: number[];
    endPosition: number;
    startOffset?: number;
    outOffset: number;
}) {
    const startIndex = getAreaIndexFromPoint({
        checkPoint: startPosition,
        acceptOffset: startOffset,
        areaPointList: snapPointList,
    });

    const { minIndex: endIndex, minDelta: targetDelta } = getClosestAreaIndexFromPoint({
        checkPoint: endPosition,
        areaPointList: snapPointList,
    });

    let nextIndex: number | null = endIndex;
    const lastIndex = snapPointList.length - 1;

    // 마지막 요소에서 움직이는 경우
    if (lastIndex === nextIndex && targetDelta !== null && targetDelta > 0) {
        nextIndex = null;
    } else if (
        // 같은 영역에서 offset을 초과한 경우
        startIndex !== null &&
        endIndex !== null &&
        startIndex === endIndex &&
        targetDelta !== null &&
        Math.abs(targetDelta) > Math.abs(outOffset)
    ) {
        nextIndex = targetDelta > 0 ? endIndex + 1 : endIndex - 1;
    }

    if (nextIndex !== null) {
        const entryPosition = snapPointList[nextIndex];

        return { animationTargetPosition: entryPosition };
    }

    return null;
}

export { getLastFreeScrollSnapAnimationInfo };
