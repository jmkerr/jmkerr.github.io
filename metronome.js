// Credits to https://meowni.ca/posts/metronomes/

class BaseMetronome {
    constructor(audioCtx) {
        this.audioCtx = audioCtx;
        this.tick = null;
        this.output = null;
        this.soundHz = 622.25; // D#
        this.tempo = 92;
    }

    initAudio(audioCtx) {
        this.audioCtx = audioCtx;
        this.tick = this.audioCtx.createOscillator();
        this.output = this.audioCtx.createGain();

        this.tick.type = 'sine';
        this.tick.frequency.value = this.soundHz;
        this.output.gain.value = 0;
        this.setDecayFn("fexp");

        this.tick.connect(this.output);
        //this.tickVolume.connect(this.audioCtx.destination); // this is handled by the user of the class
        this.tick.start(0);
    }

    click(callbackFn) {
        const time = this.audioCtx.currentTime;
        this.clickAtTime(time);

        if (callbackFn) {
            callbackFn(time);
        }
    }

    clickAtTime(time) {
        // Silence the click
        this.output.gain.cancelScheduledValues(time);
        this.output.gain.setValueAtTime(0, time);

        // Audio click sound
        this.output.gain.linearRampToValueAtTime(1, time + .001);
        //this.output.gain.exponentialRampToValueAtTime(0.0001, time + .001 + 0.1);
        this.decayFn(time);
    }

    setDecayFn(decayFnString) {
        switch (decayFnString) {
            case "fexp":
                this.decayFn = function (t) {
                    this.output.gain.exponentialRampToValueAtTime(0.0001, t + 0.001 + 0.1)
                };
                break;
            case "sexp":
                this.decayFn = function (t) {
                    this.output.gain.exponentialRampToValueAtTime(0.0001, t + 0.001 + 0.3)
                }
                break;
            case "lin":
                this.decayFn = function (t) {
                    this.output.gain.linearRampToValueAtTime(0.0, t + 0.001 + 0.1)
                };
                break;
        }
    }

    stop() {}
}



export class ScheduledMetronome extends BaseMetronome {
    constructor(audioCtx, ticks = 1000) {
        super(audioCtx);
        this.scheduledTicks = ticks;
        this.initAudio(audioCtx);
    }

    start(callbackFn) {
        this.callbackFn = callbackFn;
        this.scheduleClicks();
    }

    restart() {
        this.stop();
        this.scheduleClicks();
    }
    
    stop() {
        super.stop();

        // stop the callback function calls
        this.setTimeoutIDs.forEach((id) => {clearTimeout(id)});

        // stop the clicks
        this.clickTimes.forEach((t) => {
            this.output.gain.cancelScheduledValues(t);
        });

        // Even though scheduled clicks have been cancelled, the currently playing click has to be muted.
        this.output.gain.value = 0;
    }

    scheduleClicks() {
        const timeoutDuration = (60 / this.tempo);

        this.setTimeoutIDs = [];
        this.clickTimes = [];

        let now = this.audioCtx.currentTime;
        for (let i = 0; i < this.scheduledTicks; i++) {
            this.clickAtTime(now);
            this.clickTimes.push(now);

            const x = now;
            this.setTimeoutIDs.push(setTimeout(() => this.callbackFn(x), i * timeoutDuration * 1000));
            now += timeoutDuration;
        }
    }
}
