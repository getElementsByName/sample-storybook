import * as React from 'react';

interface ArgumentType {
  heightList: number[];
}

const GradientList: React.FC<ArgumentType> = ({ heightList }) => {
  const elementList = [];

  for (let i = 0; i < heightList.length; i++) {
    const nowHeight = heightList[i];
    elementList.push(
      <div
        key={i}
        style={{
          top: `${nowHeight[i]}px`,
          height: `${nowHeight}px`,
          width: '100%',
          background: 'linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
          fontSize: 40,
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        {i}
      </div>,
    );
  }

  return <div>{elementList}</div>;
};

export { GradientList };
