interface GetPointIndexArgumentType {
    pointList: number[];
    checkPoint: number;
    offset?: number;
}

function getPointIndex({ checkPoint, pointList, offset = 5 }: GetPointIndexArgumentType) {
    for (let i = 0; i < pointList.length; i++) {
        // TODO: 리스트가 오름차순이면 최적화 가능
        const nowPoint = pointList[i];

        const delta = Math.abs(checkPoint - nowPoint);

        if (delta <= offset) {
            return i;
        }
    }

    return null;
}

interface GetClosestPointIndexArgumentType {
    pointList: number[];
    checkPoint: number;
}

function getClosestPointIndex({ checkPoint, pointList }: GetClosestPointIndexArgumentType) {
    const deltaList = [];

    for (let i = 0; i < pointList.length; i++) {
        // TODO: 리스트가 오름차순이면 최적화 가능
        const nowPoint = pointList[i];

        const delta = checkPoint - nowPoint;

        deltaList.push(delta);
    }

    let minDelta: number | null = null;
    let minIndex: number | null = null;
    for (let i = 0; i < deltaList.length; i++) {
        const nowDelta = deltaList[i];

        if (minDelta === null || Math.abs(nowDelta) < Math.abs(minDelta)) {
            minDelta = nowDelta;
            minIndex = i;
        }
    }

    return {
        minIndex, // TODO: only number type
        minDelta,
    };
}

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
    const startIndex = getPointIndex({
        checkPoint: startPosition,
        offset: startOffset,
        pointList: snapPointList,
    });

    const { minIndex: endIndex, minDelta: targetDelta } = getClosestPointIndex({
        checkPoint: endPosition,
        pointList: snapPointList,
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

export { getPointIndex, getClosestPointIndex, getLastFreeScrollSnapAnimationInfo };
