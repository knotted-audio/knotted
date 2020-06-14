import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

import LoopPanel from "./components/LoopPanel";
import GridPanel from "./components/GridPanel";
import Controls from "./components/Controls";
import "./App.css";

import { togglePlay } from "./actions/grid";
import { runLatencyTest } from "./audioUtils";

function useWindowSize() {
  const isClient = typeof window === "object";

  const getSize = useCallback(() => {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }, [isClient]);

  const [windowSize, setWindowSize] = useState(getSize);
  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [getSize, isClient]);

  return windowSize;
}

function App({ playing, mediaStream, togglePlayA }) {
  const { width, height } = useWindowSize();
  const gridWidth = Math.min(0.75 * width, height - 120);

  const [isTestingLatency, setIsTestingLatency] = useState(false);

  const onRunLatencyTest = async () => {
    if (playing) {
      togglePlayA();
    }
    setIsTestingLatency(true);
    await runLatencyTest(mediaStream);
    setIsTestingLatency(false);
  };

  const latency = window.localStorage.getItem('Knotted-Latency');
  return (
    <div className="Wrapper">
      {isTestingLatency ? null : (
        <header className="Controls">
          <h2>Knotted.live</h2>
          <div>
            <Controls width={Math.min(width, 650)} />
          </div>
          <button className="MainButton" onClick={onRunLatencyTest}>Configure Latency ({latency} ms)</button>
        </header>
      )}
      <div className="App">
        {isTestingLatency ? (
          <h2>Testing... Please wait</h2>
        ) : (
          <DndProvider backend={Backend}>
            <GridPanel width={gridWidth} activeBeat={0} />
            <LoopPanel width={width - gridWidth} />
          </DndProvider>
        )}
      </div>
      <footer>
        By <a href="https://jtfell.com">jtfell</a>
      </footer>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  togglePlayA: () => dispatch(togglePlay()),
});
const mapStateToProps = (state) => ({
  playing: state.grid.playing,
  mediaStream: state.grid.mediaStream,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
