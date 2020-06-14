
//
// buffer: Float32Array
//
export function sliceBuffer(inBuffer, duration, sampleRate, latency) {
  const outBuffer = new Float32Array(duration * sampleRate);
  for (let t = 0; t < duration * sampleRate; t++) {
    outBuffer[t]  = inBuffer[t + Math.floor((latency * sampleRate) / 1000)];
  }
  return outBuffer;
}
