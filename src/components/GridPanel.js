import React from "react";
import { connect } from "react-redux";

function GridLoopMarker({ id, color, soft }) {
  const opacity = soft ? 0.3 : 1;
  return <div className="GridLoopMarker" style={{ backgroundColor: color, opacity }} />;
}

function Grid({ beat, barBeat, loopTriggers, loopTails, active }) {
  return (
    <div className={`Grid ${active ? 'active' : ''}`}>
      {loopTriggers.map((l) => (
        <GridLoopMarker key={l.id} {...l} />
      ))}
      {loopTails.map((l) => (
        <GridLoopMarker key={l.id} {...l} soft={true} />
      ))}
    </div>
  );
}

function GridPanel({ activeBeat, width, grid, beats, beatsPerBar }) {
  return (
    <div className="GridPanel" style={{ width }} >
      {grid.map((g) => (
        <Grid key={g.beat} active={(activeBeat + 1) === g.beat} {...g} />
      ))}
    </div>
  );
}

const inRange = (start, end, val) => (val >= start) && (val <= end);

const mapStateToProps = (state) => {
  const activeLoops = state.grid.grid.map((g) =>
    g.loopTriggers.map((id) => {
      const originLoop = state.loop.loops.find((l) => l.id === id);
      const range = [
        g.beat,
        (g.beat + originLoop.length - 1) % state.grid.grid.length,
      ];
      console.log(range, g, originLoop);

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

export default connect(mapStateToProps)(GridPanel);
