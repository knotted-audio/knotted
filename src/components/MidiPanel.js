import React from "react";
import { connect } from "react-redux";
import { getMidiTracks } from "../reducers/loopReducer";

function Midi({
  tempo,
  quantizationMidi,
  beats,
  loopDuration,
  loopStartTime,
  secondsPerBeat,
  midiCounter,
  width,
  midiTracks,
}) {
  return (
    <div className="MidiPanel" style={{ width }}>
      {midiTracks.map(({ muted, timeline }) => {
        const samples = Object.keys(timeline).reduce((s, n) => {
          const offset = (n / loopDuration) * 100;
          timeline[n].forEach((sample) => {
            const existingHits = s[sample.name] || [];
            existingHits.push(offset);
            s[sample.name] = existingHits;
          });
          return s;
        }, {});

        return (
          <div className="MidiTrack">
            {Object.keys(samples).map((sampleName) => {
              return (
                <div className="MidiSample">
                  <span style={{ width: "20%" }}>{sampleName}</span>
                  {samples[sampleName].map((offset) => (
                    <span
                      className="MidiNote"
                      style={{
                        left: `${offset * 0.8 + 20}%`,
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const mapStateToProps = (state) => {
  const { tempo, quantizationMidi, beats } = state.grid;
  const { loopDuration, loopStartTime, midiCounter } = state.loop;
  const secondsPerBeat = 60.0 / tempo;

  const midiTracks = getMidiTracks();

  return {
    tempo,
    quantizationMidi,
    beats,
    loopDuration,
    loopStartTime,
    secondsPerBeat,
    midiCounter,
    midiTracks,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Midi);
