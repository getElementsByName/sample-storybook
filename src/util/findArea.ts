interface GetPointIndexArgumentType {
    areaPointList: number[];
    checkPoint: number;
    acceptOffset?: number;
}

function getAreaIndexFromPoint({
    checkPoint,
    areaPointList: pointList,
    acceptOffset: offset = 5,
}: GetPointIndexArgumentType) {
    for (let i = 0; i < pointList.length; i++) {
        const nowPoint = pointList[i];

        const delta = Math.abs(checkPoint - nowPoint);

        if (delta <= offset) {
            return i;
        }
    }

    return null;
}

interface GetClosestPointIndexArgumentType {
    areaPointList: number[];
    checkPoint: number;
}

function getClosestAreaIndexFromPoint({ checkPoint, areaPointList: pointList }: GetClosestPointIndexArgumentType) {
    const deltaList = [];

    for (let i = 0; i < pointList.length; i++) {
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
        minIndex,
        minDelta,
    };
}

export { getAreaIndexFromPoint, getClosestAreaIndexFromPoint };
