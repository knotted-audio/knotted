//
// Use offscreen canvas and web worker to do the canvas rendering on a
// worker thread
//
// http://shimi.io/blog/offscreen-canvas-react-three-js-web-workers
//
export function draw(width, step, middle, data, ctx) {
  for (var i = 0; i < width; i += 1) {
    var min = 1.0;
    var max = -1.0;

    for (var j = 0; j < step; j += 1) {
      var datum = data[i * step + j];

      if (datum < min) {
        min = datum;
      } else if (datum > max) {
        max = datum;
      }

      ctx.fillRect(i, (1 + min) * middle, 1, Math.max(1, (max - min) * middle));
    }
  }
}

/* eslint no-restricted-globals: off */
self.onmessage = function (e) {
  if (e.data.type === "waveform-render") {
    const { width, step, middle, data, fillStyle, canvas } = e.data.payload;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = fillStyle;
    draw(width, step, middle, data, ctx);
    self.postMessage({ type: "waveform-rendered" });
  }
};
