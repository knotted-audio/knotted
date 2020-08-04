//
// Middleware to convert midi events into redux actions
//

import {
  SET_MIDI_DEVICES,
  toggleMetronome,
  togglePlay,
  setLoopLength,
  TRIGGER_NOTE,
  triggerNote,
} from "../actions/grid";

import { recordMidiNote } from "../actions/loop";

import { getAudioCtx } from "../audioUtils";
import { HiHat, Snare, Kick, Clap, Cymbal } from "../engines";

//
// From Midi.js
//
const KEY_TO_NOTE = {}; // C8  == 108
const NOTE_TO_KEY = {}; // 108 ==  C8

const A0 = 0x15; // first note
const C8 = 0x6c; // last note
const number2key = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
for (let n = A0; n <= C8; n++) {
  const octave = ((n - 12) / 12) >> 0;
  const name = number2key[n % 12] + octave;
  KEY_TO_NOTE[name] = n;
  NOTE_TO_KEY[n] = name;
}

const NOTE_ON = 144;
// const NOTE_OFF = 128;

const midiListener = (store) => (next) => {
  // Listen to MIDI devices and dispatch actions when MIDI messages are received.
  const listeningTo = [];
  const listen = (devices, store) => {
    for (const dev of devices) {
      let kick;
      let hihat;
      let snare;
      let clap;
      let cymbal;

      if (listeningTo.indexOf(dev.id) === -1) {
        dev.addEventListener("midimessage", (msg) => {
          const [cmd, note, velocity] = msg.data;
          const ctx = getAudioCtx();

          if (!kick) {
            const ctx = getAudioCtx();
            kick = new Kick(ctx);
            kick.setup();
            hihat = new HiHat(ctx);
            hihat.setup();
            snare = new Snare(ctx);
            snare.setup();
            clap = new Clap(ctx);
            clap.setup();
            cymbal = new Cymbal(ctx);
            cymbal.setup();
          }

          const DRUMS = {
            C2: () => {
              kick.trigger(ctx.currentTime);
              kick = new Kick(ctx);
              kick.setup();
            },
            Db2: () => {
              hihat.trigger(ctx.currentTime);
              hihat = new HiHat(ctx);
              hihat.setup();
            },
            D2: () => {
              snare.trigger(ctx.currentTime);
              snare = new Snare(ctx);
              snare.setup();
            },
            // Eb2: () => cymbal.trigger(ctx.currentTime),
            E2: () => {
              clap.trigger(ctx.currentTime);
              clap = new Clap(ctx);
              clap.setup();
            },
          };

          if (cmd === NOTE_ON && velocity > 0) {
            store.dispatch(triggerNote(NOTE_TO_KEY[note], velocity, ctx.currentTime));
            const action = DRUMS[NOTE_TO_KEY[note]];
            if (action) {
              action();
            }
          }
        });
        listeningTo.push(dev.id);
      }
    }
  };

  return (action) => {
    next(action);

    if (action.type === SET_MIDI_DEVICES) {
      listen(action.payload.devices, store);
    }

    if (action.type === TRIGGER_NOTE) {
      const { note, triggerTime } = action.payload;
      const { loopLength, recordingMidi, playing } = store.getState().grid;

      const schedule = (engine) => {
        if (recordingMidi && playing) {
          return recordMidiNote(engine, triggerTime);
        }
      };

      // TODO:
      //
      //  - make this configurable in the app
      //  - show current mapping in UI
      //
      //  Mapping for what each key does:
      const NOTE_MAPPING = {
        // Loop / playback commands
        C1: () => togglePlay(),
        D1: () => toggleMetronome(),

        E1: () => setLoopLength(loopLength / 2),
        F1: () => setLoopLength(loopLength * 2),

        // Drum samples
        C2: () => schedule(Kick),
        Db2: () => schedule(HiHat),
        D2: () => schedule(Snare),
        Eb2: () => schedule(Cymbal),
        E2: () => schedule(Clap),
      };

      const newAction = NOTE_MAPPING[note];
      if (newAction) {
        const actionResult = newAction();
        if (actionResult) {
          store.dispatch(actionResult);
        }
      } else {
        console.log(`Unmapped midi note ${note}`);
      }
    }
  };
};

export default midiListener;
