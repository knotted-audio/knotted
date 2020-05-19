import React from "react";
import { connect } from "react-redux";

import { setGridElem, addLoopInstance } from "../actions/grid";

function GridLoopMarker({ id, color, soft }) {
  const opacity = soft ? 0.3 : 1;
  return <div className="GridLoopMarker" style={{ backgroundColor: color, opacity }} />;
}

function Grid({ beat, barBeat, loopTriggers, loopTails, activeLoop, setGridElemA, onClick }) {
  // Save a ref (into redux) so the scheduler can manipule the "active" class to
  // animate the sequencer
  return (
    <div ref={ref => setGridElemA(beat, ref)} className="Grid" onClick={onClick}>
      {loopTriggers.map((l) => (
        <GridLoopMarker key={l.id} {...l} />
      ))}
      {loopTails.map((l) => (
        <GridLoopMarker key={l.id} {...l} soft={true} />
      ))}
    </div>
  );
}

function GridPanel({ activeLoop, width, grid, beats, beatsPerBar, setGridElemA, addLoopInstanceA }) {
  return (
    <div className="GridPanel" style={{ width }} >
      {grid.map(g => (
        <Grid key={g.beat} {...g} setGridElemA={setGridElemA} onClick={() => activeLoop && addLoopInstanceA(g.beat, activeLoop)} />
      ))}
    </div>
  );
}

const inRange = (start, end, val) => (val >= start) && (val <= end);

const mapStateToProps = (state) => {
  const tempo = state.grid.tempo;

  const activeLoops = state.grid.grid.map((g) =>
    g.loopTriggers.map((id) => {
      const originLoop = state.loop.loops.find((l) => l.id === id);
      const beatDuration = 60.0 / tempo;
      const lengthInBeats = originLoop.buffer.duration / beatDuration; 

      const range = [
        g.beat,
        (g.beat + lengthInBeats - 1) % state.grid.grid.length,
      ];

      return {
        range,
        ...originLoop,
      };
    })
  ).flat();

  const grid = state.grid.grid.map((g) => {
    const loopTriggers = activeLoops.filter(l => l.range[0] === g.beat);
    const loopTails = activeLoops.filter(l => inRange(l.range[0] + 1, l.range[1], g.beat));

    return {
      ...g,
      loopTriggers,
      loopTails,
    };
  });

  return {
    ...state.grid,
    grid,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setGridElemA: (index, domElem) => dispatch(setGridElem(index, domElem)),
  addLoopInstanceA: (beat, loopId) => dispatch(addLoopInstance(beat, loopId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GridPanel);
