import Constants from './../Constants.js';

export default class ViewLoaderService extends fw.core.serviceCore {
    constructor() {
        super(Constants.services.GAME_SERVICE);
    }

    loadLevelData(url) {
        return this.httpGet(url);
    }
}