export class CanvasAnimation {
    constructor(audioCtx) {
        this.canvas = document.getElementById("canvas1");
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.clearRect(0,0, this.canvas.width, this.canvas.height);

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Prepare Buffers

        this.visualArray1Max = new Uint8Array(this.width);
        this.visualArray1Min = new Uint8Array(this.width);
        this.visualArray2Max = new Uint8Array(this.width);
        this.visualArray2Min = new Uint8Array(this.width);
        this.writeIndex = 0;

        this.visualizationBufferSize = this.width / 3;

        // Prepare Analyzers

        const fftSize = 2**9;

        this.analyser1 = audioCtx.createAnalyser();
        this.analyser1.fftSize = fftSize;
        this.dataArray1 = new Uint8Array(fftSize);

        this.analyser2 = audioCtx.createAnalyser();
        this.analyser2.fftSize = fftSize;
        this.dataArray2 = new Uint8Array(fftSize);
    }

    draw(timestamp) {
        this.animationFrameRequestID = window.requestAnimationFrame(this.draw.bind(this));

        if (this.timestamp > timestamp - 16 || !this.analyser1) {
            return;
        } else {
            document.getElementById("frameTime").innerText = timestamp - this.timestamp + '';
            this.timestamp = timestamp;
        }

        this.canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        this.canvasCtx.fillRect(0, 0, this.width, this.height);

        this.analyser1.getByteTimeDomainData(this.dataArray1);
        this.analyser2.getByteTimeDomainData(this.dataArray2);

        this.visualArray1Max[this.writeIndex] = Math.max(...this.dataArray1);
        this.visualArray1Min[this.writeIndex] = Math.min(...this.dataArray1);
        this.visualArray2Max[this.writeIndex] = Math.max(...this.dataArray2);
        this.visualArray2Min[this.writeIndex] = Math.min(...this.dataArray2);

        this.writeIndex = this.writeIndex >= this.visualizationBufferSize ? 0 : this.writeIndex + 1;

        // Draw 1
        this.canvasCtx.beginPath();
        this.canvasCtx.lineWidth = 1;
        this.canvasCtx.strokeStyle = 'rgb(0,0,0)';
        //const sliceWidth = this.width / this.bufferLength;
        const sliceWidth = 3;
        let x = 0;

        for (let i = 0; i < this.visualizationBufferSize; i++) {
            let effectiveIndex = (i + this.writeIndex) % this.visualizationBufferSize;

            let y_max = this.visualArray1Max[effectiveIndex] / 256.0 * this.height; // scale 0..256 down to 0..1, up to 0..height
            let y_min = this.visualArray1Min[effectiveIndex] / 256.0 * this.height;

            this.canvasCtx.moveTo(x, y_max);
            this.canvasCtx.lineTo(x, y_min);

            x += sliceWidth;
        }
        this.canvasCtx.stroke();

        // Draw 2
        this.canvasCtx.beginPath();
        this.canvasCtx.lineWidth = 1;
        this.canvasCtx.strokeStyle = 'rgb(255,81,0)';
       
        x = 1;
        for (let i = 0; i < this.visualizationBufferSize; i++) {
            let effectiveIndex = (i + this.writeIndex) % this.visualizationBufferSize;

            let y_max = this.visualArray2Max[effectiveIndex] / 256.0 * this.height;
            let y_min = this.visualArray2Min[effectiveIndex] / 256.0 * this.height;

            this.canvasCtx.moveTo(x, y_max);
            this.canvasCtx.lineTo(x, y_min);

            x += sliceWidth;
        }
        this.canvasCtx.stroke();
    };



    stop() {
        window.cancelAnimationFrame(this.animationFrameRequestID);
    }
}
