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
  setLoopLength,
  setGain,
  setInputDevices,
  setMediaStream,
  setMidiDevices,
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
  loopLength,
  gain,
  tempo,
  metronome,
  mediaStream,
  midiDeviceList,
  activeInputDevice,
  togglePlayA,
  inputDeviceList,
  setGainA,
  setTempoA,
  toggleMetronomeA,
  setInputDevicesA,
  setMidiDevicesA,
  setMediaStreamA,
  setLoopLengthA,
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
    // https://glitch.com/~webmidi-examples
    // Reset.
    function initDevices(midi) {
      const midiIn = [];
      const inputs = midi.inputs.values();
      for (
        let input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        midiIn.push(input.value);
      }

      setMidiDevicesA(midiIn);

      // console.log(midiIn, midiOut);
      // for (const input of midiIn) {
      //   input.addEventListener("midimessage", midiMessageReceived);
      // }
    }

    // function midiMessageReceived(msg) {
    //   console.log(msg);
    // }

    navigator.requestMIDIAccess().then(
      (midi) => {
        // Also react to device changes.
        midi.addEventListener("statechange", (event) =>
          initDevices(event.target)
        );
        initDevices(midi);
      },
      (err) => console.log("Something went wrong", err)
    );
  }, [setMidiDevicesA]);

  // When we have permission to access the WebAudio API, get the list of connected devices
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

  const midiDeviceOpts = midiDeviceList.reduce((acc, dev) => {
    if (dev.type === "input") {
      acc[dev.name] = dev.id;
    }
    return acc;
  }, {});

  console.log(midiDeviceOpts, midiDeviceList);

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
            if (key === "loop length") {
              if (val !== 12) {
                setLoopLengthA(val);
              }
            }
          }}
          state={{
            tempo,
            gain,
            metronome,
            "loop length": loopLength,
          }}
        >
          <Select label="input" options={deviceOpts} />
          <Select label="inputmidi" options={midiDeviceOpts} />
          <Range label="loop length" min={4} max={16} step={4} />
          <Range label="tempo" min={40} max={260} step={1} />
          <Range label="gain" min={0} max={1} />
          <Checkbox label="metronome" />
        </ReactControlPanel>
      </header>
      <div className="App">
        <DndProvider backend={Backend}>
          <GridPanel width={gridWidth} activeBeat={0} />
          <LoopPanel width={width - gridWidth} />
        </DndProvider>
      </div>
      <footer>
        By <a href="https://jtfell.com">jtfell</a>
      </footer>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  togglePlayA: () => dispatch(togglePlay()),
  toggleMetronomeA: () => dispatch(toggleMetronome()),
  setTempoA: (tempo) => dispatch(setTempo(tempo)),
  setGainA: (gain) => dispatch(setGain(gain)),
  setInputDevicesA: (devices) => dispatch(setInputDevices(devices)),
  setMidiDevicesA: (devices) => dispatch(setMidiDevices(devices)),
  setMediaStreamA: (stream) => dispatch(setMediaStream(stream)),
  setLoopLengthA: (loopLength) => dispatch(setLoopLength(loopLength)),
});
const mapStateToProps = (state) => ({
  playing: state.grid.playing,
  tempo: state.grid.tempo,
  metronome: state.grid.metronome,
  gain: state.grid.gain,
  loopLength: state.grid.loopLength,
  inputDeviceList: state.grid.inputDeviceList,
  midiDeviceList: state.grid.midiDeviceList,
  activeInputDevice: state.grid.activeInputDevice,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
