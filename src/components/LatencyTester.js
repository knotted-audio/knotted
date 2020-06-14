import React from "react";
import { connect } from "react-redux";

import { runLatencyTest } from "../audioUtils";

function LatencyTester({
  mediaStream,
}) {

  return (
    <div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
});
const mapStateToProps = (state) => ({
  mediaStream: state.grid.mediaStream,
});

export default connect(mapStateToProps, mapDispatchToProps)(LatencyTester);
