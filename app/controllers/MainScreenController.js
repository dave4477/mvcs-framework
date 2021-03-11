import Constants from './../Constants.js';

export default class MainScreenController extends fw.core.controllerCore {
    constructor() {
        super();
    }

    show() {
        this.getViewByName("MainScreen").show();
        this.getViewByName("MainScreen").checkRotation();
    }

    hide() {
        this.getViewByName("MainScreen").show();
    }
}