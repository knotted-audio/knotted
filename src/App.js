import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import "./App.css";

import LoopPanel from "./components/LoopPanel";
import GridPanel from "./components/GridPanel";

import { setTempo, togglePlay } from "./actions/grid";

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

function App({ playing, tempo, togglePlayA, setTempoA }) {
  // TODO: Make draggable
  const width = useWindowSize().width;

  const cls = playing ? "pause" : "";
  return (
    <div className="Wrapper">
      <header className="Controls">
        <button className={`PlayButton ${cls}`} onClick={togglePlayA} />
        <button className={`MetronomeButton`} onClick={() => ({})} />
        <button className="Tempo" onClick={() => setTempoA(tempo + 10)}>
          BPM {tempo}
        </button>
      </header>
      <div className="App">
        <GridPanel width={width / 2} activeBeat={0} />
        <LoopPanel width={width / 2} />
      </div>
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  togglePlayA: () => dispatch(togglePlay()),
  setTempoA: (tempo) => dispatch(setTempo(tempo)),
});
const mapStateToProps = state => ({
  playing: state.grid.playing,
  tempo: state.grid.tempo,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
