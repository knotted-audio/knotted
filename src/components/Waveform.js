import React, { useRef, useLayoutEffect, memo } from "react";

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

  useLayoutEffect(() => {
    const context = canvas.current.getContext("2d");

    var w = width * zoom;
    var middle = height / 2.0;

    var channelData = buffer.getChannelData(0);
    var step = Math.ceil(channelData.length / w);

    context.fillStyle = color;
    draw(width, step, middle, channelData, context);

    if (onDone) {
      onDone();
    }
  });

  const dw = Math.floor(pixelRatio * width * zoom);
  const dh = Math.floor(pixelRatio * height);
  const style = { width: width * zoom, height };
  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

function draw(width, step, middle, data, ctx) {
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

// Use the loop ID equality as a proxy for the buffer equality
export default memo(
  (props) => <Waveform {...props} />,
  (prevProps, nextProps) => 
    (
      prevProps.id === nextProps.id &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.color === nextProps.color
    )
  
);
