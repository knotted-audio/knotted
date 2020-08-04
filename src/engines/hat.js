export class HiHat {
    constructor(ctx) {
        this.ctx = ctx;
        this.ratios = [1, 1.3420, 1.2312, 1.6532, 1.9523, 2.1523];
        this.tone = 130.81;
        this.decay = 0.5;
        this.volume = 1;
        this.fxAmount = 0;

        this.hasSetup = false;
    }

    setup() {
        this.oscEnvelope = this.ctx.createGain();
        this.bndPass = this.ctx.createBiquadFilter();
        this.bndPass.type = 'bandpass';
        this.bndPass.frequency.value = 20000;
        this.bndPass.Q.value = 0.2;
        this.hipass = this.ctx.createBiquadFilter();
        this.hipass.type = "highpass";
        this.hipass.frequency.value = 5000;
        this.panner = this.ctx.createStereoPanner();

        this.bndPass.connect(this.hipass);
        this.hipass.connect(this.oscEnvelope);
        this.oscEnvelope.connect(this.panner);
        this.panner.connect(this.ctx.destination);
        this.hasSetup = true;
    }

    trigger(time) {
        if (this.volume === 0) { return };
        if (!this.hasSetup) {
          this.setup();
        }

        this.panner.pan.value = Math.cos(time * 4) * this.fxAmount/100;
        this.ratios.forEach((ratio) => {
            var osc = this.ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = this.tone * ratio;
            osc.connect(this.bndPass);
            osc.start(time);
            osc.stop(time + this.decay);
        });
        this.oscEnvelope.gain.setValueAtTime(0.00001 * this.volume, time);
        this.oscEnvelope.gain.exponentialRampToValueAtTime(1 * this.volume, time + 0.067 * this.decay);
        this.oscEnvelope.gain.exponentialRampToValueAtTime(0.3 * this.volume, time + 0.1 * this.decay);
        this.oscEnvelope.gain.exponentialRampToValueAtTime(0.00001 * this.volume, time + this.decay);
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
