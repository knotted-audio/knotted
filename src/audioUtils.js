/* eslint import/no-webpack-loader-syntax: off */
import worker from "workerize-loader!./worker";
const workerInstance = new worker();

const SCHEDULE_AHEAD_TIME = 0.1;
const BLIP_LENGTH = 0.01;

//
// Global value set by the latency test.
//
let audioCtx = null;
export function getAudioCtx() {
  if (audioCtx) return audioCtx;

  audioCtx = new AudioContext({ latencyHint: 0 });
  return audioCtx;
}

export function getDeviceStream(deviceId) {
  const AUDIO_CONFIG = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    latency: 0,
  };
  return navigator.mediaDevices.getUserMedia({
    audio: { AUDIO_CONFIG, deviceId },
  });
}

export function triggerMidi(
  tracks,
  beats,
  secondsPerBeat,
  quantization,
  nextBeat,
  nextBeatTime,
  loopDuration,
  loopStartTime
) {
  for (let i = 0; i < tracks.length; i++) {
    const { muted, timeline } = tracks[i];

    const times = Object.keys(timeline);
    if (muted || times.length === 0) {
      continue;
    }

    const loopNum = Math.floor((nextBeatTime - loopStartTime) / loopDuration);
    // console.log(loopNum, loopDuration);

    times
      .filter((t) => {
        // Shift the trigger time to the current audio context time (relative to the
        // start of the loop)
        const tShifted = parseFloat(t) + loopStartTime + loopDuration * loopNum;

        const tShiftedNext = parseFloat(t) + loopStartTime + loopDuration * (loopNum + 1);

        // Schedule notes 1 beat ahead
        const thisLoop = (
          tShifted > nextBeatTime + secondsPerBeat &&
          tShifted <= nextBeatTime + secondsPerBeat * 2
        );

        const nextLoop = (
          tShiftedNext > nextBeatTime + secondsPerBeat &&
          tShiftedNext <= nextBeatTime + secondsPerBeat * 2
        );

        return thisLoop || nextLoop;
      })
      .forEach((time) => {
        const ctx = getAudioCtx();
        // Preconfigured sounds to play
        const engines = timeline[time];

        // Shift the time to be relative to this loop
        const tShifted = parseFloat(time) + loopStartTime + loopDuration * loopNum;

        // Quantize the notes so they are in time with the click
        //
        // TODO: Generalise to be configurable to different quantization settings
        const offsetFromBeat = (nextBeatTime + secondsPerBeat) - tShifted;
        const offsetAsFraction = offsetFromBeat / secondsPerBeat;
        let tQuantized = nextBeatTime + secondsPerBeat;
        if (offsetAsFraction < 0.125) {
        } else if (offsetAsFraction < (3/8)) {
          tQuantized += 0.25 * secondsPerBeat;
        } else if (offsetAsFraction < (5/8)) {
          tQuantized += 0.5 * secondsPerBeat;
        } else if (offsetAsFraction < (7/8)) {
          tQuantized += 0.75 * secondsPerBeat;
        } else {
          tQuantized += 1 * secondsPerBeat;
        }

        engines.forEach((engine) => {
          const instance = new engine(ctx);
          instance.trigger(tQuantized);
        });
      });
  }
}

export function triggerMetronome(
  audioCtx,
  b,
  nextBeatTime,
  beats,
  beatsPerBar
) {
  const osc = audioCtx.createOscillator();
  osc.connect(audioCtx.destination);

  if (b % beats === 0) {
    osc.frequency.value = 880.0;
  } else if (b % beatsPerBar === 0) {
    osc.frequency.value = 440.0;
  } else {
    osc.frequency.value = 220.0;
  }

  osc.start(nextBeatTime);
  osc.stop(nextBeatTime + BLIP_LENGTH);
}

export function triggerLoopsAtBeat(
  grid,
  loops,
  nextBeat,
  beats,
  audioCtx,
  gain,
  nextNoteTime
) {
  const { loopTriggers } = grid[nextBeat % beats];

  loopTriggers
    .map(({ id }) => loops.find((l) => l.id === id))
    .forEach(({ buffer }) => {
      const source = audioCtx.createBufferSource();

      // set the buffer in the AudioBufferSourceNode
      source.buffer = buffer;

      // TODO: Find a better place to apply global gain
      // start the source playing
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
      source.connect(gainNode).connect(audioCtx.destination);
      source.start(nextNoteTime);
    });
}

