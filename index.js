import {ScheduledMetronome} from './metronome.js';
import {CanvasAnimation} from './graph_1.js';

let audioCtx;
let animation;
let gainNode;

const startStopButton = document.getElementById("startStopButton");

startStopButton.addEventListener('click', function() {

    if (this.dataset.playing === 'false') {
        this.dataset.playing ='true';
        this.innerHTML = "Stop"

        audioCtx = new (window.AudioContext || window.webkitAudioContext);
        start(audioCtx);
        animation = new CanvasAnimation(audioCtx);


        // Animate the input signal by connecting the metronome ticks and
        // the mediaStreamSource to the common animation handler
        let source;

        if (navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            let constraints = {audio: true};
            navigator.mediaDevices.getUserMedia(constraints)
                .then (
                    function(stream) {
                        source = audioCtx.createMediaStreamSource(stream);
                        source.connect(animation.analyser2);
                    })
        }

        gainNode = audioCtx.createGain();
        gainNode.gain.value = parseFloat(document.getElementById("metronomeGain").value);

        metronome.output.connect(gainNode);
        metronome.output.connect(animation.analyser1);
        gainNode.connect(audioCtx.destination);

        console.log("AudioContext.sampleRate ", audioCtx.sampleRate);
        animation.draw();



    } else if (this.dataset.playing === 'true') {
        this.dataset.playing = 'false';
        this.innerHTML = "Start";

        stop();
    }
}, false);

let clickTimes = [];
let metronome;

function start(audioCtx) {
    clickTimes = [];
    metronome = new ScheduledMetronome(audioCtx);
    metronome.tempo = parseFloat(document.getElementById('bpm').value);
    metronome.setDecayFn(document.getElementById("decay").value)

    metronome.start((t) => {
        clickTimes.push(t);
        console.log(t);
    });

}

function stop() {
    animation.stop();
    metronome.stop();

    console.log("stop()");
    console.log(clickTimes);
}

document.getElementById("metronomeGain").addEventListener("input", function () {
    gainNode.gain.value = parseFloat(document.getElementById("metronomeGain").value);
})

document.getElementById("bpm").addEventListener("change", function () {
    if (metronome) metronome.tempo = parseFloat(document.getElementById('bpm').value);
    if (startStopButton.dataset.playing === 'true') {
        //clickTimes = [];
        metronome.restart();
    }
})

document.getElementById("decay").addEventListener("change", function () {
    const decayFn = document.getElementById("decay").value;
    if (metronome) metronome.setDecayFn(decayFn);

    if (startStopButton.dataset.playing === 'true') {
        metronome.restart();
    }
})
