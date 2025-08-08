import { WormholeExit } from "react-window-wormhole";

// const createWormholeComponents = <TP extends TransferableObject>(): {
//   WormholeEntry: FC<TP>;
//   WormholeExit: FC<{ children: (props: TP | null) => JSX.Element }>;
// } => {
//   return {
//     WormholeEntry: (props) => WormholeEntry<TP>,
//     WormholeExit: (props) => {
//       return (
//         <WormholeExit<TP>>
//           {(transferred) => (
//             <div className="App">
//               <header className="App-header">
//                 <h2>child page</h2>
//                 {transferred && (
//                   <div>
//                     <h4>Received data:</h4>
//                     <pre style={{ textAlign: "left" }}>
//                       {JSON.stringify(transferred, null, 2)}
//                     </pre>
//                     <button onClick={() => transferred.onAdd(-1)}>minus</button>
//                   </div>
//                 )}
//               </header>
//             </div>
//           )}
//         </WormholeExit>
//       );
//     },
//   };
// };

export interface Props {
  count: number;
  onAdd: (val: number) => null;
}

export function Child() {
  return (
    <WormholeExit<Props>>
      {(data) => (
        <div className="App">
          <header className="App-header">
            <h2>child page</h2>
            <div>
              <h4>Received data:</h4>
              <pre style={{ textAlign: "left" }}>
                {JSON.stringify(data, null, 2)}
              </pre>
              <button onClick={() => data.onAdd(-1)}>minus</button>
            </div>
          </header>
        </div>
      )}
    </WormholeExit>
  );
}
