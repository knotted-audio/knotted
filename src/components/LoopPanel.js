import React, { useEffect } from "react";
import { connect } from "react-redux";

import Waveform from "./Waveform";

import { createLoop } from "../actions/loop";
import { setActiveLoop } from "../actions/grid";

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function getData() {
  const request = new XMLHttpRequest();
  request.open("GET", "Amen-break.mp3", true);
  request.responseType = "arraybuffer";

  return new Promise((resolve, reject) => {
    request.onload = function () {
      const audioData = request.response;

      audioCtx.decodeAudioData(
        audioData,
        function (buffer) {
          resolve(buffer);
        },
        function (e) {
          reject("Error with decoding audio data" + e.err);
        }
      );
    };

    request.send();
  });
}

function Loop({
  id,
  length,
  active,
  color,
  buffer,
  width,
  height,
  setActiveLoopA,
}) {
  return (
    <div
      className={`Loop ${active ? "active" : ""}`}
      style={{ height, width, paddingTop: 20 }}
      onClick={() => setActiveLoopA(id)}
    >
      <Waveform
        width={width}
        height={height - 20}
        color={color}
        buffer={buffer}
      />
    </div>
  );
}

function LoopPanel({ loops, width, activeLoop, createLoopA, setActiveLoopA }) {
  const height = 75;

  useEffect(() => {
    getData().then((buffer) => createLoopA(buffer));
  }, [createLoopA]);

  return (
    <div className="LoopPanel" style={{ width }}>
      {loops.map((l) => (
        <Loop
          key={l.id}
          setActiveLoopA={setActiveLoopA}
          active={activeLoop === l.id}
          {...l}
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
});
const mapDispatchToProps = (dispatch) => ({
  createLoopA: (buffer) => dispatch(createLoop(buffer)),
  setActiveLoopA: (loopId) => dispatch(setActiveLoop(loopId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoopPanel);
