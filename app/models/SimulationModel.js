import Constants from './../Constants.js';

export default class SimulationModel extends fw.core.modelCore {
    constructor() {
        super("SimulationModel");

        this._isPaused = false;
    }

    get isPaused() {
        return this._isPaused;
    }

    set isPaused(value) {
        this._isPaused = value;
        if (value == true) {
            this.dispatch(Constants.events.SIMULATION_PAUSED);
        } else {
            this.dispatch(Constants.events.SIMULATION_RESUMED);
        }
    }
}