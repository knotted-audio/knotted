import React from "react";
import { connect } from "react-redux";

import Loop from "./Loop";

function LoopPanel({ loops, width }) {
  const height = 75;
  return (
    <div className="LoopPanel" style={{ width }}>
      {loops.map((l) => (
        <Loop key={l.id} {...l} width={width - 20} height={height} />
      ))}
    </div>
  );
}

const mapStateToProps = (state) => ({
  loops: state.loop.loops,
});

export default connect(mapStateToProps)(LoopPanel);
