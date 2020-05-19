
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function createBuffer() {
  // Create an empty three-second stereo buffer at the sample rate of the AudioContext
  const myArrayBuffer = audioCtx.createBuffer(
    2,
    audioCtx.sampleRate * 1,
    audioCtx.sampleRate
  );

  // Fill the buffer with white noise;
  // just random values between -1.0 and 1.0
  for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
    // This gives us the actual array that contains the data
    const nowBuffering = myArrayBuffer.getChannelData(channel);
    for (let i = 0; i < myArrayBuffer.length; i = i + 5) {
      // Math.random() is in [0; 1.0]
      // audio needs to be in [-1.0; 1.0]
      const sample = Math.random() * 2 - 1;
      nowBuffering[i] = sample;
      nowBuffering[i + 1] = sample;
      nowBuffering[i + 2] = sample;
      nowBuffering[i + 3] = sample;
      nowBuffering[i + 4] = sample;
    }
  }
  return myArrayBuffer;
}

const initialState = {
  loops: [
    {
      id: "LKJHG",
      length: 4, // beats
      muted: false,
      color: "#3D9970",
      buffer: createBuffer(),
    },
    {
      id: "ABCED",
      length: 4, // beats
      muted: false,
      color: "#F012BE",
      buffer: createBuffer(),
    },
    {
      id: "CRUYN",
      length: 8, // beats
      muted: true,
      color: "#FF4136",
      buffer: createBuffer(),
    },
  ],
};

export default (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};