function recordRawInputStream(stream, audioCtx, duration) {
  const recorder = new MediaRecorder(stream);
  recorder.start(duration * 1000);
  let endTime;
  return new Promise(
    (resolve) =>
      (recorder.ondataavailable = (evt) => {
        endTime = audioCtx.currentTime;

        if (recorder.state === "recording") {
          recorder.stop();
        }
        resolve(evt.data);
      })
  )
    .then((d) => d.arrayBuffer())
    .then(
      (d) =>
        new Promise((resolve, err) =>
          audioCtx.decodeAudioData(
            d,
            (result) => resolve([result, endTime]),
            err
          )
        )
    );
}

export function recordInputStream(stream, audioCtx, start, end) {
  // This should record the full loop with a small gap at the start and end
  const secondsUntilEnd = end - audioCtx.currentTime;
  const recordingLength = secondsUntilEnd + 2 * SCHEDULE_AHEAD_TIME;
  const LATENCY_MS = window.localStorage.getItem("Knotted-Latency");

  return recordRawInputStream(stream, audioCtx, recordingLength).then(
    async ([d, endTime]) => {
      // Calculate the difference in requested and recorded durations
      // const durOffset = d.duration - recordingLength;
      // const durOffset = -0.180;
      // console.log(durOffset);

      const sampleRate = d.sampleRate;
      const outputAudioBuffer = audioCtx.createBuffer(
        1,
        (end - start) * sampleRate,
        sampleRate
      );

      const inB = d.getChannelData(0);
      const outB = outputAudioBuffer.getChannelData(0);
      for (let t = 0; t < (end - start) * sampleRate; t++) {
        outB[t] = inB[t + Math.floor((LATENCY_MS * sampleRate) / 1000)];
      }

      // Offset the recording by the global system latency value
      // Do the processing in a web-worker to avoid locking the event loop
      // const outB = await workerInstance.sliceBuffer(
      //   inB,
      //   end - start,
      //   sampleRate,
      //   LATENCY_MS
      // );
      // outputAudioBuffer.copyFromChannel(outB, 0);

      return outputAudioBuffer;
    }
  );
}

function sumAudio(buffer) {
  return buffer.reduce((sum, sample) => sum + Math.abs(sample), 0);
}

/**
 * Play a sine wave and record the delay in hearing it
 *
 * Adapted from:
 *
 *   https://github.com/superpoweredSDK/WebBrowserAudioLatencyMeasurement
 */
export async function runLatencyTest(stream) {
  const audioCtx = getAudioCtx();
  const osc = audioCtx.createOscillator();
  osc.frequency.value = 440.0;
  osc.connect(audioCtx.destination);

  const cTime = audioCtx.currentTime;

  // Sequence of events:
  //
  //  - 2 seconds of silence (cTime + 2)
  //  - 1 second of 440hz sine wave (cTime + 3)
  //  - finish recording and sine wave (cTime + 4)
  const recordedBufferP = recordRawInputStream(stream, audioCtx, 4);
  osc.start(cTime + 2);
  osc.stop(cTime + 3);

  // Wait for the recording to finish
  const [recordedBufferRes, endTime] = await recordedBufferP;
  const recordedBuffer = recordedBufferRes.getChannelData(0);

  // Now we have a buffer with roughly 1 second of sound louder than the rest. We
  // want to isolate that and determine its timestamp then compare that to when it
  // should have been recorded (cTime + 2 -> cTime + 3). The difference will be the
  // recording latency

  const { sampleRate } = recordedBufferRes;
  // The recording takes a small amount of time to start, so the timing in the buffer
  // is shifted slightly later. I'm still not sure how to apply this. We will need to
  // account for this in our loop slicing somehow.
  const recordingOffset = (endTime - 4) * 1000;

  // Calculate the baseline audio amplitude during the "silence period", then
  // take an audio energy rise of 24 decibels to be the threshold for identifying
  // the start of the oscillator starting
  const firstSecondOfAudio = recordedBuffer.slice(0, sampleRate);
  const averageAudioValue = sumAudio(firstSecondOfAudio) / sampleRate;
  const referenceDecibel = 20.0 * Math.log10(averageAudioValue) + 24.0;
  const threshold = Math.pow(10.0, referenceDecibel / 20.0);

  let latency = null;
  // Look from (cTime + 1) to (cTime + 4) for the start of the oscillator pulse
  for (let i = sampleRate; i < sampleRate * 4; i++) {
    if (recordedBuffer[i] > Math.abs(threshold)) {
      latency = Math.round(Math.abs(2000 - (i * 1000) / sampleRate));
      break;
    }
  }

  window.localStorage.setItem("Knotted-Latency", latency);
  window.localStorage.setItem("Knotted-RecordingOffset", recordingOffset);

  return latency;
}

export async function loadSound(ctx, url) {
  const response = await fetch(url);
  const rawBuffer = await response.arrayBuffer();
  return await ctx.decodeAudioData(rawBuffer);
}
