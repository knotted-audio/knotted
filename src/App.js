import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";

import ReactControlPanel, { Range, Checkbox } from "react-control-panel";

import LoopPanel from "./components/LoopPanel";
import GridPanel from "./components/GridPanel";
import "./App.css";

import { setTempo, togglePlay, toggleMetronome, setGain } from "./actions/grid";

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

function App({ playing, gain, tempo, metronome, togglePlayA, setGainA, setTempoA, toggleMetronomeA }) {
  // TODO: Make draggable
  const width = useWindowSize().width;

  const cls = playing ? "pause" : "";
  return (
    <div className="Wrapper">
      <header className="Controls">
        <button className={`PlayButton ${cls}`} onClick={togglePlayA} />

        <ReactControlPanel
          theme="light"
          onChange={(key, val) => {
            if (key === "tempo") {
              setTempoA(val);
            }
            if (key === "metronome") {
              toggleMetronomeA();
            }
            if (key === "gain") {
              setGainA(val);
            }
          }}
          state={{
            tempo,
            gain,
            metronome,
          }}
        >
          <Range label="tempo" min={40} max={260} step={1} />
          <Range label="gain" min={0} max={1} />
          <Checkbox label="metronome" />
        </ReactControlPanel>
      </header>
      <div className="App">
        <GridPanel width={width / 2} activeBeat={0} />
        <LoopPanel width={width / 2} />
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  togglePlayA: () => dispatch(togglePlay()),
  toggleMetronomeA: () => dispatch(toggleMetronome()),
  setTempoA: (tempo) => dispatch(setTempo(tempo)),
  setGainA: (gain) => dispatch(setGain(gain)),
});
const mapStateToProps = (state) => ({
  playing: state.grid.playing,
  tempo: state.grid.tempo,
  metronome: state.grid.metronome,
  gain: state.grid.gain,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
