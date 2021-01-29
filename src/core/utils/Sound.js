
export default class Sound {
    constructor(id, buffer, context) {
        this.id = id;
        this._autoStart = true;
        this._context = context;
        this._mainGain = context.createGain();
        this._masterGain = null;

        this.sourceNode = context.createBufferSource();
        this.sourceNode.buffer = buffer;

        this._isPlaying = false;
    }

    set autoStart(value) {
        this._autoStart = value;
    }

    set masterGain(value) {
        this._masterGain = value;
    }

    connectNodes(source) {
        source.connect(this._mainGain);
        if (this._masterGain) {
            this._mainGain.connect(this._masterGain);
        }
        this._masterGain.connect(this._context.destination);
    }

    play(offset = 0) {
        if (this._context && this._context.state === 'suspended') {
            this._context.resume();
        }
        if (this._context) {
            const newSource = this._context.createBufferSource();
            newSource.buffer = this.sourceNode.buffer;
            this.sourceNode = newSource;
            this.connectNodes(newSource);
            newSource.start();
        } else {
            this.sourceNode.play();
        }
        this._isPlaying = true;
        console.log(`[Sound] playing sound ${this.id}`);
    };

    stop() {
        this.sourceNode.stop();
        this._isPlaying = false;
        console.log(`[Sound] ${this.id} was stopped`);
    }

    setVolume(value) {
        this._mainGain.gain.setValueAtTime(value, 0);
    }
}