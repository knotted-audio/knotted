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
      if (listeningTo.indexOf(dev.id) === -1) {
        dev.addEventListener("midimessage", (msg) => {
          const [cmd, note, velocity] = msg.data;
          if (cmd === NOTE_ON && velocity > 0) {
            store.dispatch(triggerNote(NOTE_TO_KEY[note], velocity));
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
      // TODO:
      //
      //  - toggle input mode:
      //    > instrument (keyboard / sample pad)
      //    > controller (start / stop / record / multiply / undo)
      //
      //  This allows us to start lighting up keys on the sample pad etc based on mode
      //
      const ctx = getAudioCtx();
      const { note } = action.payload;

      const { loopLength } = store.getState().grid;
      const time = ctx.currentTime;

      const kick = new Kick(ctx);
      const hihat = new HiHat(ctx);
      const snare = new Snare(ctx);
      const clap = new Clap(ctx);
      const cymbal = new Cymbal(ctx);


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
        C2: () => kick.trigger(time),
        Db2: () => hihat.trigger(time),
        D2: () => snare.trigger(time),
        Eb2: () => cymbal.trigger(time),
        E2: () => clap.trigger(time),
      };

      const newAction = NOTE_MAPPING[note];
      console.log(newAction);
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
