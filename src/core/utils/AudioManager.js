import Sound from './Sound.js';
import Backoff from './../Backoff.js';

export default class AudioManager {
    constructor() {
        this.loader = new Backoff();
        this._context = null;
        this._sounds = {};
        this._masterGain = null;
    }

    get isWebAudioSupported() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            return new AudioContext();

        } catch(e) {
            console.warn("WebAudio is not supported");
            return null;
        }
    }

    /**
     * Will start playing the sound requested by id.
     * If the sound was already loaded, we play it from cache if autoStart is true,
     * otherwise we will load the sound first and then play it if autoStart is true.
     *
     * @method playSound.
     * @param {string} id The id or url from where to load the sound.
     * @param {boolean} loop Whether to loop the playback. Default is false.
     * @param {number} volume The amount of damage we want to cause to ears. 0 for no sound, 1 for normal volume. Default is 1.
     * @param {boolean} autoStart Automatically starts playing when <code>true</code>. Default is true.
     */
    playSound(id, loop = false, volume = 1, autoStart = true) {
        if (!this._context) {
            this._context = this.isWebAudioSupported;
            this._masterGain = this._context.createGain();
        }
        if (this._sounds[id]) {
            this._sounds[id].loop = loop = this._sounds[id].sourceNode.loop = loop;
            this._sounds[id].setVolume(volume);
            this._sounds[id].autoStart = autoStart;
            this._sounds[id].masterGain = this._masterGain;

            if (autoStart) {
                this._sounds[id].play();
            }
            return;
        } else {
            this._loadSounds(id).then((result) => {
                this.playSound(id, loop, volume, autoStart);
            });
        }
    };

    muteSounds() {
        this._masterGain.gain.setValueAtTime(0, 0);
    };

    unmuteSounds() {
        this._masterGain.gain.setValueAtTime(1, 0);
    };

    stopSound(id) {
        if (this._sounds[id]) {
            this._sounds[id].stop();
        }
    };

    getAllSounds() {
        return this._sounds;
    };

    setVolume(id, value) {
        if (this._sounds[id]) {
            this._sounds[id].setVolume(value);
        }
    }

    /**
     * Loads and decodes sounds from an array of URLs.
     * @param {Array} sounds. An array of urls to a soundfile.
     * @returns {Promise} A promise with all loaded objects of type Sound,
     *					  once resolved ALL sounds are loaded and decoded. .
     */
    _loadSounds(sound) {
        return new Promise((resolve, reject) => {
            this.loader.getURL(sound)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this._context.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    var snd = new Sound(sound, audioBuffer, this._context);
                    this._sounds[sound] = snd;
                    resolve(this._sounds);
                });
        });
    }
}