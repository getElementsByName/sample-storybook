interface ElementRange {
    min?: number;
    max?: number;
}

interface EntryRange {
    entryMin?: number;
    entryMax?: number;
}

interface RangeInfo extends ElementRange, EntryRange {}

interface ArgumentsType {
    rangeList: RangeInfo[];
    startPosition: number;
    endPosition: number;
}

function isInPosition(range: ElementRange, position: number) {
    if (range.min !== undefined) {
        if (range.max !== undefined) {
            return range.max >= position && range.min <= position;
        } else {
            return range.min <= position;
        }
    } else {
        if (range.max !== undefined) {
            return range.max >= position;
        } else {
            throw Error(`the min and max of range are both undefined (${range})`);
        }
    }
}

function isEntryPosition(range: EntryRange, position: number) {
    return isInPosition(
        {
            min: range.entryMin,
            max: range.entryMax,
        },
        position,
    );
}

function getStartRangeIndex(rangeList: ElementRange[], startPosition: number) {
    for (let i = 0; i < rangeList.length; i++) {
        const elementRange = rangeList[i];

        if (isInPosition(elementRange, startPosition)) {
            return i;
        }
    }

    return null;
}
function getEntryRangeIndex(rangeList: EntryRange[], endPosition: number, startRangeIndex: number) {
    for (let i = 0; i < rangeList.length; i++) {
        if (i !== startRangeIndex) {
            const entryRange = rangeList[i];

            if (isEntryPosition(entryRange, endPosition)) {
                return i;
            }
        }
    }

    return null;
}

function getRangeInfo({ rangeList, startPosition, endPosition }: ArgumentsType) {
    const startRangeIndex = getStartRangeIndex(rangeList, startPosition);

    if (startRangeIndex === null) {
        console.warn("can't not find start range");
        return null;
    }

    const entryRangeIndex = getEntryRangeIndex(rangeList, endPosition, startRangeIndex);

    if (entryRangeIndex === null) {
        // console.warn("can't not find entry range");  // same position
        return null;
    }

    return {
        startRangeIndex,
        entryRangeIndex,
        startRange: rangeList[startRangeIndex],
        entryRange: rangeList[entryRangeIndex],
    };
}

export { getRangeInfo };
