import * as React from 'react';

interface PropsType {
    callbackTable: { [buttonTitle: string]: () => void };
}

const FixedController: React.FC<PropsType> = ({ callbackTable }) => {
    const buttonElementList = [];
    for (let title in callbackTable) {
        const callback = callbackTable[title];

        buttonElementList.push(
            <div>
                <button onClick={callback} style={{ fontSize: 30, margin: 10 }}>
                    {title}
                </button>
            </div>,
        );
    }
    return <div style={{ position: 'fixed', right: 0 }}>{buttonElementList}</div>;
};

export { FixedController };
