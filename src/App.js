import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

import ReactControlPanel, {
  Select,
  Range,
  Checkbox,
} from "react-control-panel";

import LoopPanel from "./components/LoopPanel";
import GridPanel from "./components/GridPanel";
import "./App.css";

import {
  setTempo,
  togglePlay,
  toggleMetronome,
  setGain,
  setInputDevices,
  setMediaStream,
} from "./actions/grid";

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

function App({
  playing,
  gain,
  tempo,
  metronome,
  mediaStream,
  activeInputDevice,
  togglePlayA,
  inputDeviceList,
  setGainA,
  setTempoA,
  toggleMetronomeA,
  setInputDevicesA,
  setMediaStreamA,
}) {
  //
  // Get permission to access input audio stream
  //
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: { deviceId: activeInputDevice } })
      .then((stream) => setMediaStreamA(stream));
  }, [setMediaStreamA, activeInputDevice]);

  useEffect(() => {
    if (mediaStream) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((res) => setInputDevicesA(res));
    }
  }, [mediaStream, setInputDevicesA]);

  const { width, height } = useWindowSize();
  const gridWidth = Math.min(0.75 * width, height - 120);

  const deviceOpts = inputDeviceList.reduce((acc, dev) => {
    if (dev.kind === "audioinput") {
      acc[dev.label] = dev.deviceId;
    }
    return acc;
  }, {});

  const cls = playing ? "pause" : "";
  return (
    <div className="Wrapper">
      <header className="Controls">
        <button className={`PlayButton ${cls}`} onClick={togglePlayA} />

        <ReactControlPanel
          theme="light"
          width={width * 0.6}
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
          <Select label="input" options={deviceOpts} />
        </ReactControlPanel>
      </header>
      <div className="App">
        <DndProvider backend={Backend}>
          <GridPanel width={gridWidth} activeBeat={0} />
          <LoopPanel width={width - gridWidth} />
        </DndProvider>
      </div>
      <footer>By <a href="https://jtfell.com">jtfell</a></footer>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  togglePlayA: () => dispatch(togglePlay()),
  toggleMetronomeA: () => dispatch(toggleMetronome()),
  setTempoA: (tempo) => dispatch(setTempo(tempo)),
  setGainA: (gain) => dispatch(setGain(gain)),
  setInputDevicesA: (devices) => dispatch(setInputDevices(devices)),
  setMediaStreamA: (stream) => dispatch(setMediaStream(stream)),
});
const mapStateToProps = (state) => ({
  playing: state.grid.playing,
  tempo: state.grid.tempo,
  metronome: state.grid.metronome,
  gain: state.grid.gain,
  inputDeviceList: state.grid.inputDeviceList,
  activeInputDevice: state.grid.activeInputDevice,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
