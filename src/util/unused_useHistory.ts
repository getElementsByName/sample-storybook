// import * as React from 'react';

// interface ArgumentType<T> {
//     data: T;
//     changeCheckCallback: (preOne: T, newOne: T) => boolean;
//     isSaveStart?: boolean;
//     saveWindowSize: number;
// }

// class Queue<T> {
//     private list: T[] = [];
//     private size: number;
//     public constructor({ size }: { size: number }) {
//         if (size < 0) {
//             console.warn('The queue size must be > 0');
//             this.size = 0;
//         } else {
//             this.size = size;
//         }
//     }

//     public push(item: T) {
//         const list = this.list;
//         const size = this.size;

//         list.push(item);

//         if (list.length >= size) {
//             list.shift();
//         }
//     }
// }

// function useHistory<T>({ data, changeCheckCallback, isSaveStart = true, saveWindowSize }: ArgumentType<T>) {
//     const startDataRef = React.useRef<T>(data);

//     const saveListRef = React.useRef<Queue<T> | null>(null);
//     React.useEffect(() => {
//         saveListRef.current = new Queue<T>({ size: 2 });
//     }, []);

//     React.useEffect(() => {
//         if (changeCheckCallback(previousDataRef.current, data)) {
//             previousDataRef.current = data;
//         }
//     }, [data, changeCheckCallback]);

//     const [state, resetStart] = React.useReducer((state, startData: T) => {
//         startDataRef.current = startData;
//         return null;
//     }, null);

//     return {
//         startData: startDataRef.current,
//         previousData: previousDataRef.current,
//         nowData: data,
//         resetStart,
//     };
// }

// export { useHistory };
