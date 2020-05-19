import React from 'react';
import Waveform from './Waveform';

function Loop({ id, length, muted, color, buffer, width, height }) {
  return (
    <div className="Loop" style={{ height, width, paddingTop: 20 }}>
      <Waveform width={width} height={height - 20} color={color} buffer={buffer} />
    </div>
  );
}

export default Loop;
