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

export { getPointIndex, getClosestPointIndex };
