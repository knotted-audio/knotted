import React, { useEffect } from "react";
import { connect } from "react-redux";

import ReactControlPanel, {
  Select,
  Range,
  Checkbox,
  Custom,
} from "react-control-panel";

import {
  setTempo,
  togglePlay,
  toggleMetronome,
  setLoopLength,
  setGain,
  setInputDevices,
  setMediaStream,
  setMidiDevices,
} from "../actions/grid";
import { getDeviceStream } from "../audioUtils";

function Controls({
  playing,
  loopLength,
  gain,
  width,
  tempo,
  metronome,
  mediaStream,
  midiDeviceList,
  activeInputDevice,
  inputDeviceList,

  togglePlayA,
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
    getDeviceStream(activeInputDevice)
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
    }

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

  return (
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
        if (key === "play") {
          togglePlayA();
        }
      }}
      state={{
        latency: false,
        tempo,
        gain,
        metronome,
        "loop length": loopLength,
        play: playing,
      }}
    >
      <Custom label="play" Comp={({ value, onChange }) =>
          <button className={`PlayButton ${value ? 'pause' : ''}`} onClick={togglePlayA} />
       } />
      <Checkbox label="metronome" />

      <Range label="loop length" min={4} max={16} step={4} />
      <Range label="tempo" min={40} max={260} step={1} />
      <Range label="gain" min={0} max={1} />

      <Select label="input" options={deviceOpts} />
      <Select label="inputmidi" options={midiDeviceOpts} />

    </ReactControlPanel>
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
  mediaStream: state.grid.mediaStream,
  inputDeviceList: state.grid.inputDeviceList,
  midiDeviceList: state.grid.midiDeviceList,
  activeInputDevice: state.grid.activeInputDevice,
});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
