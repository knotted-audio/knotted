import React, { useEffect } from "react";
import { useDrag } from "react-dnd";
import { connect } from "react-redux";

import Waveform from "./Waveform";

import { createLoop } from "../actions/loop";
import { setActiveLoop } from "../actions/grid";

// var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// function getData() {
//   const request = new XMLHttpRequest();
//   request.open("GET", "Amen-break.mp3", true);
//   request.responseType = "arraybuffer";
//
//   return new Promise((resolve, reject) => {
//     request.onload = function () {
//       const audioData = request.response;
//
//       audioCtx.decodeAudioData(
//         audioData,
//         function (buffer) {
//           resolve(buffer);
//         },
//         function (e) {
//           reject("Error with decoding audio data" + e.err);
//         }
//       );
//     };
//
//     request.send();
//   });
// }

function Loop({
  id,
  index,
  length,
  active,
  color,
  buffer,
  width,
  height,
  tempo,
  setActiveLoopA,
}) {
  const beatDuration = 60.0 / tempo;
  const lengthInBeats = Math.round(buffer.duration / beatDuration);

  // Allow loops to be dragged onto the grid
  const [{ opacity }, drag] = useDrag({
    item: { id, type: 'LOOP' },
  });

  return (
    <div
      ref={drag}
      className={`Loop ${active ? "active" : ""}`}
      style={{ opacity, height, width, paddingTop: 20 }}
      onClick={() => setActiveLoopA(id)}
    >
      <Waveform
        id={id}
        width={width}
        height={height - 20}
        color={color}
        buffer={buffer}
      />
      <div>Loop {index} {'//'} {lengthInBeats} beats</div>
    </div>
  );
}

function LoopPanel({ loops, width, tempo, activeLoop, createLoopA, setActiveLoopA }) {
  const height = 75;

  // useEffect(() => {
  //   getData().then((buffer) => createLoopA(buffer));
  // }, [createLoopA]);

  return (
    <div className="LoopPanel" style={{ width }}>
      {loops.map((l, index) => (
        <Loop
          key={l.id}
          index={index}
          setActiveLoopA={setActiveLoopA}
          active={activeLoop === l.id}
          {...l}
          tempo={tempo}
          width={width - 20}
          height={height}
        />
      ))}
    </div>
  );
}

const mapStateToProps = (state) => ({
  loops: state.loop.loops,
  activeLoop: state.grid.activeLoop,
  tempo: state.grid.tempo,
});
const mapDispatchToProps = (dispatch) => ({
  createLoopA: (buffer) => dispatch(createLoop(buffer)),
  setActiveLoopA: (loopId) => dispatch(setActiveLoop(loopId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoopPanel);
