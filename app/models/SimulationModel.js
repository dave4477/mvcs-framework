import Constants from './../Constants.js';

export default class SimulationModel extends fw.core.modelCore {
    constructor() {
        super(Constants.models.SIMULATION_MODEL);

        this._isPaused = false;
        this._levelData = null;
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

    set levelData(value) {
        this._levelData = value;
        this.dispatch(Constants.events.LEVEL_DATA_RECEIVED);
    }

    get levelData() {
        return this._levelData;
    }
}