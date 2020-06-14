//
// Use offscreen canvas and web worker to do the canvas rendering on a
// worker thread
//
// http://shimi.io/blog/offscreen-canvas-react-three-js-web-workers
//
import React, { useRef, useLayoutEffect, memo } from "react";

/* eslint import/no-webpack-loader-syntax: off */
import Worker from "workerize-loader!./Waveform.worker";

const Waveform = (props = {}) => {
  const {
    buffer = null,
    width = 500,
    height = 100,
    zoom = 1,
    color = "black",
    onDone = null,
    pixelRatio = window.devicePixelRatio,
  } = props;

  const canvas = useRef(null);
  const worker = new Worker();

  useLayoutEffect(() => {
    const w = width * zoom;
    const middle = height / 2.0;

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / w);

    // Creating an OffscreenCanvas element.
    // Rendering changes in this object will be reflected
    // and displayed on the original canvas.
    const offscreenCanvas = canvas.current.transferControlToOffscreen();

    // worker.postMessage is a method which
    // sends a message to the worker's inner scope.
    worker.postMessage(
      {
        type: "waveform-render",
        payload: {
          canvas: offscreenCanvas,
          width,
          step,
          middle,
          data,
          fillStyle: color,
        },
      },
      [offscreenCanvas]
    );

    if (onDone) {
      // worker.onmessage event will be invoked by the worker
      // whenever the rendering process is done.
      worker.onmessage = (event) => {
        if (event.data.type === "waveform-rendered") {
          onDone();
        }
      };
      onDone();
    }
  });

  const dw = Math.floor(pixelRatio * width * zoom);
  const dh = Math.floor(pixelRatio * height);
  const style = { width: width * zoom, height };
  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

// Use the loop ID equality as a proxy for the buffer equality
export default memo(
  (props) => <Waveform {...props} />,
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.color === nextProps.color
);
