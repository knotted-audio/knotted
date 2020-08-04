export class Kick {
    constructor(ctx) {
        this.ctx = ctx;
        this.tone = 167.1;
        this.decay = 0.5;
        this.volume = 1;
        this.fxAmount = 0;
        this.hasSetup = false;
    }

    makeDistortionCurve(amount) {
        var k = amount /4,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    };

    setup() {
        this.osc = this.ctx.createOscillator();
        this.osc.type = 'sine'
        this.gain = this.ctx.createGain();
        this.distortion = this.ctx.createWaveShaper();
        this.distortion.curve = this.makeDistortionCurve(this.fxAmount);

        this.osc.connect(this.gain);
        this.gain.connect(this.distortion);
        this.distortion.connect(this.ctx.destination);
        this.hasSetup = true;
    }

    trigger(time) {
        if (this.volume === 0) { return };
        if (!this.hasSetup) {
          this.setup();
        }

        this.osc.frequency.setValueAtTime(this.tone, time + 0.001);
        this.gain.gain.linearRampToValueAtTime(this.volume, time + 0.1)

        this.osc.frequency.exponentialRampToValueAtTime(1, time + this.decay);
        this.gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, time + this.decay);
        this.gain.gain.linearRampToValueAtTime(0, time + this.decay + 0.1)

        this.osc.start(time);
        this.osc.stop(time + this.decay + 0.1);
    }

    setTone = (tone) => {
        this.tone = tone;
    }

    setVolume = (vol) => {
        this.volume = vol;
    }

    setFXAmount = (amount) => {
        this.fxAmount = amount;
    }
}
