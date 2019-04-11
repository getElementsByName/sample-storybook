interface GetAreaStartPointIndexArgumentType {
    areaPointList: number[];
    checkPoint: number;
    acceptOffset?: number;
}

function getAreaStartPointIndex({
    checkPoint,
    areaPointList: pointList,
    acceptOffset: offset = 5,
}: GetAreaStartPointIndexArgumentType) {
    for (let i = 0; i < pointList.length; i++) {
        const nowPoint = pointList[i];

        const delta = Math.abs(checkPoint - nowPoint);

        if (delta <= offset) {
            return i;
        }
    }

    return null;
}

interface GetAreaIndexByPointArgumentType {
    areaPointList: number[];
    checkPoint: number;
}

function getAreaIndexByPoint({ checkPoint, areaPointList: pointList }: GetAreaIndexByPointArgumentType) {
    // 오름 차순 정렬
    const sortedPointList = [...pointList].sort(function(a, b) {
        return a - b;
    });

    for (let i = 0; i < sortedPointList.length; i++) {
        const nowPoint = sortedPointList[i];

        if (nowPoint > checkPoint) {
            return i;
        }
    }

    return sortedPointList.length - 1;
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

export { getAreaStartPointIndex, getClosestAreaIndexFromPoint, getAreaIndexByPoint };
