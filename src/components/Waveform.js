import React, { useRef, useLayoutEffect } from "react";

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

    // context.save();
    // context.fillStyle = "hsl(0, 0%, 95%)";
    // context.fillRect(0, 0, width, height);
    //
    // context.strokeStyle = "black";
    // context.beginPath();
    // context.arc(width / 2, height / 2, width / 4, 0, Math.PI * 2);
    // context.stroke();
    // context.restore();

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

// getDefaultProps: function () {
// },
//
// propTypes: {
//   buffer: React.PropTypes.object.isRequired,
//   width: React.PropTypes.number,
//   height: React.PropTypes.number,
//   zoom: React.PropTypes.number,
//   color: React.PropTypes.string,
//   onDone: React.PropTypes.func
// },

// componentDidMount: function () {
// },
//
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

export default Waveform;
