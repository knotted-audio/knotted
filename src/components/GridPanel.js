import React from "react";
import { connect } from "react-redux";
import { useDrop } from "react-dnd";

import { setGridElem, addLoopInstance } from "../actions/grid";

function GridLoopMarker({ id, color, soft, numMarkers }) {
  const opacity = soft ? 0.3 : 1;
  return (
    <div
      className={`GridLoopMarker ${numMarkers > 4 ? 'half' : ''}`}
      style={{ backgroundColor: color, opacity }}
    />
  );
}

function Grid({
  beat,
  barBeat,
  loopTriggers,
  loopTails,
  activeLoop,
  setGridElemA,
  addLoopInstanceA,
  onClick,
}) {

  // Add loop instances when they are dragged onto the grid
  const drop = useDrop({
    accept: ['LOOP'],
    drop: (item) => addLoopInstanceA(beat, item.id)
  })[1];

  const numMarkers = loopTriggers.length + loopTails.length;

  // Save a ref (into redux) so the scheduler can manipule the "active" class to
  // animate the sequencer
  return (
    <div
      ref={(ref) => {
        setGridElemA(beat, ref);
        drop(ref);
      }}
      className="Grid"
      onClick={onClick}
    >
      {loopTriggers.map((l) => (
        <GridLoopMarker key={l.instanceId} {...l} numMarkers={numMarkers} />
      ))}
      {loopTails.map((l) => (
        <GridLoopMarker key={l.instanceId} {...l} soft={true} numMarkers={numMarkers} />
      ))}
    </div>
  );
}

function GridPanel({
  activeLoop,
  width,
  grid,
  beats,
  beatsPerBar,
  setGridElemA,
  addLoopInstanceA,
}) {
  return (
    <div className="GridPanel" style={{ width, height: width }}>
      {grid.map((g) => (
        <Grid
          key={g.beat}
          {...g}
          setGridElemA={setGridElemA}
          addLoopInstanceA={addLoopInstanceA}
          onClick={() => activeLoop && addLoopInstanceA(g.beat, activeLoop)}
        />
      ))}
    </div>
  );
}

const inRange = (start, end, val) => val >= start && val <= end;

const mapStateToProps = (state) => {
  const tempo = state.grid.tempo;

  const activeLoops = state.grid.grid
    .map((g) =>
      g.loopTriggers.map(({ id, instanceId }) => {
        const originLoop = state.loop.loops.find((l) => l.id === id);
        const beatDuration = 60.0 / tempo;
        const lengthInBeats = Math.round(originLoop.buffer.duration / beatDuration);

        const range = [
          g.beat,
          (g.beat + lengthInBeats - 1) % state.grid.grid.length,
        ];

        return {
          range,
          instanceId,
          ...originLoop,
        };
      })
    )
    .flat();

  const grid = state.grid.grid.map((g) => {
    const loopTriggers = activeLoops.filter((l) => l.range[0] === g.beat);
    const loopTails = activeLoops.filter((l) =>
      inRange(l.range[0] + 1, l.range[1], g.beat) ||
      (l.range[0] > l.range[1] && g.beat > l.range[0]) ||
      (l.range[0] > l.range[1] && g.beat < l.range[1])
    );

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
