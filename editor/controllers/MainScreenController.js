import Constants from './../Constants.js';

export default class MainScreenController extends fw.core.controllerCore {
    constructor() {
        super();
    }

    checkRotation() {
        this.getViewByName("MainScreen").checkRotation();
    }
}